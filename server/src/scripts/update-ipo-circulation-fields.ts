import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { chromium, Browser, Page } from 'playwright';
import { Logger } from '@nestjs/common';

/**
 * Script to update actualCirculation and actualCirculationPct fields
 * for all IPO listings that have empty values due to previous bug
 * 
 * Usage: npm run script:update-circulation-fields
 */
async function bootstrap() {
  const logger = new Logger('UpdateIpoCirculationFields');
  logger.log('🚀 Initializing application...');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const prisma = app.get(PrismaService);
    
    logger.log('📊 Fetching all IPO listings with details...');
    
    // Get all IPO listings that have detail records
    const allListings = await prisma.ipoListing.findMany({
      include: {
        detail: true,
      },
    });

    logger.log(`Found ${allListings.length} IPO listings to check`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process listings in batches to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < allListings.length; i += batchSize) {
      const batch = allListings.slice(i, i + batchSize);
      
      logger.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, allListings.length)} of ${allListings.length})...`);

      // Process batch sequentially
      for (const listing of batch) {
        let browser: Browser | null = null;
        
        try {
          // Check for incorrect field mappings - don't skip, check all records
          const hasIncorrectMapping = 
            (listing.detail?.shareAmount && typeof listing.detail.shareAmount === 'string' && (listing.detail.shareAmount.includes('%') || listing.detail.shareAmount.includes('Oranı'))) ||
            (listing.detail?.actualCirculation && typeof listing.detail.actualCirculation === 'string' && listing.detail.actualCirculation.includes('%'));

          if (!listing.detailUrl) {
            logger.warn(`Skipping ${listing.bistCode} - no detail URL`);
            skippedCount++;
            continue;
          }

          // Always scrape to check and fix any issues
          if (!hasIncorrectMapping && listing.detail?.actualCirculation && listing.detail?.actualCirculationPct) {
            logger.debug(`Checking ${listing.bistCode} - fields seem correct, but verifying...`);
          } else if (hasIncorrectMapping) {
            logger.log(`⚠️  ${listing.bistCode} has incorrect field mappings, will fix...`);
          }

          logger.log(`Scraping ${listing.bistCode} (${listing.companyName})...`);

          browser = await chromium.launch({ headless: true });
          const page = await browser.newPage();

          await page.goto(listing.detailUrl, { waitUntil: 'networkidle', timeout: 30000 });

          // Extract all table fields to fix any incorrect mappings
          const tableData = await page.evaluate(() => {
            const data: any = {};

            const table = document.querySelector('.sp-table');
            if (table) {
              const rows = table.querySelectorAll('tr');
              rows.forEach((row) => {
                const label = row.querySelector('em')?.textContent?.trim();
                const valueCell = row.querySelectorAll('td')[1];

                if (label && valueCell) {
                  // Use the same logic as scraper - check most specific first
                  if (label.includes('Halka Arz Tarihi')) {
                    data.ipoDate = valueCell.querySelector('time')?.textContent?.trim() || valueCell.textContent?.trim()?.replace(':', '')?.trim();
                    data.ipoDateTimeRange = valueCell.querySelector('small')?.textContent?.trim();
                  } else if (label.includes('Halka Arz Fiyatı')) {
                    data.ipoPrice = valueCell.querySelector('strong')?.textContent?.trim();
                  } else if (label.includes('Dağıtım Yöntemi')) {
                    data.distributionMethod = valueCell.querySelector('strong')?.textContent?.trim();
                  } else if (label.includes('Fiili Dolaşımdaki Pay') && label.includes(':')) {
                    // More specific: "Fiili Dolaşımdaki Pay :" (with colon)
                    data.actualCirculation = valueCell.querySelector('strong')?.textContent?.trim();
                  } else if (label.includes('Fiili Dolaşımdaki Pay Oranı')) {
                    // More specific: "Fiili Dolaşımdaki Pay Oranı" (with or without extra text)
                    data.actualCirculationPct = valueCell.querySelector('strong')?.textContent?.trim();
                  } else if (label.includes('Pay') && !label.includes('Fiili Dolaşımdaki')) {
                    // General "Pay" but NOT "Fiili Dolaşımdaki Pay"
                    // Also check it's not "Pay Oranı" or similar
                    if (!label.includes('Oranı') && !label.includes('Oran')) {
                      data.shareAmount = valueCell.querySelector('strong')?.textContent?.trim();
                    }
                  } else if (label.includes('Aracı Kurum')) {
                    data.intermediary = valueCell.querySelector('strong')?.textContent?.trim();
                  } else if (label.includes('Bist İlk İşlem Tarihi')) {
                    data.firstTradeDate = valueCell.querySelector('strong')?.textContent?.trim();
                  } else if (label.includes('Pazar')) {
                    data.market = valueCell.querySelector('strong')?.textContent?.trim();
                  }
                }
              });
            }

            return data;
          });

          await browser.close();
          browser = null;

          // Prepare update data - fix all fields that might be incorrect
          const updateData: any = {};
          const currentDetail: any = listing.detail || {};

          // Check for incorrect mappings in existing data
          // If shareAmount contains % or "Oranı", it's likely actualCirculationPct
          if (currentDetail.shareAmount && typeof currentDetail.shareAmount === 'string') {
            if (currentDetail.shareAmount.includes('%') || currentDetail.shareAmount.includes('Oranı')) {
              // This is likely actualCirculationPct, not shareAmount
              if (!currentDetail.actualCirculationPct && tableData.actualCirculationPct) {
                updateData.actualCirculationPct = tableData.actualCirculationPct;
              } else if (!currentDetail.actualCirculationPct) {
                // Use the incorrect shareAmount value as actualCirculationPct
                updateData.actualCirculationPct = currentDetail.shareAmount;
              }
              // Clear the incorrect shareAmount
              if (tableData.shareAmount) {
                updateData.shareAmount = tableData.shareAmount;
              } else {
                updateData.shareAmount = null; // Clear it if we can't find correct value
              }
            }
          }

          // If actualCirculation contains %, it's likely actualCirculationPct
          if (currentDetail.actualCirculation && typeof currentDetail.actualCirculation === 'string') {
            if (currentDetail.actualCirculation.includes('%')) {
              // This is likely actualCirculationPct, not actualCirculation
              if (!currentDetail.actualCirculationPct && tableData.actualCirculationPct) {
                updateData.actualCirculationPct = tableData.actualCirculationPct;
              } else if (!currentDetail.actualCirculationPct) {
                updateData.actualCirculationPct = currentDetail.actualCirculation;
              }
              // Fix actualCirculation
              if (tableData.actualCirculation) {
                updateData.actualCirculation = tableData.actualCirculation;
              } else {
                updateData.actualCirculation = null; // Clear it if we can't find correct value
              }
            }
          }

          // Update fields from scraped data if they're missing or incorrect
          if (tableData.actualCirculation) {
            const currentValue = currentDetail.actualCirculation;
            // Update if empty or if it contains % (incorrect)
            if (!currentValue || (typeof currentValue === 'string' && currentValue.includes('%'))) {
              updateData.actualCirculation = tableData.actualCirculation;
            }
          }

          if (tableData.actualCirculationPct) {
            const currentValue = currentDetail.actualCirculationPct;
            // Update if empty
            if (!currentValue) {
              updateData.actualCirculationPct = tableData.actualCirculationPct;
            }
          }

          if (tableData.shareAmount) {
            const currentValue = currentDetail.shareAmount;
            // Update if empty or if it contains % or "Oranı" (incorrect)
            if (!currentValue || (typeof currentValue === 'string' && (currentValue.includes('%') || currentValue.includes('Oranı')))) {
              updateData.shareAmount = tableData.shareAmount;
            }
          }

          // Also update other fields if they're missing
          const otherFields = ['ipoPrice', 'distributionMethod', 'firstTradeDate', 'market'];
          for (const field of otherFields) {
            if (tableData[field] && !currentDetail[field as keyof typeof currentDetail]) {
              updateData[field] = tableData[field];
            }
          }

          // Check if we have any updates
          const hasUpdates = Object.keys(updateData).length > 0;

          if (hasUpdates) {
            // Update or create detail record
            if (listing.detail) {
              await prisma.ipoDetail.update({
                where: { listingId: listing.id },
                data: updateData,
              });
            } else {
              // Create detail record if it doesn't exist
              await prisma.ipoDetail.create({
                data: {
                  listingId: listing.id,
                  ...updateData,
                },
              });
            }

            logger.log(`✅ Updated ${listing.bistCode}: ${JSON.stringify(updateData)}`);
            updatedCount++;
          } else {
            logger.debug(`✓ ${listing.bistCode} - no updates needed (fields are correct)`);
            skippedCount++;
          }

          // Small delay between requests to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.error(`❌ Error processing ${listing.bistCode}: ${error.message}`);
          errorCount++;
          
          if (browser) {
            try {
              await browser.close();
            } catch (e) {
              // Ignore close errors
            }
          }
        }
      }

      // Longer delay between batches
      if (i + batchSize < allListings.length) {
        logger.log('Waiting before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    logger.log('\n📈 Update Summary:');
    logger.log(`   ✅ Updated: ${updatedCount}`);
    logger.log(`   ⏭️  Skipped: ${skippedCount}`);
    logger.log(`   ❌ Errors: ${errorCount}`);
    logger.log(`   📊 Total: ${allListings.length}`);
    
    logger.log('\n✅ Update completed successfully!');
  } catch (error) {
    logger.error(`❌ FAILED: Error during update: ${error.message}`, error.stack);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();

