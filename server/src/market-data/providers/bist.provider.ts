import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { MarketDataItem } from '../dto/market-data.dto';
import { CacheService } from '../../cache/cache.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BistProvider {
  private readonly logger = new Logger(BistProvider.name);
  // Ana kaynak: mynet.com (detaylı veriler: high, low, volume, etc.)
  private readonly mynetBaseUrl = 'https://finans.mynet.com/borsa/canliborsa';
  private readonly GROUP_CACHE_KEY = 'bist:groups';
  private readonly GROUP_CACHE_TTL = 3600; // 1 saat - grup bilgileri değişmez
  private readonly DATA_CACHE_KEY = 'bist:last_data';
  private readonly DATA_CACHE_TTL = 86400; // 24 saat - borsa kapalıyken kullanılacak

  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * BIST borsasının açık olup olmadığını kontrol et (Türkiye saati)
   * Borsa açılış: 09:30, Kapanış: 18:15
   */
  private isMarketOpen(): boolean {
    // Türkiye saatini al
    const turkishTimeString = new Date().toLocaleString('en-US', { 
      timeZone: 'Europe/Istanbul',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    // Parse et: "MM/DD/YYYY, HH:MM" formatından
    const [datePart, timePart] = turkishTimeString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    
    const turkishDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );
    
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    const timeInMinutes = hourNum * 60 + minuteNum;

    // Hafta sonu kontrolü (Cumartesi = 6, Pazar = 0)
    const dayOfWeek = turkishDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    // Borsa açılış: 09:30 (570 dakika), Kapanış: 18:15 (1095 dakika)
    const marketOpenTime = 9 * 60 + 30; // 09:30
    const marketCloseTime = 18 * 60 + 15; // 18:15

    return timeInMinutes >= marketOpenTime && timeInMinutes < marketCloseTime;
  }

  /**
   * BIST hisse senetleri verilerini getir
   * Kaynak: mynet.com (detaylı veriler: high, low, volume, etc.)
   * Her hisse için: ad, fiyat, değişim, saat, BIST grubu ve detaylı metadata döner
   * Borsa kapalıysa cache'den son veriyi döner
   */
  async getBistData(): Promise<MarketDataItem[]> {
    // Borsa kapalıysa cache'den veri döndür
    if (!this.isMarketOpen()) {
      const cachedData = this.cacheService.get<MarketDataItem[]>(this.DATA_CACHE_KEY);
      if (cachedData && cachedData.length > 0) {
        this.logger.log(`Borsa kapalı - Cache'den ${cachedData.length} hisse verisi döndürüldü`);
        return cachedData;
      }
      this.logger.warn('Borsa kapalı ve cache\'de veri yok');
    }

    try {
      const mynetData = await this.getBistDataFromMynet();
      if (mynetData && mynetData.length > 0) {
        this.logger.debug(`mynet.com'dan ${mynetData.length} hisse verisi alındı`);
        
        // Veriyi cache'le
        this.cacheService.set(this.DATA_CACHE_KEY, mynetData, this.DATA_CACHE_TTL);
        
        // Gün sonu verilerini DB'ye kaydet (borsa kapanış saatine yakınsa)
        await this.saveDailyDataToDb(mynetData);
        
        return mynetData;
      }
    } catch (error: any) {
      this.logger.error(`mynet.com'dan veri alınamadı: ${error.message}`, error.stack);
      
      // Hata durumunda cache'den dönmeyi dene
      const cachedData = this.cacheService.get<MarketDataItem[]>(this.DATA_CACHE_KEY);
      if (cachedData && cachedData.length > 0) {
        this.logger.log(`Hata durumunda cache'den ${cachedData.length} hisse verisi döndürüldü`);
        return cachedData;
      }
    }

    // Veri alınamazsa boş array döndür
    this.logger.error('BIST veri kaynağı başarısız oldu');
    return [];
  }

  /**
   * finans.mynet.com'dan BIST verilerini çek
   * Detaylı veriler: high, low, volume, buy, sell, etc.
   * Tüm BIST gruplarını (100, 50, 30, TÜMÜ) çeker ve cache'ler
   */
  private async getBistDataFromMynet(): Promise<MarketDataItem[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.mynetBaseUrl, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        }),
      );

      const html = response.data as string;
      
      // Script tag'inden stocksData'yı bul (id="stocksData")
      const scriptMatch = html.match(/<script[^>]*id\s*=\s*["']stocksData["'][^>]*>([\s\S]*?)<\/script>/i);
      
      if (!scriptMatch || !scriptMatch[1]) {
        this.logger.error('stocksData script tag\'i bulunamadı');
        return [];
      }

      
      // Script içeriğinden stocksData değişkenini bul
      const scriptContent = scriptMatch[1];
      // console.log(scriptContent);
      // stocksData = "..." veya stocksData:"..." formatını ara
 
      
      return this.parseStocksData(scriptContent);
    } catch (error: any) {
      this.logger.error(`mynet.com scraping hatası: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * BIST endeks bilgilerini çek (BIST 100, BIST 50, BIST 30)
   * HTML'den dynamic-price-XU100, dynamic-direction-XU100 gibi class'ları parse eder
   */
  async getBistIndices(): Promise<Array<{ name: string; price: number; changePercent: number; isUp: boolean }>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.mynetBaseUrl, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        }),
      );

      const html = response.data as string;
      const $ = cheerio.load(html);
      
      const indices = [];
      
      // BIST endeksleri: XU100 (BIST 100), XU050 (BIST 50), XU030 (BIST 30)
      const indexMap = {
        'XU100': 'BIST 100',
        'XU050': 'BIST 50',
        'XU030': 'BIST 30',
      };

      for (const [xuCode, indexName] of Object.entries(indexMap)) {
        // Fiyat: dynamic-price-XU100 class'ından
        const priceElement = $(`.dynamic-price-${xuCode}`);
        const priceText = priceElement.text().trim().replace(/[₺$\s]/g, '');
        const price = this.parsePrice(priceText);

        // Değişim: dynamic-direction-XU100 class'ından
        const changeElement = $(`.dynamic-direction-${xuCode}`);
        const changeText = changeElement.text().trim();
        const changePercent = this.parsePercent(changeText);
        const isUp = changePercent >= 0;

        if (price > 0) {
          indices.push({
            name: indexName,
            price,
            changePercent,
            isUp,
          });
        }
      }

      return indices;
    } catch (error: any) {
      this.logger.error(`BIST endeks bilgileri çekilemedi: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * stocksData string'ini parse et
   * Format: H1844|1.553,00|1.573,00|1.540,00|-0,38|13:14|-1|1|1.552,00|1.553,00|1.561,05|31.129|48.593.797,00|CLEBI|*XU100*|hisseler/clebi-celebi/|_|...
   * Satırlar: |_| ile ayrılmış
   * Her satır: 1.id(ignore) | 2.son | 3.high | 4.low | 5.%fark | 6.saat | 7.? | 8.? | 9.alış | 10.satış | 11.aof | 12.hacim_lot | 13.hacim_tl | 14.hisse_adı | 15.grup | 16.link(ignore) | 17._(ignore)
   */
  private parseStocksData(stocksDataString: string): MarketDataItem[] {
      const allStockData: MarketDataItem[] = [];
      const groupMap: Record<string, string[]> = {}; // symbol -> groups mapping
    const stockMap: Record<string, MarketDataItem> = {}; // symbol -> stock data (duplicate'leri önlemek için)

    // |_| ile satırları böl
    const rows = stocksDataString.split('|_|').filter(row => row && row.trim().length > 0);

    rows.forEach((row) => {
      const parts = row.split('|');
          
      if (parts.length < 14) {
        return; // Geçersiz satır
          }

      // 1. id (H1844) - ignore
      // 2. Son fiyat
      const price = this.parsePrice(parts[1]?.trim() || '');
      // 3. En yüksek
      const high = this.parsePrice(parts[2]?.trim() || '');
      // 4. En düşük
      const low = this.parsePrice(parts[3]?.trim() || '');
      // 5. % Fark
      const changePercent = this.parsePercent(parts[4]?.trim() || '');
      // 6. Saat
      const time = parts[5]?.trim() || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      // 7. ? - ignore
      // 8. ? - ignore
      // 9. Alış fiyatı
      const buy = this.parsePrice(parts[8]?.trim() || '');
      // 10. Satış fiyatı
      const sell = this.parsePrice(parts[9]?.trim() || '');
      // 11. AOF
      const open = this.parsePrice(parts[10]?.trim() || '');
      // 12. Hacim (Lot)
      const volumeLot = this.parsePrice(parts[11]?.trim() || '');
      // 13. Hacim (TL)
      const volumeTL = this.parsePrice(parts[12]?.trim() || '');
      // 14. Hisse adı
      const symbol = (parts[13]?.trim() || '').toUpperCase();
      // 15. Grup (*XU100* veya null)
      const groupRaw = parts[14]?.trim() || '';
      // 16. Link - ignore
      // 17. _ - ignore

              if (!symbol || price === 0) {
                return;
              }

      // Grup bilgisini parse et
      // Mapping: XU kodları -> BIST grup isimleri
      const groupMapping: Record<string, string> = {
        'XU100': 'BIST 100',
        'XU050': 'BIST 50',
        'XU030': 'BIST 30',
      };

      const bistGroups: string[] = groupRaw
        ? Object.entries(groupMapping)
            .filter(([key]) => groupRaw.replace(/[*/]/g, '').trim().includes(key))
            .map(([, value]) => value)
        : [];

              // Değişim miktarını hesapla
              const change = (changePercent / 100) * price;
      const isUp = changePercent >= 0;

              // Grup mapping'e ekle
              if (!groupMap[symbol]) {
                groupMap[symbol] = [];
              }
      // Önce parse edilen grupları ekle
      bistGroups.forEach(group => {
        if (!groupMap[symbol].includes(group)) {
          groupMap[symbol].push(group);
              }
      });
      // Her zaman 'BIST' grubunu da ekle (varsayılan grup)
      if (!groupMap[symbol].includes('BIST')) {
        groupMap[symbol].push('BIST');
      }

      // Önceki veriyi güncelle veya yeni ekle
      if (stockMap[symbol]) {
        // Mevcut veriyi güncelle (grupları birleştir, BIST her zaman olsun)
        const finalGroups = [...groupMap[symbol]];
        if (!finalGroups.includes('BIST')) {
          finalGroups.push('BIST');
        }
        stockMap[symbol].metadata!.bistGroups = finalGroups;
        // Fiyat güncellemesi
        if (price > 0) {
          stockMap[symbol].price = price;
          stockMap[symbol].change = change;
          stockMap[symbol].changePercent = changePercent;
          stockMap[symbol].isUp = isUp;
          if (high > 0) stockMap[symbol].metadata!.high = high;
          if (low > 0) stockMap[symbol].metadata!.low = low;
          if (open > 0) stockMap[symbol].metadata!.open = open;
          if (buy > 0) stockMap[symbol].metadata!.buy = buy;
          if (sell > 0) stockMap[symbol].metadata!.sell = sell;
          if (volumeLot > 0) stockMap[symbol].metadata!.volume = volumeLot;
          if (volumeTL > 0) stockMap[symbol].metadata!.volumeTL = volumeTL;
          stockMap[symbol].metadata!.time = time;
        }
      } else {
        // Yeni veri ekle
        // Final grupları hazırla (BIST her zaman olsun)
        const finalGroups = [...groupMap[symbol]];
        if (!finalGroups.includes('BIST')) {
          finalGroups.push('BIST');
        }
        stockMap[symbol] = {
                  symbol,
          name: symbol, // stocksData'da sadece sembol var
                  price,
                  change,
                  changePercent,
                  isUp,
                  timestamp: Date.now(),
                  category: 'stock' as const,
                  metadata: {
            bistGroups: finalGroups,
                    time,
            volume: volumeLot > 0 ? volumeLot : 0,
            volumeTL: volumeTL > 0 ? volumeTL : 0,
            high: high > 0 ? high : price * 1.02,
            low: low > 0 ? low : price * 0.98,
            open: open > 0 ? open : price - change,
                    prevClose: price - change,
            buy: buy > 0 ? buy : undefined,
            sell: sell > 0 ? sell : undefined,
                  } as MarketDataItem['metadata'],
        };
              }
            });

    // Stock map'i array'e çevir ve her hisse için BIST grubunun olduğundan emin ol
    Object.values(stockMap).forEach(stock => {
      // Her hisse için BIST grubunun olduğundan emin ol
      if (stock.metadata?.bistGroups && !stock.metadata.bistGroups.includes('BIST')) {
        stock.metadata.bistGroups.push('BIST');
      } else if (!stock.metadata?.bistGroups) {
        stock.metadata = { ...stock.metadata, bistGroups: ['BIST'] };
        }
      allStockData.push(stock);
    });

      // Grup bilgilerini cache'le
      this.cacheService.set(this.GROUP_CACHE_KEY, groupMap, this.GROUP_CACHE_TTL);
      this.logger.debug(`BIST grup bilgileri cache'lendi: ${Object.keys(groupMap).length} hisse`);

      return allStockData;
  }

  /**
   * Belirli bir hisse senedi için detaylı veri getir
   */
  async getStockDetail(symbol: string): Promise<MarketDataItem | null> {
    try {
      // Tüm BIST verilerini çek ve istenen sembolü bul
      const allStocks = await this.getBistData();
      return allStocks.find(stock => stock.symbol === symbol.toUpperCase()) || null;
    } catch (error: any) {
      this.logger.error(`BIST detay hatası: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Fiyat string'ini number'a çevir
   * Türk formatı: 6.234,56 -> 6234.56
   */
  private parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    
    // TL, $, virgül, nokta temizle
    let cleaned = priceStr
      .replace(/[₺$TL\s]/g, '')
      .trim();
    
    // Hem nokta hem virgül varsa: Türk formatı (6.234,56)
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Nokta sayısını kontrol et
      const dotCount = (cleaned.match(/\./g) || []).length;
      
      // Eğer birden fazla nokta varsa, nokta binlik ayırıcıdır
      if (dotCount > 1) {
        // 6.234,56 formatı - noktaları kaldır, virgülü noktaya çevir
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Tek nokta ve virgül: 6.234,56 formatı
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      }
    } else if (cleaned.includes(',')) {
      // Sadece virgül varsa
      const commaIndex = cleaned.indexOf(',');
      const afterComma = cleaned.substring(commaIndex + 1);
      
      // Virgülden sonra 2-3 hane ve küçük sayı ise ondalık
      if (afterComma.length <= 3 && parseFloat(afterComma) < 100) {
        cleaned = cleaned.replace(',', '.');
      } else {
        cleaned = cleaned.replace(',', '');
      }
    } else if (cleaned.includes('.')) {
      // Sadece nokta varsa
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        // Birden fazla nokta = binlik ayırıcı
        cleaned = cleaned.replace(/\./g, '');
      }
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
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
   * Gün sonu verilerini veritabanına kaydet
   * Borsa kapanış saatine yakın (18:00-18:30) çağrıldığında gün sonu verilerini kaydeder
   */
  private async saveDailyDataToDb(data: MarketDataItem[]): Promise<void> {
    try {
      // Türkiye saatini al
      const turkishTimeString = new Date().toLocaleString('en-US', { 
        timeZone: 'Europe/Istanbul',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      const [datePart, timePart] = turkishTimeString.split(', ');
      const [month, day, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      
      const hourNum = parseInt(hour);
      
      // Sadece borsa kapanış saatine yakın (18:00+) veya kapanış sonrası kaydet
      if (hourNum < 18) {
        return; // Henüz gün sonu değil
      }

      // Bugünün tarihini al (sadece tarih, saat yok)
      const today = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      today.setHours(0, 0, 0, 0);

      // Her hisse için gün sonu verisini kaydet
      const dailyDataRecords = data.map(item => ({
        symbol: item.symbol,
        date: today,
        price: item.price,
        open: item.metadata?.open || item.price,
        high: item.metadata?.high || item.price,
        low: item.metadata?.low || item.price,
        prevClose: item.metadata?.prevClose || item.price - item.change,
        change: item.change,
        changePercent: item.changePercent,
        volume: item.metadata?.volume || 0,
        volumeTL: item.metadata?.volumeTL || 0,
        buy: item.metadata?.buy || null,
        sell: item.metadata?.sell || null,
        bistGroups: item.metadata?.bistGroups || ['BIST'],
        lastTradeTime: item.metadata?.time || null,
      }));

      // Upsert işlemi - aynı symbol ve date varsa güncelle, yoksa ekle
      for (const record of dailyDataRecords) {
        await this.prisma.bistDailyData.upsert({
          where: {
            symbol_date: {
              symbol: record.symbol,
              date: record.date,
            },
          },
          update: {
            price: record.price,
            open: record.open,
            high: record.high,
            low: record.low,
            prevClose: record.prevClose,
            change: record.change,
            changePercent: record.changePercent,
            volume: record.volume,
            volumeTL: record.volumeTL,
            buy: record.buy,
            sell: record.sell,
            bistGroups: record.bistGroups,
            lastTradeTime: record.lastTradeTime,
          },
          create: record,
        });
      }

      this.logger.log(`Gün sonu verileri DB'ye kaydedildi: ${dailyDataRecords.length} hisse`);
    } catch (error: any) {
      this.logger.error(`Gün sonu verileri DB'ye kaydedilemedi: ${error.message}`, error.stack);
      // Hata olsa bile devam et, kritik değil
    }
  }
}

