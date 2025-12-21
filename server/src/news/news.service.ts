import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsStatus } from '../common/enums/news-status.enum';
import { generateSlug, generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createNewsDto: CreateNewsDto) {
    // Slug oluştur
    const baseSlug = generateSlug(createNewsDto.title);
    const slug = await generateUniqueSlug(
      baseSlug,
      async (slug) => {
        const existing = await this.prisma.news.findUnique({
          where: { slug },
        });
        return !!existing;
      }
    );

    const data: any = {
      ...createNewsDto,
      slug,
      authorId: userId,
      publishedAt: createNewsDto.publishedAt ? new Date(createNewsDto.publishedAt) : null,
      scheduledAt: createNewsDto.scheduledAt ? new Date(createNewsDto.scheduledAt) : null,
    };

    // Eğer status PUBLISHED ise ve publishedAt yoksa şimdiki zamanı kullan
    if (data.status === NewsStatus.PUBLISHED && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    return this.prisma.news.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async findAll(categoryId?: string, status?: NewsStatus, limit?: number, offset?: number) {
    const where: any = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.news.count({ where }),
    ]);

    return {
      items,
      total,
      limit: limit || items.length,
      offset: offset || 0,
    };
  }

  async findPublished(categoryId?: string, limit?: number, offset?: number) {
    return this.findAll(categoryId, NewsStatus.PUBLISHED, limit, offset);
  }

  async findOne(idOrSlug: string) {
    // Önce slug ile dene, sonra id ile
    let news = await this.prisma.news.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!news) {
      throw new NotFoundException('Haber bulunamadı');
    }

    return news;
  }

  async findBySlug(slug: string) {
    const news = await this.prisma.news.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!news) {
      throw new NotFoundException('Haber bulunamadı');
    }

    return news;
  }

  async update(id: string, userId: string, updateNewsDto: UpdateNewsDto) {
    // Haberin sahibi kontrolü
    const news = await this.findOne(id);
    
    // Admin değilse sadece kendi haberlerini düzenleyebilir
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN' && news.authorId !== userId) {
      throw new ForbiddenException('Bu haberi düzenleme yetkiniz yok');
    }

    const data: any = { ...updateNewsDto };
    
    // Eğer başlık değiştiyse slug'ı güncelle
    if (updateNewsDto.title && updateNewsDto.title !== news.title) {
      const baseSlug = generateSlug(updateNewsDto.title);
      data.slug = await generateUniqueSlug(
        baseSlug,
        async (slug) => {
          const existing = await this.prisma.news.findFirst({
            where: {
              slug,
              NOT: { id },
            },
          });
          return !!existing;
        }
      );
    }
    
    if (updateNewsDto.publishedAt) {
      data.publishedAt = new Date(updateNewsDto.publishedAt);
    }
    
    if (updateNewsDto.scheduledAt) {
      data.scheduledAt = new Date(updateNewsDto.scheduledAt);
    }

    // Eğer status PUBLISHED ise ve publishedAt yoksa şimdiki zamanı kullan
    if (data.status === NewsStatus.PUBLISHED && !data.publishedAt && news.status !== NewsStatus.PUBLISHED) {
      data.publishedAt = new Date();
    }

    return this.prisma.news.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Haberin sahibi kontrolü
    const news = await this.findOne(id);
    
    // Admin değilse sadece kendi haberlerini silebilir
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN' && news.authorId !== userId) {
      throw new ForbiddenException('Bu haberi silme yetkiniz yok');
    }

    return this.prisma.news.delete({
      where: { id },
    });
  }

  async incrementViews(id: string) {
    return this.prisma.news.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  async getStats() {
    const [total, published, draft, thisMonth] = await Promise.all([
      this.prisma.news.count(),
      this.prisma.news.count({ where: { status: NewsStatus.PUBLISHED } }),
      this.prisma.news.count({ where: { status: NewsStatus.DRAFT } }),
      this.prisma.news.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      total,
      published,
      draft,
      thisMonth,
    };
  }
}

