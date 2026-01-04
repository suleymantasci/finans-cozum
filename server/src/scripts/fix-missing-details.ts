
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IpoScraperService } from '../ipo/ipo-scraper.service';
import { PrismaService } from '../prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const scraperService = app.get(IpoScraperService);
  const prisma = app.get(PrismaService);

  const targets = [
    { url: 'https://halkarz.com/global-yatirim-holding-a-s/' },
    { url: 'https://halkarz.com/hastavuk-gida-tarim-hayvancilik-a-s/' },
    { url: 'https://halkarz.com/metgun-enerji-yatirimlari-a-s/' }
  ];

  console.log('Starting manual fix for 3 listings...');

  for (const target of targets) {
      const listing = await prisma.ipoListing.findFirst({
          where: { detailUrl: target.url }
      });

      if (!listing) {
          console.warn(`Listing not found for URL: ${target.url}. The full scrape might not have reached it yet.`);
          continue;
      }

    console.log(`Processing ${listing.companyName} (${listing.id})...`);
    try {
        const foundBistCode = await (scraperService as any).scrapeListingDetail(listing.id, target.url);
        console.log(`Finished ${listing.companyName}. Found BIST code: ${foundBistCode}`);
    } catch (e) {
        console.error(`Error processing ${listing.companyName}:`, e);
    }
  }

  console.log('Done.');
  await app.close();
  process.exit(0);
}

bootstrap();
