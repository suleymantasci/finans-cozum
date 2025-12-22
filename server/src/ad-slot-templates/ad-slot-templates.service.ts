import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class AdSlotTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createTemplateDto: CreateTemplateDto) {
    const existing = await this.prisma.adSlotTemplate.findFirst({
      where: { name: createTemplateDto.name },
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir şablon zaten mevcut');
    }

    return this.prisma.adSlotTemplate.create({
      data: {
        ...createTemplateDto,
        isActive: createTemplateDto.isActive ?? true,
        showOnMobile: createTemplateDto.showOnMobile ?? true,
        showOnTablet: createTemplateDto.showOnTablet ?? true,
        showOnDesktop: createTemplateDto.showOnDesktop ?? true,
        startDate: createTemplateDto.startDate ? new Date(createTemplateDto.startDate) : null,
        endDate: createTemplateDto.endDate ? new Date(createTemplateDto.endDate) : null,
      },
    });
  }

  async findAll() {
    return this.prisma.adSlotTemplate.findMany({
      include: {
        _count: {
          select: {
            adSlots: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.adSlotTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            adSlots: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }

    return template;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto) {
    const template = await this.findOne(id);

    if (updateTemplateDto.name && updateTemplateDto.name !== template.name) {
      const existing = await this.prisma.adSlotTemplate.findFirst({
        where: { name: updateTemplateDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Bu isimde bir şablon zaten mevcut');
      }
    }

    return this.prisma.adSlotTemplate.update({
      where: { id },
      data: {
        ...updateTemplateDto,
        ...(updateTemplateDto.startDate && { startDate: new Date(updateTemplateDto.startDate) }),
        ...(updateTemplateDto.endDate && { endDate: new Date(updateTemplateDto.endDate) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.adSlotTemplate.delete({
      where: { id },
    });
  }

  async applyToTools(templateId: string, toolIds: string[]) {
    const template = await this.findOne(templateId);

    // Mevcut ad slot'ları kontrol et ve yeni olanları oluştur
    const existingSlots = await this.prisma.toolAdSlot.findMany({
      where: {
        toolId: { in: toolIds },
        templateId: templateId,
      },
    });

    const existingToolIds = existingSlots.map((slot) => slot.toolId).filter(Boolean) as string[];
    const newToolIds = toolIds.filter((id) => !existingToolIds.includes(id));

    if (newToolIds.length === 0) {
      return { message: 'Tüm araçlara zaten uygulanmış', created: 0 };
    }

    const slots = await Promise.all(
      newToolIds.map((toolId) =>
        this.prisma.toolAdSlot.create({
          data: {
            toolId,
            templateId,
            position: template.position,
            isActive: template.isActive,
            content: template.content,
            scriptUrl: template.scriptUrl,
            imageUrl: template.imageUrl,
            linkUrl: template.linkUrl,
            showOnMobile: template.showOnMobile,
            showOnTablet: template.showOnTablet,
            showOnDesktop: template.showOnDesktop,
            startDate: template.startDate,
            endDate: template.endDate,
            order: 0,
          },
        }),
      ),
    );

    return { message: `${slots.length} araca uygulandı`, created: slots.length, slots };
  }

  async removeFromTools(templateId: string, toolIds: string[]) {
    await this.findOne(templateId);

    // Bu şablondan türetilmiş reklam alanlarını sil
    const result = await this.prisma.toolAdSlot.deleteMany({
      where: {
        templateId: templateId,
        toolId: { in: toolIds },
      },
    });

    return {
      message: `${result.count} reklam alanı silindi`,
      deleted: result.count,
    };
  }
}

