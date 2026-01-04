import { Module } from '@nestjs/common';
import { IpoController } from './ipo.controller';
import { IpoService } from './ipo.service';
import { IpoScraperService } from './ipo-scraper.service';
import { IpoSchedulerService } from './ipo-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IpoController],
  providers: [IpoService, IpoScraperService, IpoSchedulerService],
  exports: [IpoService],
})
export class IpoModule {}
