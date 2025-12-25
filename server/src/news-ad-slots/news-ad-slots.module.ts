import { Module } from '@nestjs/common';
import { NewsAdSlotsService } from './news-ad-slots.service';
import { NewsAdSlotsController } from './news-ad-slots.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NewsAdSlotsController],
  providers: [NewsAdSlotsService],
  exports: [NewsAdSlotsService],
})
export class NewsAdSlotsModule {}


