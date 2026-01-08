import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { ScrapingService } from '../../common/scraping/scraping.service';
import { MarketDataItem } from '../dto/market-data.dto';

@Injectable()
export class HaremAltinProvider {
  private readonly logger = new Logger(HaremAltinProvider.name);
  private readonly baseUrl = 'https://www.haremaltin.com/';
  private readonly serviceName = 'harem-altin';
  
  // Retry mekanizması için state
  private consecutiveFailures = 0;
  private lastFailureTime: number | null = null;
  private readonly MAX_CONSECUTIVE_FAILURES = 5;
  private readonly COOLDOWN_PERIOD = 60 * 60 * 1000; // 1 saat (milisaniye)

  constructor(private readonly scrapingService: ScrapingService) {}

  /**
   * Harem Altın'dan altın fiyatlarını web scraping ile getir
   * Tablo: .tab-currency-gold > .tableContent > .table
   * HTML tablosundan direkt veri çekiyoruz
   * Retry mekanizması ile daha güvenilir hale getirildi
   * 5 başarısız denemeden sonra 1 saat cooldown period
   */
  async getGoldPrices(): Promise<MarketDataItem[]> {
    // Cooldown period kontrolü
    if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES && this.lastFailureTime) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.COOLDOWN_PERIOD) {
        const remainingMinutes = Math.ceil((this.COOLDOWN_PERIOD - timeSinceLastFailure) / (60 * 1000));
        this.logger.warn(
          `Harem Altın scraping cooldown period'da. ${remainingMinutes} dakika sonra tekrar denenecek. ` +
          `(${this.consecutiveFailures} başarısız deneme)`
        );
        return []; // Boş array döndür, DB'den veri çekilecek
      } else {
        // Cooldown period geçti, reset
        this.logger.log('Harem Altın scraping cooldown period bitti, tekrar denenecek');
        this.consecutiveFailures = 0;
        this.lastFailureTime = null;
      }
    }

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let browser: any = null;
      let context: any = null;
      let page: any = null;
      
      try {
        // Ortak scraping servisi ile browser oluştur (bot tespitinden kaçınmak için)
        const { browser: createdBrowser, context: createdContext, page: createdPage } = 
          await this.scrapingService.createStealthBrowser(this.serviceName);
        
        browser = createdBrowser;
        context = createdContext;
        page = createdPage;
        
        // Sayfaya gerçekçi bir şekilde git
        await this.scrapingService.navigateWithStealth(page, this.baseUrl, {
          waitUntil: 'load',
          timeout: 60000,
        });
        
        // Altın fiyatları tablosunun görünmesini bekle
        await page.waitForSelector('.tab-currency-gold .table', {
          timeout: 30000,
          state: 'attached',
        });
        
        // Tablo içeriğinin yüklenmesini bekle
        await page.waitForFunction(
          () => {
            const table = document.querySelector('.tab-currency-gold .table');
            if (!table) return false;
            const rows = table.querySelectorAll('tbody tr');
            return rows.length > 0;
          },
          { timeout: 30000 }
        );
        
        // İnsan benzeri rastgele bekleme (tablo yüklendikten sonra)
        await this.scrapingService.humanLikeDelay(800, 2000);
        
        // Tabloya scroll yap (daha gerçekçi)
        await this.scrapingService.scrollToElement(page, '.tab-currency-gold .table');
        
        // Render edilmiş HTML'i al
        const html = await page.content();
        
        const $ = cheerio.load(html);
        const goldData: MarketDataItem[] = [];

        // Tablo selector: .tab-currency-gold > .tableContent > .table
        const goldTable = $('.tab-currency-gold .table');
        
        if (goldTable.length === 0) {
          this.logger.warn('Altın fiyatları tablosu bulunamadı');
          return [];
        }

        // Tabloyu parse et
        this.parseTable(goldTable, goldData, 0, $);

        // Başarılı! Consecutive failures'ı sıfırla
        this.consecutiveFailures = 0;
        this.lastFailureTime = null;
        
        this.logger.debug(`Harem Altın'dan ${goldData.length} altın fiyatı başarıyla alındı (deneme ${attempt}/${maxRetries})`);
        return goldData;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Harem Altın scraping denemesi ${attempt}/${maxRetries} başarısız: ${error.message}`);
        
        // Son deneme değilse, bir sonraki deneme öncesi bekle
        if (attempt < maxRetries) {
          const waitTime = 2000 * attempt; // 2s, 4s, 6s...
          this.logger.debug(`${waitTime}ms bekleniyor, sonra tekrar denenecek...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } finally {
        // Cookie'leri kaydet (context kapanmadan ÖNCE - sayfa kapatılmadan önce)
        if (context && page) {
          try {
            // Sayfa ve context hala açıkken cookie'leri kaydet
            await this.scrapingService.saveCookiesManually(context, this.serviceName);
          } catch (e: any) {
            // Cookie kaydetme kritik değil, sadece debug log
            if (!e.message?.includes('closed') && !e.message?.includes('Target')) {
              this.logger.debug(`Cookie kaydetme hatası: ${e.message}`);
            }
          }
        }
        
        // Sayfayı kapat
        if (page) {
          try {
            await page.close();
          } catch (e) {
            // Sayfa zaten kapalı
          }
        }
        
        // Context'i kapat
        if (context) {
          try {
            await context.close();
          } catch (e) {
            // Context zaten kapalı
          }
        }
        
        // Browser'ı kapat
        if (browser) {
          try {
            await browser.close();
          } catch (e) {
            // Browser zaten kapalı
          }
        }
      }
    }
    
    // Tüm denemeler başarısız
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();
    
    this.logger.error(
      `Harem Altın scraping tüm denemeler başarısız: ${lastError?.message} ` +
      `(${this.consecutiveFailures}/${this.MAX_CONSECUTIVE_FAILURES} başarısız deneme)`,
      lastError?.stack
    );
    
    // 5 başarısız denemeden sonra cooldown period'a gir
    if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      this.logger.warn(
        `Harem Altın scraping ${this.MAX_CONSECUTIVE_FAILURES} kez başarısız oldu. ` +
        `1 saat cooldown period başlatıldı. DB'den son veri kullanılacak.`
      );
    }
    
    return [];
  }

  /**
   * Tablodan altın fiyatlarını parse et
   */
  private parseTable($table: cheerio.Cheerio, goldData: MarketDataItem[], tableIndex: number, cheerioApi: ReturnType<typeof cheerio.load>): void {
    const rows = $table.find('tbody tr');
    
    if (rows.length === 0) {
      return;
    }

    rows.each((index, element) => {
      const $row = cheerioApi(element);
      
      // "GENİŞ TAKİP EKRANI" satırını atla
      if ($row.find('.genis-takip-satir').length > 0) {
        return;
      }
      
      // TR ID'sinden symbol çıkar (tr__ALTIN -> ALTIN, tr__KULCEALTIN -> KULCEALTIN)
      const trId = $row.attr('id') || '';
      const symbolFromId = trId.replace('tr__', '');
      
      if (!symbolFromId || symbolFromId.length === 0) {
        return; // ID yoksa atla
      }
      
      // İsim: .span-isim içindeki ilk text (br'den önceki kısım)
      const nameSpan = $row.find('.span-isim');
      let name = nameSpan.clone().children().remove().end().text().trim();
      
      // Eğer name boşsa, .priceHead.isim içindeki text'i al
      if (!name || name.length === 0) {
        name = $row.find('.priceHead.isim').text().trim();
      }
      
      // HTML tag'lerini temizle
      name = name.replace(/<[^>]*>/g, '').trim();
      
      if (!name || name.length === 0) {
        return;
      }

      // Alış fiyatı: #alis__[SYMBOL]
      const buyPriceId = `alis__${symbolFromId}`;
      const buyPriceText = $row.find(`#${buyPriceId}`).text().trim();
      const buyPrice = this.parsePrice(buyPriceText, name);

      // Satış fiyatı: #satis__[SYMBOL]
      const sellPriceId = `satis__${symbolFromId}`;
      const sellPriceText = $row.find(`#${sellPriceId}`).text().trim();
      const sellPrice = this.parsePrice(sellPriceText, name);

      // Değişim yüzdesi: #yuzde__[SYMBOL]
      const changePercentId = `yuzde__${symbolFromId}`;
      const changePercentText = $row.find(`#${changePercentId}`).text().trim();
      const changePercent = this.parsePercent(changePercentText);
      
      // Yön kontrolü: updown__[SYMBOL] içindeki class'a göre (rise/drop)
      const updownId = `updown__${symbolFromId}`;
      const updownElement = $row.find(`#${updownId}`);
      const isUp = updownElement.hasClass('rise');

      if (buyPrice === 0 && sellPrice === 0) {
        return; // Fiyat bulunamadı
      }

      const avgPrice = sellPrice > 0 ? (buyPrice + sellPrice) / 2 : buyPrice;
      const change = (changePercent / 100) * avgPrice;

      // Symbol mapping - ID'den gelen symbol'i normalize et
      const symbolMap: Record<string, string> = {
        'ALTIN': 'HAS_ALTIN',
        'ONS': 'ONS_ALTIN',
        'KULCEALTIN': 'GRAM_ALTIN',
        'AYAR22': 'AYAR_22',
        'CEYREK_YENI': 'CEYREK_YENI',
        'CEYREK_ESKI': 'CEYREK_ESKI',
        'YARIM_YENI': 'YARIM_YENI',
        'YARIM_ESKI': 'YARIM_ESKI',
        'TEK_YENI': 'TAM_YENI',
        'TEK_ESKI': 'TAM_ESKI',
        'ATA_YENI': 'ATA_YENI',
        'ATA_ESKI': 'ATA_ESKI',
        'ATA5_YENI': 'ATA5_YENI',
        'ATA5_ESKI': 'ATA5_ESKI',
        'GREMESE_YENI': 'GREMSE_YENI',
        'GREMESE_ESKI': 'GREMSE_ESKI',
        'AYAR14': 'AYAR_14',
        'GUMUSTRY': 'GRAM_GUMUS',
        'XAGUSD': 'ONS_GUMUS',
        'GUMUSUSD': 'GUMUS_USD',
        'XPTUSD': 'PLATIN_ONS',
        'XPDUSD': 'PALADYUM_ONS',
        'PLATIN': 'PLATIN_USD',
        'PALADYUM': 'PALADYUM_USD',
        'XAUXAG': 'ALTIN_GUMUS',
        'USDKG': 'USD_KG',
        'EURKG': 'EUR_KG',
      };

      // Symbol'ü ID'den al veya mapping'den bul
      let symbol = symbolMap[symbolFromId] || symbolFromId;

      // İsim normalizasyonu
      const normalizedName = name.toUpperCase().replace(/\s+/g, ' ').trim();

      // Atlanacak pattern'ler - döviz çiftleri (USD/KG, EUR/KG) - bunlar altın değil
      const skipPatterns = ['USD/KG', 'EUR/KG'];
      const shouldSkip = skipPatterns.some(pattern => 
        normalizedName === pattern || 
        normalizedName === pattern.replace('/', '/') ||
        symbolFromId === 'USDKG' ||
        symbolFromId === 'EURKG'
      );
      
      if (shouldSkip) {
        return;
      }

      // Tüm altın/gümüş/platin/paladyum içeren satırları ekle
      const isCommodity = normalizedName.includes('ALTIN') || 
          normalizedName.includes('GÜMÜŞ') || 
          normalizedName.includes('GUMUS') ||
          normalizedName.includes('PLATİN') ||
          normalizedName.includes('PLATIN') ||
          normalizedName.includes('PALADYUM') ||
          normalizedName.includes('ONS') ||
          normalizedName.includes('AYAR') ||
          normalizedName.includes('ÇEYREK') ||
          normalizedName.includes('YARIM') ||
          normalizedName.includes('TAM') ||
          normalizedName.includes('ATA') ||
          normalizedName.includes('GREMSE') ||
          symbol.includes('ALTIN') ||
          symbol.includes('GUMUS') ||
          symbol.includes('PLATIN') ||
          symbol.includes('PALADYUM') ||
          symbol.includes('AYAR') ||
          symbol.includes('CEYREK') ||
          symbol.includes('YARIM') ||
          symbol.includes('TAM') ||
          symbol.includes('ATA') ||
          symbol.includes('GREMSE') ||
          symbol.includes('ONS');

      if (isCommodity) {
        goldData.push({
          symbol,
          name: name,
          price: buyPrice,
          change: change || 0,
          changePercent: changePercent || 0,
          isUp: isUp,
          timestamp: Date.now(),
          category: 'commodity' as const,
          metadata: {
            buy: buyPrice,
            sell: sellPrice,
          },
        });
      }
    });
  }

  /**
   * Yüzde string'ini number'a çevir (%1.51 -> 1.51)
   */
  private parsePercent(percentStr: string): number {
    if (!percentStr) return 0;
    
    // % işaretini ve boşlukları temizle
    let cleaned = percentStr.replace(/[%\s]/g, '').trim();
    
    // Türk formatı: virgülü noktaya çevir
    cleaned = cleaned.replace(',', '.');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Fiyat string'ini number'a çevir
   * Harem Altın formatı: binlik ayırıcı nokta, ondalık virgül (6.234,56 -> 6234.56)
   * Altın fiyatları genellikle binlik ayırıcı olarak nokta kullanır (10.033 -> 10033)
   */
  private parsePrice(priceStr: string, itemName: string = ''): number {

    if (!priceStr) return 0;
    
    // TL, $ işaretlerini temizle
    let cleaned = priceStr
      .replace(/[₺$TL]/g, '')
      .trim();
    
    // Noktaları kaldır (binlik ayırıcı: 10.033 -> 10033)
    // Virgülü noktaya çevir (ondalık ayırıcı: 6.234,56 -> 6234.56, 99,99 -> 99.99)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}
