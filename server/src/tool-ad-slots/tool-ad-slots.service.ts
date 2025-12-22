import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdSlotDto } from './dto/create-ad-slot.dto';
import { UpdateAdSlotDto } from './dto/update-ad-slot.dto';

@Injectable()
export class ToolAdSlotsService {
  constructor(private prisma: PrismaService) {}

  async create(createAdSlotDto: CreateAdSlotDto) {
    // Tool veya Template kontrolü
    if (!createAdSlotDto.toolId && !createAdSlotDto.templateId) {
      throw new BadRequestException('toolId veya templateId belirtilmelidir');
    }

    if (createAdSlotDto.toolId) {
      const tool = await this.prisma.tool.findUnique({
        where: { id: createAdSlotDto.toolId },
      });
      if (!tool) {
        throw new NotFoundException('Araç bulunamadı');
      }
    }

    if (createAdSlotDto.templateId) {
      const template = await this.prisma.adSlotTemplate.findUnique({
        where: { id: createAdSlotDto.templateId },
      });
      if (!template) {
        throw new NotFoundException('Şablon bulunamadı');
      }
    }

    return this.prisma.toolAdSlot.create({
      data: {
        ...createAdSlotDto,
        isActive: createAdSlotDto.isActive ?? true,
        order: createAdSlotDto.order ?? 0,
        showOnMobile: createAdSlotDto.showOnMobile ?? true,
        showOnTablet: createAdSlotDto.showOnTablet ?? true,
        showOnDesktop: createAdSlotDto.showOnDesktop ?? true,
        startDate: createAdSlotDto.startDate ? new Date(createAdSlotDto.startDate) : null,
        endDate: createAdSlotDto.endDate ? new Date(createAdSlotDto.endDate) : null,
      },
      include: {
        tool: true,
        template: true,
      },
    });
  }

  async findAll(toolId?: string) {
    const where: any = {};
    if (toolId) {
      where.toolId = toolId;
    }

    return this.prisma.toolAdSlot.findMany({
      where,
      include: {
        tool: true,
        template: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findActive(toolId?: string) {
    const where: any = { isActive: true };
    if (toolId) {
      where.toolId = toolId;
    }

    const now = new Date();

    return this.prisma.toolAdSlot.findMany({
      where: {
        ...where,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      include: {
        tool: true,
        template: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const slot = await this.prisma.toolAdSlot.findUnique({
      where: { id },
      include: {
        tool: true,
        template: true,
      },
    });

    if (!slot) {
      throw new NotFoundException('Reklam alanı bulunamadı');
    }

    return slot;
  }

  async update(id: string, updateAdSlotDto: UpdateAdSlotDto) {
    await this.findOne(id);

    return this.prisma.toolAdSlot.update({
      where: { id },
      data: {
        ...updateAdSlotDto,
        ...(updateAdSlotDto.startDate && { startDate: new Date(updateAdSlotDto.startDate) }),
        ...(updateAdSlotDto.endDate && { endDate: new Date(updateAdSlotDto.endDate) }),
      },
      include: {
        tool: true,
        template: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.toolAdSlot.delete({
      where: { id },
    });
  }

  async bulkCreate(toolIds: string[], templateId: string) {
    const template = await this.prisma.adSlotTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }

    const slots = await Promise.all(
      toolIds.map((toolId) =>
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

    return slots;
  }
}

