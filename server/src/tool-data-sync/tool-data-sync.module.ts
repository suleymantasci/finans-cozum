import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ToolDataSyncService } from './tool-data-sync.service';
import { ToolDataSyncController } from './tool-data-sync.controller';
import { DataSyncScheduler } from './schedulers/data-sync.scheduler';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule.register({}),
    PrismaModule,
    AuthModule,
  ],
  providers: [ToolDataSyncService, DataSyncScheduler],
  controllers: [ToolDataSyncController],
  exports: [ToolDataSyncService],
})
export class ToolDataSyncModule {}

