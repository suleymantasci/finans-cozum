import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { EconomicCalendarService } from './economic-calendar.service';
import { EconomicCalendarResponse, CalendarPeriod } from './dto/economic-calendar.dto';

@Controller('economic-calendar')
export class EconomicCalendarController {
  constructor(private readonly economicCalendarService: EconomicCalendarService) {}

  @Get(':period')
  async getEvents(@Param('period') period: string): Promise<EconomicCalendarResponse> {
    const validPeriods: CalendarPeriod[] = ['yesterday', 'today', 'tomorrow', 'week', 'month'];
    
    if (!validPeriods.includes(period as CalendarPeriod)) {
      throw new BadRequestException(
        `Invalid period. Must be one of: ${validPeriods.join(', ')}`
      );
    }

    return this.economicCalendarService.getEvents(period as CalendarPeriod);
  }
}
