import { Injectable, Logger } from '@nestjs/common';
import { Browser, Page } from 'playwright';
import { IpoService } from './ipo.service';
import { IpoStatus } from '../generated/prisma/enums';
import { ScrapingService } from '../common/scraping/scraping.service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as crypto from 'crypto';
import { parseResultsTable } from './ipo-results-parser.util';

interface ScrapedListing {
  bistCode: string;
  companyName: string;
  ipoDate: string;
  detailUrl: string;
  logoUrl?: string;
  isNew: boolean;
  hasResults: boolean;
  isDraft: boolean;
}

@Injectable()
export class IpoScraperService {
  private readonly logger = new Logger(IpoScraperService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'ipo');
  private readonly serviceName = 'ipo-scraper';

  constructor(
    private readonly ipoService: IpoService,
    private readonly scrapingService: ScrapingService,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Clear all IPO data from database
   */
  async clearAllData(): Promise<void> {
    this.logger.warn('Clearing all IPO data from database...');
    await this.ipoService.deleteAll();
    this.logger.log('Database cleared successfully');
  }

  /**
   * Full scrape - loads all pages and scrapes all IPO listings
   */
  async scrapeAllIpos(): Promise<void> {
    this.logger.log('Starting full IPO scrape...');
    let browser: Browser | null = null;

    try {
      // Ortak scraping servisi ile browser oluştur
      const { browser: createdBrowser, context: createdContext, page: createdPage } = 
        await this.scrapingService.createStealthBrowser(this.serviceName);
      
      browser = createdBrowser;
      const context = createdContext;
      const page = createdPage;

      // Navigate to the main page (gerçekçi şekilde)
      await this.scrapingService.navigateWithStealth(page, 'https://halkarz.com/', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      // Click "Load More" button until all listings are loaded
      await this.loadAllListings(page);

      // Scrape all listings from the page
      const listings = await this.scrapeListingsFromPage(page);
      this.logger.log(`Found ${listings.length} IPO listings`);

      // Process each listing
      for (const listing of listings) {
        try {
          // Determine status based on user rules:
          // 1. If draft, status is DRAFT
          // 2. If not new (and not draft), it is COMPLETED and has results
          // 3. If new, check hasResults flag (checkbox)
          
          let status: IpoStatus = IpoStatus.UPCOMING;
          
          if (listing.isDraft) {
              status = IpoStatus.DRAFT;
          } else {
              if (!listing.isNew) {
                  listing.hasResults = true;
              }
              status = listing.hasResults ? IpoStatus.COMPLETED : IpoStatus.UPCOMING;
          }

          // Download logo if exists
          let localLogoUrl = null;
          if (listing.logoUrl) {
            localLogoUrl = await this.downloadImage(listing.logoUrl, listing.bistCode);
          }

          // Check if this is a temp bist code, if so we need to find real one from detail
          // But we need to save first to get an ID? No, we should scrape detail FIRST to get real bist code if possible?
          // Or scrape detail after saving, then update bistCode? 
          // Updating bistCode is better because we need listing ID for detail relation.
          // BUT bistCode is unique in DB? Yes.
          // So if we save with TEMP, it works. Then we find real BIST from detail.
          // If real BIST already exists (unlikely if strictly new), we might have conflict.
          // Let's assume for now we save as is, and update if we find real code in detail.

          // Save or update listing
          const savedListing = await this.ipoService.createOrUpdateListing({
            ...listing,
            logoUrl: localLogoUrl,
            status,
          });

          // Scrape detail page
          // Pass the listing object so we can update it if we find a better bist code
          const realBistCode = await this.scrapeListingDetail(savedListing.id, listing.detailUrl);

          // If we found a real BIST code and the current one was TEMP, update it!
          if (realBistCode && listing.bistCode.startsWith('TEMP-') && realBistCode !== listing.bistCode) {
              this.logger.log(`Updating TEMP BIST code ${listing.bistCode} to ${realBistCode}`);
              
              let newLogoUrl = undefined;
              if (localLogoUrl) {
                  const renamedUrl = await this.renameImage(localLogoUrl, realBistCode);
                  if (renamedUrl) {
                      newLogoUrl = renamedUrl;
                      this.logger.log(`Renamed logo to ${newLogoUrl}`);
                  }
              }

              await this.ipoService.updateListingBistCode(savedListing.id, realBistCode, newLogoUrl);
          }

          this.logger.log(`Processed ${listing.companyName}`);
        } catch (error) {
          this.logger.error(`Error processing ${listing.companyName}: ${error.message}`);
        }
      }

      this.logger.log('Full IPO scrape completed successfully');
    } catch (error) {
      this.logger.error(`Full scrape failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Daily sync - only checks for new and updated listings
   */
  async scrapeDailyUpdates(): Promise<void> {
    this.logger.log('Starting daily IPO sync...');
    let browser: Browser | null = null;

    try {
      // Ortak scraping servisi ile browser oluştur
      const { browser: createdBrowser, context: createdContext, page: createdPage } = 
        await this.scrapingService.createStealthBrowser(this.serviceName);
      
      browser = createdBrowser;
      const context = createdContext;
      const page = createdPage;

      // Navigate to the main page (gerçekçi şekilde)
      await this.scrapingService.navigateWithStealth(page, 'https://halkarz.com/', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      // Only load first page for daily sync
      const listings = await this.scrapeListingsFromPage(page);

      // Filter for new or updated listings
      const newListings = listings.filter((l) => l.isNew);
      const updatedListings = listings.filter((l) => l.hasResults);

      this.logger.log(`Found ${newListings.length} new listings and ${updatedListings.length} updated listings`);

      // Process new and updated listings
      const toProcess = [...newListings, ...updatedListings];
      
      for (const listing of toProcess) {
        try {
          // Determine status based on user rules
          let status: IpoStatus = IpoStatus.UPCOMING;
          
          if (listing.isDraft) {
              status = IpoStatus.DRAFT;
          } else {
              if (!listing.isNew) {
                  listing.hasResults = true;
              }
              status = listing.hasResults ? IpoStatus.COMPLETED : IpoStatus.UPCOMING;
          }

          // Download logo if exists and not already local
          let localLogoUrl = listing.logoUrl;
          if (listing.logoUrl && listing.logoUrl.startsWith('http')) {
             localLogoUrl = await this.downloadImage(listing.logoUrl, listing.bistCode);
          }

          const savedListing = await this.ipoService.createOrUpdateListing({
            ...listing,
            logoUrl: localLogoUrl,
            status,
          });

          const realBistCode = await this.scrapeListingDetail(savedListing.id, listing.detailUrl);

          if (realBistCode && listing.bistCode.startsWith('TEMP-') && realBistCode !== listing.bistCode) {
              this.logger.log(`Updating TEMP BIST code ${listing.bistCode} to ${realBistCode}`);
              
              let newLogoUrl = undefined;
              if (localLogoUrl) {
                  const renamedUrl = await this.renameImage(localLogoUrl, realBistCode);
                  if (renamedUrl) {
                      newLogoUrl = renamedUrl;
                  }
              }
              
              await this.ipoService.updateListingBistCode(savedListing.id, realBistCode, newLogoUrl);
          }

          this.logger.log(`Updated ${listing.bistCode} - ${listing.companyName}`);
        } catch (error) {
          this.logger.error(`Error updating ${listing.bistCode}: ${error.message}`);
        }
      }

      this.logger.log('Daily IPO sync completed successfully');
    } catch (error) {
      this.logger.error(`Daily sync failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Load all listings by clicking "Load More" button
   */
  private async loadAllListings(page: Page): Promise<void> {
    this.logger.log('Loading all listings...');

    try {
      const clickCount = await page.evaluate(async () => {
        let count = 0;
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        while (true) {
          const button = document.querySelector('.misha_loadmore') as HTMLElement;
          if (!button || button.offsetParent === null) { // Request to check visibility or existence
            break;
          }

          button.click();
          count++;
          
          // Wait for AJAX based load. 
          // We can check if new items appeared or just wait a safe buffer.
          // halkarz.com usually takes 1-2 seconds.
          await sleep(3000); 
        }
        return count;
      });
      
      this.logger.log(`Loaded all listings after ${clickCount} clicks (browser-side logic)`);
      
      // Safety wait
      await page.waitForTimeout(3000);
    } catch (error) {
       this.logger.warn(`Error in browser-side load more: ${error.message}`);
    }
  }

  /**
   * Scrape all listings from the current page
   */
  private async scrapeListingsFromPage(page: Page): Promise<ScrapedListing[]> {
    return page.evaluate(() => {
      const listings: ScrapedListing[] = [];
      // Select all lists including drafts/preparing ones
      const elements = document.querySelectorAll('.halka-arz-list li .index-list');

      elements.forEach((element) => {
        try {
          // Extract company name first as it is essential
          const companyNameEl = element.querySelector('.il-halka-arz-sirket a');
          const companyName = companyNameEl?.textContent?.trim() || '';
          
          if (!companyName) return;

          // Extract detail URL
          const detailUrl = (companyNameEl as HTMLAnchorElement)?.href || '';

          // Extract BIST code
          let bistCodeEl = element.querySelector('.il-bist-kod');
          let bistCode = bistCodeEl?.textContent?.trim() || '';
          
          // If BIST code is missing (common for "Hazırlanıyor" status), generate a temp one from name
          if (!bistCode) {
              // Create a deterministic slug from company name to prevent duplicates on re-runs
              // e.g. "TEMP-Z-GAYRIMENKUL"
              const slug = companyName
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 20); // Limit length
              bistCode = `TEMP-${slug}`;
          }

          // Extract IPO date - support both time tag and direct text
          const ipoDateContainer = element.querySelector('.il-halka-arz-tarihi');
          let ipoDate = '';
          if (ipoDateContainer) {
             const timeEl = ipoDateContainer.querySelector('time');
             if (timeEl) {
                 ipoDate = timeEl.textContent?.trim() || '';
             } else {
                 ipoDate = ipoDateContainer.textContent?.trim() || '';
             }
          }

          // Extract logo URL
          const logoEl = element.querySelector('img.slogo');
          const logoUrl = (logoEl as HTMLImageElement)?.src || '';

          // Check for badges
          const isNew = !!element.querySelector('.il-new');
          const hasResults = !!element.querySelector('.fa-check-double.snc-badge');

          // Check if this is a draft listing (parent ul has class .taslak)
          const parentList = element.closest('ul');
          const isDraft = parentList?.classList.contains('taslak') || false;

          listings.push({
            bistCode,
            companyName,
            ipoDate,
            detailUrl,
            logoUrl,
            isNew,
            hasResults,
            isDraft,
          });
        } catch (error) {
          console.error('Error parsing listing element:', error);
        }
      });

      return listings;
    });
  }

  /**
   * Scrape detail page for a specific IPO
   */
  private async scrapeListingDetail(listingId: string, detailUrl: string): Promise<string | null> {
    let browser: Browser | null = null;
    let foundBistCode: string | null = null;

    try {
      // Ortak scraping servisi ile browser oluştur
      const { browser: createdBrowser, context: createdContext, page: createdPage } = 
        await this.scrapingService.createStealthBrowser(this.serviceName);
      
      browser = createdBrowser;
      const context = createdContext;
      const page = createdPage;

      // Navigate to detail page (gerçekçi şekilde)
      await this.scrapingService.navigateWithStealth(page, detailUrl, {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      // Extract detail data
      const detailFullData = await page.evaluate(() => {
        const data: any = {};
        let extractedBistCode = null;

        // Try to find BIST code in header
        const headerBistEl = document.querySelector('.il-bist-kod');
        if (headerBistEl) {
            extractedBistCode = headerBistEl.textContent?.trim();
        }

        // Extract from sp-table
        const table = document.querySelector('.sp-table');
        if (table) {
          const rows = table.querySelectorAll('tr');
          rows.forEach((row) => {
            const label = row.querySelector('em')?.textContent?.trim();
            const valueCell = row.querySelectorAll('td')[1];

            if (label && valueCell) {
              if (label.includes('Halka Arz Tarihi')) {
                data.ipoDate = valueCell.querySelector('time')?.textContent?.trim() || valueCell.textContent?.trim()?.replace(':', '')?.trim();
                data.ipoDateTimeRange = valueCell.querySelector('small')?.textContent?.trim();
              } else if (label.includes('Halka Arz Fiyatı')) {
                data.ipoPrice = valueCell.querySelector('strong')?.textContent?.trim();
              } else if (label.includes('Dağıtım Yöntemi')) {
                data.distributionMethod = valueCell.querySelector('strong')?.textContent?.trim();
              } else if (label.includes('Fiili Dolaşımdaki Pay') && label.includes(':')) {
                // Daha spesifik kontrolü önce yapıyoruz - "Fiili Dolaşımdaki Pay :" (colon ile)
                data.actualCirculation = valueCell.querySelector('strong')?.textContent?.trim();
              } else if (label.includes('Fiili Dolaşımdaki Pay Oranı')) {
                // Daha spesifik kontrolü önce yapıyoruz - "Fiili Dolaşımdaki Pay Oranı"
                data.actualCirculationPct = valueCell.querySelector('strong')?.textContent?.trim();
              } else if (label.includes('Pay') && !label.includes('Fiili Dolaşımdaki')) {
                // Genel "Pay" kontrolü - ama "Fiili Dolaşımdaki Pay" içermemeli
                // Ayrıca "Oranı" veya "Oran" içermemeli (bu actualCirculationPct için)
                if (!label.includes('Oranı') && !label.includes('Oran')) {
                data.shareAmount = valueCell.querySelector('strong')?.textContent?.trim();
                }
              } else if (label.includes('Aracı Kurum')) {
                data.intermediary = valueCell.querySelector('strong')?.textContent?.trim();
                const consortium: string[] = [];
                valueCell.querySelectorAll('.konsorsym li').forEach((li) => {
                  consortium.push(li.textContent?.trim() || '');
                });
                data.consortium = consortium;
              } else if (label.includes('Bist İlk İşlem Tarihi')) {
                data.firstTradeDate = valueCell.querySelector('strong')?.textContent?.trim();
              } else if (label.includes('Pazar')) {
                data.market = valueCell.querySelector('strong')?.textContent?.trim();
              } else if (label.includes('Bist Kodu')) { 
                 const tableBist = valueCell.querySelector('strong')?.textContent?.trim();
                 if (tableBist && !extractedBistCode) extractedBistCode = tableBist;
              }
            }
          });
        }

        // Extract summary info (Özet Bilgiler)
        const summaryEl = document.querySelector('.sp-arz-extra');
        if (summaryEl) {
          const summaryItems: any[] = [];
          summaryEl.querySelectorAll('li').forEach((li) => {
            const title = li.querySelector('h5')?.textContent?.trim();
            // Get content but remove links to halkarz.com to sanitize
            let contentHtml = li.querySelector('p')?.innerHTML || '';
            // Simple removal of anchor tags
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentHtml;
            tempDiv.querySelectorAll('a').forEach(a => {
                a.replaceWith(a.textContent || '');
            });
            const content = tempDiv.innerHTML.trim();

            const tableData: any = {};

            // Check for table
            const table = li.querySelector('table');
            if (table) {
              const headers: string[] = [];
              table.querySelectorAll('th').forEach((th) => {
                headers.push(th.textContent?.trim() || '');
              });

              const rows: any[] = [];
              table.querySelectorAll('tbody tr').forEach((tr) => {
                const cells: string[] = [];
                tr.querySelectorAll('td').forEach((td) => {
                  cells.push(td.textContent?.trim() || '');
                });
                if (cells.length > 0) {
                  rows.push(cells);
                }
              });

              tableData.headers = headers;
              tableData.rows = rows;
            }

            if (title || content) {
              summaryItems.push({
                title,
                content, // Sanitized text content (HTML preserved but no links)
                table: Object.keys(tableData).length > 0 ? tableData : null,
              });
            }
          });
          data.summaryInfo = summaryItems;
        }

        // Extract company info
        const companyEl = document.querySelector('.sirket-hakkinda .sh-content');
        if (companyEl) {
          data.companyDescription = companyEl.querySelector('p')?.textContent?.trim();
          data.city = companyEl.querySelector('.shc-city')?.textContent?.replace('Şehir :', '')?.trim();
          data.foundedDate = companyEl.querySelector('.shc-founded')?.textContent?.replace('Kuruluş Tarihi :', '')?.trim();
        }

        // Extract attachments
        const attachmentsEl = document.querySelector('.ekler .ek-content');
        if (attachmentsEl) {
          const attachments: any[] = [];
          attachmentsEl.querySelectorAll('a').forEach((a) => {
             // Keep external links for PDFs as they usually point to KAP or company site
             // But verify they don't point to halkarz.com internal pages unless necessary
            attachments.push({
              title: a.textContent?.trim(),
              url: a.getAttribute('href'),
            });
          });
          data.attachments = attachments;
        }

        // Extract last modified
        const lastModifiedEl = document.querySelector('.last-modified time');
        if (lastModifiedEl) {
          data.lastModified = lastModifiedEl.textContent?.trim();
        }

        return { data, extractedBistCode };
      });

      const { data: detailData, extractedBistCode } = detailFullData;
      foundBistCode = extractedBistCode;

      // Save detail data
      await this.ipoService.createOrUpdateDetail(listingId, detailData);

      // Extract and save results (if available)
      const rawResultsData = await page.evaluate(() => {
        const resultsTable = document.querySelector('.as-table');
        if (!resultsTable) return null;

        const rawRows: any[] = [];
        resultsTable.querySelectorAll('tbody tr').forEach((tr) => {
          const cells: string[] = [];
          tr.querySelectorAll('td').forEach((td) => {
             cells.push(td.textContent?.trim() || '');
          });
          if (cells.length > 0) {
            rawRows.push(cells);
          }
        });

        return rawRows.length > 0 ? rawRows : null;
      });

      if (rawResultsData) {
        // Parse raw table data into structured format
        const resultsData = parseResultsTable(rawResultsData);
        await this.ipoService.createOrUpdateResults(listingId, resultsData);
      }

      // Extract and save application places
      const applicationPlaces = await page.evaluate(() => {
        const placesEl = document.querySelector('.spad-list');
        if (!placesEl) return [];

        const places: Array<{ name: string; isConsortium: boolean; isUnlisted: boolean }> = [];
        placesEl.querySelectorAll('li').forEach((li) => {
          const name = li.textContent?.trim() || '';
          const isConsortium = li.classList.contains('konsorsiyum');
          const isUnlisted = li.classList.contains('unlist');

          if (name) {
            places.push({ name, isConsortium, isUnlisted });
          }
        });

        return places;
      });

      if (applicationPlaces.length > 0) {
        await this.ipoService.createApplicationPlaces(listingId, applicationPlaces);
      }
      
      return foundBistCode;
    } catch (error) {
      this.logger.error(`Error scraping detail page ${detailUrl}: ${error.message}`);
      // Don't throw here, allow other listings to proceed
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Download image and save locally
   */
  private async downloadImage(url: string, prefix: string): Promise<string | null> {
    if (!url) return null;

    try {
      const ext = path.extname(url).split('?')[0] || '.jpg';
      const filename = `${prefix.toLowerCase().replace(/[^a-z0-9]/g, '')}${ext}`;
      const filePath = path.join(this.uploadDir, filename);
      const publicUrl = `/uploads/ipo/${filename}`;

      // Check if already exists
      if (fs.existsSync(filePath)) {
        return publicUrl;
      }

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(publicUrl));
        writer.on('error', reject);
      });
    } catch (error) {
      this.logger.warn(`Failed to download image ${url}: ${error.message}`);
      return null; // Return null if failed, client can fallback or show placeholder
    }
    }

  /**
   * Rename local image file when BIST code changes
   */
  private async renameImage(oldUrl: string, newBistCode: string): Promise<string | null> {
    if (!oldUrl || !oldUrl.includes('/uploads/ipo/')) return null;

    try {
      const oldFilename = path.basename(oldUrl);
      const oldPath = path.join(this.uploadDir, oldFilename);
      
      if (!fs.existsSync(oldPath)) return null;

      const ext = path.extname(oldFilename);
      const newFilename = `${newBistCode.toLowerCase().replace(/[^a-z0-9]/g, '')}${ext}`;
      const newPath = path.join(this.uploadDir, newFilename);

      fs.renameSync(oldPath, newPath);
      
      return `/uploads/ipo/${newFilename}`;
    } catch (error) {
      this.logger.warn(`Failed to rename image from ${oldUrl} for ${newBistCode}: ${error.message}`);
      return null;
    }
  }
}
