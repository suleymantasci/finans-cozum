import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ToolDataSyncService } from '../tool-data-sync.service';

@Injectable()
export class DataSyncScheduler {
  constructor(private syncService: ToolDataSyncService) {}

  // Her saat başı kontrol et
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlySync() {
    console.log('[Scheduler] Running hourly syncs...');
    const result = await this.syncService.runScheduledSyncs('HOURLY');
    console.log(`[Scheduler] Hourly sync completed: ${result.success}/${result.total} successful`);
  }

  // Günde 1 kez (gece 02:00)
  @Cron('0 2 * * *')
  async handleDailySync() {
    console.log('[Scheduler] Running daily syncs...');
    const result = await this.syncService.runScheduledSyncs('DAILY');
    console.log(`[Scheduler] Daily sync completed: ${result.success}/${result.total} successful`);
  }

  // Günde 2 kez (sabah 08:00, akşam 20:00)
  @Cron('0 8,20 * * *')
  async handleTwiceDailySync() {
    console.log('[Scheduler] Running twice daily syncs...');
    const result = await this.syncService.runScheduledSyncs('TWICE_DAILY');
    console.log(`[Scheduler] Twice daily sync completed: ${result.success}/${result.total} successful`);
  }

  // Günde 4 kez (06:00, 12:00, 18:00, 00:00)
  @Cron('0 6,12,18,0 * * *')
  async handleFourTimesDailySync() {
    console.log('[Scheduler] Running four times daily syncs...');
    const result = await this.syncService.runScheduledSyncs('FOUR_TIMES_DAILY');
    console.log(`[Scheduler] Four times daily sync completed: ${result.success}/${result.total} successful`);
  }

  // Custom cron expression'ları kontrol et (her dakika)
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCustomCronSyncs() {
    const result = await this.syncService.runCustomCronSyncs();
    if (result.total > 0) {
      console.log(`[Scheduler] Custom cron sync completed: ${result.success}/${result.total} successful`);
    }
  }
}


