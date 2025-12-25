import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncDto } from './dto/create-sync.dto';
import { UpdateSyncDto } from './dto/update-sync.dto';
import { HttpService } from '@nestjs/axios';
import { BaseProcessor } from './processors/base-processor';
import { TcmbProcessor } from './processors/tcmb-processor';
import * as crypto from 'crypto';

@Injectable()
export class ToolDataSyncService {
  private processors: Map<string, BaseProcessor> = new Map();

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {
    // Processor'ları kaydet
    const tcmbProcessor = new TcmbProcessor(httpService);
    this.processors.set('TCMB', tcmbProcessor);
    this.processors.set('tcmb', tcmbProcessor);
  }

  async create(createSyncDto: CreateSyncDto) {
    const tool = await this.prisma.tool.findUnique({
      where: { id: createSyncDto.toolId },
    });

    if (!tool) {
      throw new NotFoundException('Araç bulunamadı');
    }

    if (tool.dataSourceType !== 'EXTERNAL_API') {
      throw new BadRequestException('Bu araç EXTERNAL_API tipinde olmalıdır');
    }

    // Next run time hesapla
    const nextRunAt = this.calculateNextRun(
      createSyncDto.frequency || 'DAILY',
      createSyncDto.cronExpression,
    );

    return this.prisma.toolDataSync.create({
      data: {
        ...createSyncDto,
        apiMethod: createSyncDto.apiMethod || 'GET',
        frequency: createSyncDto.frequency || 'DAILY',
        timezone: createSyncDto.timezone || 'Europe/Istanbul',
        isActive: createSyncDto.isActive ?? true,
        lastStatus: 'PENDING',
        nextRunAt,
        runCount: 0,
        successCount: 0,
        failCount: 0,
      },
      include: {
        tool: true,
      },
    });
  }

  async findAll(toolId?: string) {
    const where: any = {};
    if (toolId) {
      where.toolId = toolId;
    }

    return this.prisma.toolDataSync.findMany({
      where,
      include: {
        tool: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sync = await this.prisma.toolDataSync.findUnique({
      where: { id },
      include: {
        tool: true,
        externalData: {
          take: 10,
          orderBy: { fetchedAt: 'desc' },
        },
      },
    });

    if (!sync) {
      throw new NotFoundException('Sync job bulunamadı');
    }

    return sync;
  }

  async update(id: string, updateSyncDto: UpdateSyncDto) {
    await this.findOne(id);

    const updateData: any = { ...updateSyncDto };

    // Next run time'ı yeniden hesapla
    if (updateSyncDto.frequency || updateSyncDto.cronExpression || updateSyncDto.isActive) {
      updateData.nextRunAt = this.calculateNextRun(
        updateSyncDto.frequency || 'DAILY',
        updateSyncDto.cronExpression,
      );
    }

    return this.prisma.toolDataSync.update({
      where: { id },
      data: updateData,
      include: {
        tool: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.toolDataSync.delete({
      where: { id },
    });
  }

  async runSync(syncId: string) {
    const sync = await this.findOne(syncId);

    if (!sync.isActive) {
      throw new BadRequestException('Sync job aktif değil');
    }

    // Status'u RUNNING yap
    await this.prisma.toolDataSync.update({
      where: { id: syncId },
      data: {
        lastStatus: 'RUNNING',
        lastRunAt: new Date(),
      },
    });

    try {
      // Processor seç
      const processor = this.processors.get(sync.name.toUpperCase()) || new BaseProcessor(this.httpService);

      // API'den veri çek
      const rawData = await processor.fetchData(
        sync.apiUrl,
        sync.apiMethod,
        sync.apiHeaders as any,
        sync.apiBody as any,
      );

      // Data path'den veri çıkar
      let extractedData = processor.extractDataPath(rawData, sync.dataPath || undefined);

      // TCMB için özel işleme
      if (sync.name.toUpperCase().includes('TCMB')) {
        const tcmbProcessor = this.processors.get('TCMB') as TcmbProcessor;
        extractedData = await tcmbProcessor.processTcmbData(extractedData || rawData);
      }

      // Transform script uygula
      const transformedData = processor.transformData(extractedData, sync.transformScript || undefined);

      // Data hash hesapla
      const dataHash = crypto
        .createHash('md5')
        .update(JSON.stringify(transformedData))
        .digest('hex');

      // Veriyi kaydet
      await this.prisma.externalData.create({
        data: {
          syncId: syncId,
          data: transformedData,
          dataHash,
          source: sync.name,
        },
      });

      // Next run time hesapla
      const nextRunAt = this.calculateNextRun(sync.frequency, sync.cronExpression);

      // Başarılı güncelleme
      await this.prisma.toolDataSync.update({
        where: { id: syncId },
        data: {
          lastStatus: 'SUCCESS',
          lastError: null,
          nextRunAt,
          runCount: { increment: 1 },
          successCount: { increment: 1 },
        },
      });

      return { success: true, data: transformedData };
    } catch (error: any) {
      // Hata durumu
      await this.prisma.toolDataSync.update({
        where: { id: syncId },
        data: {
          lastStatus: 'FAILED',
          lastError: error.message,
          runCount: { increment: 1 },
          failCount: { increment: 1 },
        },
      });

      throw error;
    }
  }

  async getSyncHistory(syncId: string, limit: number = 50) {
    await this.findOne(syncId);

    return this.prisma.externalData.findMany({
      where: { syncId },
      orderBy: { fetchedAt: 'desc' },
      take: limit,
    });
  }

  async runScheduledSyncs(frequency?: string) {
    const now = new Date();
    const where: any = {
      isActive: true,
      OR: [
        { nextRunAt: { lte: now } },
        { nextRunAt: null },
      ],
    };

    if (frequency) {
      where.frequency = frequency;
    }

    const syncs = await this.prisma.toolDataSync.findMany({ where });

    const results = await Promise.allSettled(
      syncs.map((sync) => this.runSync(sync.id)),
    );

    return {
      total: syncs.length,
      success: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }

  async runCustomCronSyncs() {
    const now = new Date();
    const syncs = await this.prisma.toolDataSync.findMany({
      where: {
        isActive: true,
        frequency: 'CUSTOM',
        OR: [
          { nextRunAt: { lte: now } },
          { nextRunAt: null },
        ],
      },
    });

    const results = await Promise.allSettled(
      syncs.map((sync) => this.runSync(sync.id)),
    );

    return {
      total: syncs.length,
      success: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }

  private calculateNextRun(frequency: string, cronExpression?: string): Date {
    const now = new Date();

    if (frequency === 'CUSTOM' && cronExpression) {
      // Basit cron expression parser (gerçek uygulamada cron-parser kullanılabilir)
      // Şimdilik sadece saat bazlı basit hesaplama
      return new Date(now.getTime() + 60 * 60 * 1000); // 1 saat sonra
    }

    switch (frequency) {
      case 'HOURLY':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 saat sonra
      case 'DAILY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 gün sonra
      case 'TWICE_DAILY':
        return new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 saat sonra
      case 'FOUR_TIMES_DAILY':
        return new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 saat sonra
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default: 1 gün sonra
    }
  }
}


