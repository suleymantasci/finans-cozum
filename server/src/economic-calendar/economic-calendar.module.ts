import { Module } from '@nestjs/common';
import { EconomicCalendarController } from './economic-calendar.controller';
import { EconomicCalendarService } from './economic-calendar.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [EconomicCalendarController],
  providers: [EconomicCalendarService],
  exports: [EconomicCalendarService],
})
export class EconomicCalendarModule {}
