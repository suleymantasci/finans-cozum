import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IpoScraperService } from '../ipo/ipo-scraper.service';

async function runSync() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const scraperService = app.get(IpoScraperService);

  console.log('IPO Sync başlatılıyor...');
  
  try {
    await scraperService.scrapeDailyUpdates();
    console.log('✅ IPO Sync başarıyla tamamlandı!');
  } catch (error) {
    console.error('❌ IPO Sync hatası:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSync();
