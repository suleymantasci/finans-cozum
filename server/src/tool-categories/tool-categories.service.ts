import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolCategoryDto } from './dto/create-tool-category.dto';
import { UpdateToolCategoryDto } from './dto/update-tool-category.dto';
import { generateSlug, generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class ToolCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateToolCategoryDto) {
    const slug = createCategoryDto.slug || generateSlug(createCategoryDto.name);
    
    const uniqueSlug = await generateUniqueSlug(
      slug,
      async (s) => !!(await this.prisma.toolCategory.findFirst({ where: { slug: s } })),
    );

    const existing = await this.prisma.toolCategory.findFirst({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir kategori zaten mevcut');
    }

    return this.prisma.toolCategory.create({
      data: {
        ...createCategoryDto,
        slug: uniqueSlug,
        isActive: createCategoryDto.isActive ?? true,
        order: createCategoryDto.order ?? 0,
      },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.toolCategory.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.toolCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tools: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.toolCategory.findFirst({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateToolCategoryDto) {
    const category = await this.findOne(id);

    let slug = updateCategoryDto.slug;
    if (updateCategoryDto.name && !slug) {
      slug = generateSlug(updateCategoryDto.name);
    }

    if (slug && slug !== category.slug) {
      const uniqueSlug = await generateUniqueSlug(
        slug,
        async (s) => {
          const existing = await this.prisma.toolCategory.findFirst({ where: { slug: s } });
          return existing && existing.id !== id;
        },
      );
      slug = uniqueSlug;
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.prisma.toolCategory.findFirst({
        where: { name: updateCategoryDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Bu isimde bir kategori zaten mevcut');
      }
    }

    return this.prisma.toolCategory.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    const toolsCount = await this.prisma.tool.count({
      where: { categoryId: id },
    });

    if (toolsCount > 0) {
      throw new ConflictException(
        `Bu kategoriye ait ${toolsCount} araç bulunmaktadır. Önce araçları silin veya başka bir kategoriye taşıyın.`,
      );
    }

    return this.prisma.toolCategory.delete({
      where: { id },
    });
  }
}


