import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { parseResultsTable } from '../ipo/ipo-results-parser.util';
import { Logger } from '@nestjs/common';

/**
 * Migration script to convert existing IPO results data from raw table format
 * to structured format (summary + notes)
 * 
 * Usage: npm run script:migrate-ipo-results
 */
async function bootstrap() {
  const logger = new Logger('MigrateIpoResults');
  logger.log('🚀 Initializing application...');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const prisma = app.get(PrismaService);
    
    logger.log('📊 Fetching all IPO results from database...');
    
    // Get all IPO results
    const allResults = await prisma.ipoResult.findMany({
      include: {
        listing: {
          select: {
            bistCode: true,
            companyName: true,
          },
        },
      },
    });

    logger.log(`Found ${allResults.length} IPO results to check`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const result of allResults) {
      try {
        const resultsData = result.resultsData as any;

        // Check if data is already in new format (has summary and notes)
        if (resultsData && typeof resultsData === 'object' && 'summary' in resultsData && 'notes' in resultsData) {
          logger.debug(`Skipping ${result.listing.bistCode} - already in new format`);
          skippedCount++;
          continue;
        }

        // Check if data is in old format (array of arrays)
        if (!Array.isArray(resultsData) || resultsData.length === 0) {
          logger.warn(`Skipping ${result.listing.bistCode} - invalid data format`);
          skippedCount++;
          continue;
        }

        // Convert old format to new format
        logger.log(`Converting ${result.listing.bistCode} (${result.listing.companyName})...`);
        
        const newFormat = parseResultsTable(resultsData);

        // Update in database
        await prisma.ipoResult.update({
          where: { id: result.id },
          data: {
            resultsData: newFormat,
          },
        });

        logger.log(`✅ Updated ${result.listing.bistCode}`);
        updatedCount++;
      } catch (error) {
        logger.error(`❌ Error processing ${result.listing.bistCode}: ${error.message}`);
        errorCount++;
      }
    }

    logger.log('\n📈 Migration Summary:');
    logger.log(`   ✅ Updated: ${updatedCount}`);
    logger.log(`   ⏭️  Skipped: ${skippedCount}`);
    logger.log(`   ❌ Errors: ${errorCount}`);
    logger.log(`   📊 Total: ${allResults.length}`);
    
    logger.log('\n✅ Migration completed successfully!');
  } catch (error) {
    logger.error(`❌ FAILED: Error during migration: ${error.message}`, error.stack);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();

