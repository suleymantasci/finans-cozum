import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsAdSlotDto } from './dto/create-news-ad-slot.dto';
import { UpdateNewsAdSlotDto } from './dto/update-news-ad-slot.dto';

@Injectable()
export class NewsAdSlotsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNewsAdSlotDto) {
    return this.prisma.newsAdSlot.create({
      data: {
        ...createDto,
        isActive: createDto.isActive ?? true,
        order: createDto.order ?? 0,
        showOnMobile: createDto.showOnMobile ?? true,
        showOnTablet: createDto.showOnTablet ?? true,
        showOnDesktop: createDto.showOnDesktop ?? true,
        startDate: createDto.startDate ? new Date(createDto.startDate) : null,
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });
  }

  async findAll(includeInactive = false) {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.newsAdSlot.findMany({
      where,
      orderBy: [
        { position: 'asc' },
        { order: 'asc' },
      ],
    });
  }

  async findActive() {
    const now = new Date();
    return this.prisma.newsAdSlot.findMany({
      where: {
        isActive: true,
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
      orderBy: [
        { position: 'asc' },
        { order: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const slot = await this.prisma.newsAdSlot.findUnique({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundException('Reklam alanı bulunamadı');
    }

    return slot;
  }

  async update(id: string, updateDto: UpdateNewsAdSlotDto) {
    await this.findOne(id);

    return this.prisma.newsAdSlot.update({
      where: { id },
      data: {
        ...updateDto,
        ...(updateDto.startDate && { startDate: new Date(updateDto.startDate) }),
        ...(updateDto.endDate && { endDate: new Date(updateDto.endDate) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.newsAdSlot.delete({
      where: { id },
    });
  }
}

