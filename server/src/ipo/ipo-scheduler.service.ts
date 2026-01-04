import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IpoScraperService } from './ipo-scraper.service';

@Injectable()
export class IpoSchedulerService {
  private readonly logger = new Logger(IpoSchedulerService.name);

  constructor(private readonly scraperService: IpoScraperService) {}

  /**
   * Daily sync job - runs every day at 2:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailySync() {
    this.logger.log('Starting scheduled daily IPO sync...');
    
    try {
      await this.scraperService.scrapeDailyUpdates();
      this.logger.log('Scheduled daily IPO sync completed successfully');
    } catch (error) {
      this.logger.error(`Scheduled daily IPO sync failed: ${error.message}`, error.stack);
    }
  }
}
