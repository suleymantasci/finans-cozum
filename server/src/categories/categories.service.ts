import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug, generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = createCategoryDto.slug || generateSlug(createCategoryDto.name);
    
    // Slug'un benzersiz olduğundan emin ol
    const uniqueSlug = await generateUniqueSlug(
      slug,
      async (s) => !!(await this.prisma.category.findFirst({ where: { slug: s } })),
    );

    // İsim benzersizliğini kontrol et
    const existing = await this.prisma.category.findFirst({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir kategori zaten mevcut');
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug: uniqueSlug,
        isActive: createCategoryDto.isActive ?? true,
        order: createCategoryDto.order ?? 0,
      },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Kategori bulunamadı: ${id}`);
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Kategori bulunamadı: ${slug}`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    const data: any = { ...updateCategoryDto };

    // İsim değiştiyse slug'ı güncelle
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const baseSlug = updateCategoryDto.slug || generateSlug(updateCategoryDto.name);
      data.slug = await generateUniqueSlug(
        baseSlug,
        async (s) => {
          const existing = await this.prisma.category.findFirst({
            where: {
              slug: s,
              NOT: { id },
            },
          });
          return !!existing;
        },
      );
    }

    // İsim benzersizliğini kontrol et
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Bu isimde bir kategori zaten mevcut');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    // Kategoriye ait haber var mı kontrol et
    const newsCount = await this.prisma.news.count({
      where: { categoryId: id },
    });

    if (newsCount > 0) {
      throw new ConflictException(
        `Bu kategoriye ait ${newsCount} haber bulunmaktadır. Önce haberleri başka bir kategoriye taşıyın veya silin.`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }
}


