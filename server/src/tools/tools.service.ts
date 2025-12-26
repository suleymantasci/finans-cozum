import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { generateSlug, generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class ToolsService {
  constructor(private prisma: PrismaService) {}

  async create(createToolDto: CreateToolDto) {
    const slug = createToolDto.slug || generateSlug(createToolDto.name);
    
    const uniqueSlug = await generateUniqueSlug(
      slug,
      async (s) => !!(await this.prisma.tool.findFirst({ where: { slug: s } })),
    );

    const existing = await this.prisma.tool.findFirst({
      where: { name: createToolDto.name },
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir araç zaten mevcut');
    }

    // Category kontrolü
    if (createToolDto.categoryId) {
      const category = await this.prisma.toolCategory.findUnique({
        where: { id: createToolDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Kategori bulunamadı');
      }
    }

    return this.prisma.tool.create({
      data: {
        ...createToolDto,
        slug: uniqueSlug,
        status: createToolDto.status || 'DRAFT',
        dataSourceType: createToolDto.dataSourceType || 'STATIC',
        order: createToolDto.order ?? 0,
        isFeatured: createToolDto.isFeatured ?? false,
        views: 0,
        keywords: createToolDto.keywords || [],
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(status?: string, categoryId?: string, includeInactive = false) {
    const where: any = {};

    if (status) {
      where.status = status;
    } else if (!includeInactive) {
      where.status = 'PUBLISHED';
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.prisma.tool.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            adSlots: true,
            dataSyncs: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        category: true,
        adSlots: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        dataSyncs: {
          where: { isActive: true },
        },
      },
    });

    if (!tool) {
      throw new NotFoundException('Araç bulunamadı');
    }

    return tool;
  }

  async findBySlug(slug: string) {
    const tool = await this.prisma.tool.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        category: true,
        adSlots: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!tool) {
      throw new NotFoundException('Araç bulunamadı');
    }

    // View sayısını artır
    await this.prisma.tool.update({
      where: { id: tool.id },
      data: { views: { increment: 1 } },
    });

    return tool;
  }

  async findFeatured(limit?: number) {
    return this.prisma.tool.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true,
      },
      include: {
        category: true,
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      take: limit || 6,
    });
  }

  async getToolData(id: string) {
    const tool = await this.findOne(id);

    if (tool.dataSourceType === 'STATIC') {
      return null;
    }

    if (tool.dataSourceType === 'EXTERNAL_API') {
      // En son sync edilmiş veriyi getir
      const latestData = await this.prisma.externalData.findFirst({
        where: {
          sync: {
            toolId: id,
            isActive: true,
          },
        },
        orderBy: { fetchedAt: 'desc' },
      });

      return latestData?.data || null;
    }

    if (tool.dataSourceType === 'DATABASE') {
      // DATABASE tipi için config'deki query'yi çalıştır
      // Bu kısım tool'a özel olacak, şimdilik null döndürüyoruz
      // İleride tool-specific data fetcher'lar eklenebilir
      return null;
    }

    return null;
  }

  async update(id: string, updateToolDto: UpdateToolDto) {
    const tool = await this.findOne(id);

    let slug = updateToolDto.slug;
    if (updateToolDto.name && !slug) {
      slug = generateSlug(updateToolDto.name);
    }

    if (slug && slug !== tool.slug) {
      const uniqueSlug = await generateUniqueSlug(
        slug,
        async (s) => {
          const existing = await this.prisma.tool.findFirst({ where: { slug: s } });
          return existing && existing.id !== id;
        },
      );
      slug = uniqueSlug;
    }

    if (updateToolDto.name && updateToolDto.name !== tool.name) {
      const existing = await this.prisma.tool.findFirst({
        where: { name: updateToolDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Bu isimde bir araç zaten mevcut');
      }
    }

    // Category kontrolü
    if (updateToolDto.categoryId) {
      const category = await this.prisma.toolCategory.findUnique({
        where: { id: updateToolDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Kategori bulunamadı');
      }
    }

    return this.prisma.tool.update({
      where: { id },
      data: {
        ...updateToolDto,
        ...(slug && { slug }),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    const tool = await this.findOne(id);

    // İlişkili kayıtları kontrol et
    const adSlotsCount = await this.prisma.toolAdSlot.count({
      where: { toolId: id },
    });

    const dataSyncsCount = await this.prisma.toolDataSync.count({
      where: { toolId: id },
    });

    if (adSlotsCount > 0 || dataSyncsCount > 0) {
      // Cascade delete ile otomatik silinecek, ama uyarı verelim
      console.warn(`Araç silinirken ${adSlotsCount} reklam alanı ve ${dataSyncsCount} sync job silinecek`);
    }

    return this.prisma.tool.delete({
      where: { id },
    });
  }
}


