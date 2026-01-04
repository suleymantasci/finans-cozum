import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IpoScraperService } from '../ipo/ipo-scraper.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('IpoScrapeScript');
  logger.log('🚀 Initializing application (this may take a moment)...');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const scraperService = app.get(IpoScraperService);
    
    logger.log('STARTED: Full IPO Scrape process...');
    logger.warn('This process will load all IPO pages and may take several minutes.');
    
    // Clear existing data first
    await scraperService.clearAllData();
    
    await scraperService.scrapeAllIpos();
    
    logger.log('✅ COMPLETED: Full IPO Scrape finished successfully.');
  } catch (error) {
    logger.error(`❌ FAILED: Error during scraping: ${error.message}`, error.stack);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
