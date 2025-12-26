import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { MarketDataItem } from '../dto/market-data.dto';

@Injectable()
export class HaremAltinProvider {
  private readonly logger = new Logger(HaremAltinProvider.name);
  private readonly baseUrl = 'https://canlipiyasalar.haremaltin.com';

  constructor() {}

  /**
   * Harem Altın'dan altın fiyatlarını web scraping ile getir
   * Tablo: #view > section.dashboard-content.container-fluid > div > div > div > div:nth-child(1)
   * Vue.js render edilmiş sayfayı Playwright ile alıyoruz
   */
  async getGoldPrices(): Promise<MarketDataItem[]> {
    let browser: any = null;
    let page: any = null;
    try {
      // Playwright browser başlat
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      page = await browser.newPage();
      
      // User agent ayarla
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });
      
      // Sayfayı yükle
      await page.goto(this.baseUrl, {
        waitUntil: 'networkidle',
        timeout: 15000,
      });

      // Vue.js'in render etmesini bekle
      // Dashboard content'in görünmesini bekle
      await page.waitForSelector('#view section.dashboard-content', {
        timeout: 10000,
      });
      
      // Tabloların render edilmesini bekle
      await page.waitForFunction(
        () => {
          const dashboard = document.querySelector('#view section.dashboard-content');
          if (!dashboard) return false;
          const tables = dashboard.querySelectorAll('table');
          return tables.length > 0;
        },
        { timeout: 10000 }
      );
      
      // Ekstra bekleme - Vue.js'in tüm verileri yüklemesi için
      await page.waitForTimeout(2000);
      
      // Render edilmiş HTML'i al
      const html = await page.content();
      
      const $ = cheerio.load(html);
      const goldData: MarketDataItem[] = [];

      // Tablo selector: #view > section.dashboard-content.container-fluid > div > div > div > div:nth-child(1)
      const dashboardContent = $('#view section.dashboard-content.container-fluid');
      
      if (dashboardContent.length === 0) {
        this.logger.warn('Dashboard content bulunamadı');
        return [];
      }

      // İlk div > div > div > div:nth-child(1) altındaki tabloyu bul
      const targetDiv = dashboardContent.find('div > div > div > div').first();
      
      // Bu div altındaki tüm tabloları bul
      let tables = targetDiv.find('table');
      
      if (tables.length === 0) {
        // Alternatif: dashboard-content içindeki tüm tabloları ara
        tables = dashboardContent.find('table');
      }
      
      if (tables.length === 0) {
        this.logger.warn('Hiç tablo bulunamadı');
        return [];
      }
      
      tables.each((index, table) => {
        this.parseTable($(table), goldData, index, $);
      });

      this.logger.debug(`Harem Altın'dan ${goldData.length} altın fiyatı başarıyla alındı`);
      return goldData;
    } catch (error: any) {
      this.logger.error(`Harem Altın scraping hatası: ${error.message}`, error.stack);
      return [];
    } finally {
      // Sayfayı kapat
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Sayfa zaten kapalı
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

  /**
   * Tablodan altın fiyatlarını parse et
   */
  private parseTable($table: cheerio.Cheerio, goldData: MarketDataItem[], tableIndex: number, cheerioApi: ReturnType<typeof cheerio.load>): void {
    const rows = $table.find('tbody tr, tr');
    
    if (rows.length === 0) {
      return;
    }

    rows.each((index, element) => {
      const $row = cheerioApi(element);
      const cells = $row.find('td');
      
      if (cells.length < 4) {
        return; // Başlık satırı veya geçersiz satır (en az 4 sütun: isim, alış, satış, değişim)
      }

      // İlk hücreden isim al - <a> tag'i içinde ve <br> ile bölünmüş olabilir
      const firstCell = $row.find('td:first-child');
      // HTML içeriğini al, sonra <br> tag'lerini boşlukla değiştir
      let nameHtml = firstCell.find('a').html() || firstCell.html() || '';
      // <br> tag'lerini boşlukla değiştir (büyük/küçük harf duyarsız)
      let name = nameHtml.replace(/<br\s*\/?>/gi, ' ');
      // Tüm HTML tag'lerini kaldır
      name = name.replace(/<[^>]*>/g, '');
      // Fazla boşlukları temizle ve normalize et
      name = name.replace(/\s+/g, ' ').trim();
      
      // Özel durumlar: Bitişik yazılan kelimeleri ayır
      // YENİÇEYREK -> YENİ ÇEYREK, YENİYARIM -> YENİ YARIM, vs.
      name = name.replace(/(YENİ|ESKİ)(ÇEYREK|YARIM|TAM|ATA|ATA5|GREMSE)/gi, '$1 $2');
      name = name.replace(/(HAS)(ALTIN)/gi, '$1 $2');
      name = name.replace(/(GRAM)(ALTIN)/gi, '$1 $2');
      name = name.replace(/(22|14)(AYAR)/gi, '$1 $2');
      name = name.replace(/(GÜMÜŞ|GUMUS)(TL|ONS|USD)/gi, '$1 $2');
      name = name.replace(/(PLATİN|PLATIN|PALADYUM)(ONS|USD)/gi, '$1 $2');
      name = name.replace(/(ALTIN)(GÜMÜŞ|GUMUS)/gi, '$1 $2');
      
      if (!name || name.length === 0) {
        return;
      }

      // İkinci sütun: Alış fiyatı (span.price içinde)
      const buyPriceText = cells.eq(1).find('span.price').text().trim() || cells.eq(1).text().trim();
      const buyPrice = this.parsePrice(buyPriceText, name);

      // Üçüncü sütun: Satış fiyatı (span.price içinde)
      const sellPriceText = cells.eq(2).find('span.price').text().trim() || cells.eq(2).text().trim();
      const sellPrice = this.parsePrice(sellPriceText, name);

      // Dördüncü sütun: Değişim yüzdesi (span.rate içinde, % işareti ile)
      const changePercentText = cells.eq(3).find('span.rate').text().trim() || cells.eq(3).text().trim();
      const changePercent = this.parsePercent(changePercentText);

      if (buyPrice === 0 && sellPrice === 0) {
        return; // Fiyat bulunamadı
      }

      const avgPrice = sellPrice > 0 ? (buyPrice + sellPrice) / 2 : buyPrice;
      const change = (changePercent / 100) * avgPrice;

      // İsim normalizasyonu - <br> tag'lerini kaldır ve boşlukları düzenle
      const normalizedName = name.toUpperCase().replace(/\s+/g, ' ').trim();

      // Symbol mapping - tüm altın türlerini kapsayacak şekilde genişletildi
      const symbolMap: Record<string, string> = {
        'HAS ALTIN': 'HAS_ALTIN',
        'HAS': 'HAS_ALTIN',
        'ONS': 'ONS_ALTIN',
        'GRAM ALTIN': 'GRAM_ALTIN',
        'GRAM': 'GRAM_ALTIN',
        '22 AYAR': 'AYAR_22',
        '22': 'AYAR_22',
        'YENİ ÇEYREK': 'CEYREK_YENI',
        'ESKİ ÇEYREK': 'CEYREK_ESKI',
        'ÇEYREK': 'CEYREK_ALTIN',
        'YENİ YARIM': 'YARIM_YENI',
        'ESKİ YARIM': 'YARIM_ESKI',
        'YARIM': 'YARIM_ALTIN',
        'YENİ TAM': 'TAM_YENI',
        'ESKİ TAM': 'TAM_ESKI',
        'TAM': 'TAM_ALTIN',
        'YENİ ATA': 'ATA_YENI',
        'ESKİ ATA': 'ATA_ESKI',
        'ATA': 'ATA_ALTIN',
        'YENİ ATA5': 'ATA5_YENI',
        'ESKİ ATA5': 'ATA5_ESKI',
        'ATA5': 'ATA_5LI',
        'ATA 5': 'ATA_5LI',
        'YENİ GREMSE': 'GREMSE_YENI',
        'ESKİ GREMSE': 'GREMSE_ESKI',
        'GREMSE': 'GREMSE_ALTIN',
        '14 AYAR': 'AYAR_14',
        '14': 'AYAR_14',
        'GÜMÜŞ TL': 'GRAM_GUMUS',
        'GÜMÜŞ ONS': 'ONS_GUMUS',
        'GÜMÜŞ USD': 'GUMUS_USD',
        'PLATİN ONS': 'PLATIN_ONS',
        'PALADYUM ONS': 'PALADYUM_ONS',
        'PLATİN/USD': 'PLATIN_USD',
        'PALADYUM/USD': 'PALADYUM_USD',
      };

      // Symbol bul - önce tam eşleşme, sonra kısmi eşleşme (uzun olanlar önce)
      let symbol = symbolMap[normalizedName];
      if (!symbol) {
        // Kısmi eşleşme dene - önce daha spesifik (uzun) olanları kontrol et
        const sortedKeys = Object.keys(symbolMap).sort((a, b) => b.length - a.length);
        for (const key of sortedKeys) {
          // Tam eşleşme öncelikli
          if (normalizedName === key) {
            symbol = symbolMap[key];
            break;
          }
          // Kısmi eşleşme: normalizedName key'i içeriyorsa
          if (normalizedName.includes(key) && normalizedName !== key) {
            // Özel durumlar: "ONS" kısa olduğu için dikkatli ol
            // "GÜMÜŞ ONS" için "GÜMÜŞ ONS" key'ini kullan, "ONS" değil
            if (key === 'ONS') {
              // Sadece "ONS" ise (GÜMÜŞ içermiyorsa) kullan
              if (!normalizedName.includes('GÜMÜŞ') && !normalizedName.includes('GUMUS') && 
                  !normalizedName.includes('PLATİN') && !normalizedName.includes('PLATIN') &&
                  !normalizedName.includes('PALADYUM')) {
                symbol = symbolMap[key];
                break;
              }
            } else {
              // Diğer key'ler için normal eşleşme
              symbol = symbolMap[key];
              break;
            }
          }
        }
      }
      
      // Eğer hala bulunamadıysa, isimden oluştur
      if (!symbol) {
        symbol = normalizedName.replace(/\s+/g, '_').replace(/\//g, '_');
      }
      
      // YENİ/ESKİ prefix kontrolü - symbol mapping'de zaten var ama emin olmak için
      // Eğer symbol mapping'de YENİ/ESKİ varsa zaten doğru, yoksa ekle
      if ((normalizedName.includes('YENİ') || normalizedName.includes('ESKİ')) && 
          !symbol.includes('YENI') && !symbol.includes('ESKI')) {
        // Symbol mapping'de bulunamadıysa, prefix ekle
        const prefix = normalizedName.includes('YENİ') ? 'YENI_' : 'ESKI_';
        symbol = prefix + symbol;
      }

      // Atlanacak pattern'ler - sadece döviz çiftleri (USD/KG, EUR/KG)
      const skipPatterns = ['USD/KG', 'EUR/KG'];
      const shouldSkip = skipPatterns.some(pattern => normalizedName === pattern || normalizedName === pattern.replace('/', '/'));
      
      if (shouldSkip) {
        return;
      }

      // Tüm altın/gümüş/platin/paladyum içeren satırları ekle
      // ALTIN GÜMÜŞ oranını da ekle (altın/gümüş oranı)
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
          symbolMap[normalizedName] ||
          symbol.includes('ALTIN') ||
          symbol.includes('GUMUS') ||
          symbol.includes('PLATIN') ||
          symbol.includes('PALADYUM') ||
          symbol.includes('AYAR') ||
          symbol.includes('CEYREK') ||
          symbol.includes('YARIM') ||
          symbol.includes('TAM') ||
          symbol.includes('ATA') ||
          symbol.includes('GREMSE');

      if (isCommodity) {
        goldData.push({
          symbol,
          name: name,
          price: buyPrice,
          change: change || 0,
          changePercent: changePercent || 0,
          isUp: changePercent >= 0,
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
