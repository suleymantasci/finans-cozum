import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { MarketDataItem } from '../dto/market-data.dto';
import { CacheService } from '../../cache/cache.service';
import { PrismaService } from '../../prisma/prisma.service';

const parseXML = promisify(parseString);

@Injectable()
export class TcmbProvider {
  private readonly logger = new Logger(TcmbProvider.name);
  private readonly baseUrl = 'https://www.tcmb.gov.tr/kurlar';
  private readonly CACHE_KEY = 'tcmb:forex:latest';
  private readonly CACHE_TTL = 86400; // 24 saat

  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Her gün 15:35'te TCMB kurlarını çekip DB'ye kaydet
   * TCMB günde bir kez 15:30'da kurları yayınlar
   */
  @Cron('35 15 * * *', {
    timeZone: 'Europe/Istanbul',
  })
  async fetchAndSaveDailyForexRates(): Promise<void> {
    try {
      this.logger.log('TCMB günlük döviz kurları çekiliyor (15:35 cron job)');
      const forexData = await this.fetchForexRatesFromApi();
      
      if (forexData && forexData.length > 0) {
        // Cache'le
        this.cacheService.set(this.CACHE_KEY, forexData, this.CACHE_TTL);
        
        // DB'ye kaydet
        await this.saveForexDataToDb(forexData);
        
        this.logger.log(`TCMB döviz kurları başarıyla kaydedildi: ${forexData.length} döviz çifti`);
      }
    } catch (error: any) {
      this.logger.error(`TCMB günlük döviz kurları çekilemedi: ${error.message}`, error.stack);
    }
  }

  /**
   * Döviz kurlarını getir (tarih bilgisi ile)
   * Önce cache'den, sonra DB'den, son olarak API'den çeker
   */
  async getForexRatesWithDate(): Promise<{ data: MarketDataItem[]; date: string }> {
    let forexData: MarketDataItem[] = [];
    let date: Date | null = null;

    // Önce cache'den bak
    const cachedData = this.cacheService.get<MarketDataItem[]>(this.CACHE_KEY);
    if (cachedData && cachedData.length > 0) {
      this.logger.debug('TCMB döviz kurları cache\'den döndürüldü');
      forexData = cachedData;
      // Cache'den tarih bilgisi yok, DB'den al
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date = today;
    } else {
      // Cache yoksa DB'den bugünün verisini çek
      const dbResult = await this.getForexDataFromDbWithDate();
      if (dbResult.data && dbResult.data.length > 0) {
        forexData = dbResult.data;
        date = dbResult.date;
        // Cache'le
        this.cacheService.set(this.CACHE_KEY, forexData, this.CACHE_TTL);
        this.logger.log('TCMB döviz kurları DB\'den döndürüldü');
      } else {
        // DB'de de yoksa API'den çek (fallback)
        this.logger.warn('TCMB cache ve DB\'de veri yok, API\'den çekiliyor');
        forexData = await this.fetchForexRatesFromApi();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date = today;
      }
    }

    // Tarih formatını hazırla
    const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    return {
      data: forexData,
      date: dateStr,
    };
  }

  /**
   * Döviz kurlarını getir (geriye uyumluluk için)
   * Önce cache'den, sonra DB'den, son olarak API'den çeker
   */
  async getForexRates(): Promise<MarketDataItem[]> {
    const result = await this.getForexRatesWithDate();
    return result.data;
  }

  /**
   * TCMB API'den döviz kurlarını çek (internal method)
   */
  private async fetchForexRatesFromApi(): Promise<MarketDataItem[]> {
    try {
      // TCMB API formatı: YYYYMM/DDMMYYYY.xml
      // Önce bugünü dene, yoksa önceki günleri dene (hafta sonu/tatil günleri için)
      let attempts = 0;
      const maxAttempts = 5; // Son 5 günü dene
      let response: any = null;
      let xmlData: any = null;
      
      while (attempts < maxAttempts) {
        const date = new Date();
        date.setDate(date.getDate() - attempts);
        
        // Hafta sonu kontrolü (Cumartesi=6, Pazar=0)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          attempts++;
          continue; // Hafta sonu ise bir gün öncesine geç
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}/${day}${month}${year}.xml`;

        try {
          response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${dateStr}`, {
          responseType: 'text',
              timeout: 10000,
        }),
      );

          xmlData = await parseXML(response.data) as any;
          const currencies = xmlData?.Tarih_Date?.Currency || [];
          
          // Veri bulundu, devam et
          if (currencies && currencies.length > 0) {
            this.logger.debug(`TCMB döviz kurları alındı (${dateStr})`);
            break; // Başarılı, döngüden çık
          }
        } catch (error: any) {
          // 404 veya başka bir hata, bir sonraki günü dene
          if (error.response?.status === 404) {
            attempts++;
            if (attempts >= maxAttempts) {
              this.logger.warn(`TCMB API'de son ${maxAttempts} gün için veri bulunamadı`);
              return [];
            }
            continue;
          }
          throw error; // 404 dışındaki hataları fırlat
        }
      }
      
      if (!xmlData) {
        this.logger.error('TCMB API\'den veri alınamadı');
        return [];
      }

      const currencies = xmlData?.Tarih_Date?.Currency || [];

      const forexPairs = [
        { code: 'USD', pair: 'USD/TRY', name: 'Amerikan Doları' },
        { code: 'EUR', pair: 'EUR/TRY', name: 'Euro' },
        { code: 'GBP', pair: 'GBP/TRY', name: 'İngiliz Sterlini' },
        { code: 'CHF', pair: 'CHF/TRY', name: 'İsviçre Frangı' },
        { code: 'CAD', pair: 'CAD/TRY', name: 'Kanada Doları' },
        { code: 'AUD', pair: 'AUD/TRY', name: 'Avustralya Doları' },
        { code: 'JPY', pair: 'JPY/TRY', name: 'Japon Yeni' },
        { code: 'CNY', pair: 'CNY/TRY', name: 'Çin Yuanı' },
        { code: 'RUB', pair: 'RUB/TRY', name: 'Rus Rublesi' },
        { code: 'SEK', pair: 'SEK/TRY', name: 'İsveç Kronu' },
        { code: 'NOK', pair: 'NOK/TRY', name: 'Norveç Kronu' },
        { code: 'DKK', pair: 'DKK/TRY', name: 'Danimarka Kronu' },
        { code: 'SAR', pair: 'SAR/TRY', name: 'Suudi Riyali' },
        { code: 'AED', pair: 'AED/TRY', name: 'BAE Dirhemi' },
        { code: 'BGN', pair: 'BGN/TRY', name: 'Bulgar Levası' },
        { code: 'RON', pair: 'RON/TRY', name: 'Rumen Leyi' },
        { code: 'PLN', pair: 'PLN/TRY', name: 'Polonya Zlotisi' },
        { code: 'HUF', pair: 'HUF/TRY', name: 'Macar Forinti' },
        { code: 'CZK', pair: 'CZK/TRY', name: 'Çek Kronu' },
        { code: 'KRW', pair: 'KRW/TRY', name: 'Güney Kore Wonu' },
      ];

      const result: MarketDataItem[] = [];

      for (const pair of forexPairs) {
        const currency = currencies.find((c: any) => c.$.Kod === pair.code);
        if (currency) {
          const forexBuy = parseFloat(currency.ForexBuying?.[0] || '0');
          const forexSelling = parseFloat(currency.ForexSelling?.[0] || '0');
          const banknoteBuying = parseFloat(currency.BanknoteBuying?.[0] || '0');
          const banknoteSelling = parseFloat(currency.BanknoteSelling?.[0] || '0');

          // Alış ve satış ortalaması
          const buy = forexBuy || banknoteBuying;
          const sell = forexSelling || banknoteSelling;
          const price = (buy + sell) / 2;

          // Önceki günün verisi yoksa değişim hesaplanamaz
          // Şimdilik 0 olarak ayarlıyoruz, ileride geçmiş veri ile hesaplanabilir
          const changePercent = 0;
          const change = 0;

          result.push({
            symbol: pair.pair,
            name: pair.name,
            price,
            change,
            changePercent,
            isUp: changePercent >= 0,
            timestamp: Date.now(),
            category: 'forex' as const,
            metadata: {
              buy,
              sell,
            },
          });
        }
      }

      return result;
    } catch (error: any) {
      this.logger.error(`TCMB API hatası: ${error.message}`, error.stack);
      // Hata durumunda boş array döndür
      return [];
    }
  }

  /**
   * Altın fiyatlarını getir
   * Ons altın fiyatını CoinGecko'dan alıp, gram altın, çeyrek altın ve cumhuriyet altını fiyatlarını hesaplıyoruz
   */
  async getGoldPrices(usdTryRate?: number, ounceGoldPriceUSD?: number): Promise<MarketDataItem[]> {
    try {
      let usdRate = usdTryRate;
      let ouncePrice = ounceGoldPriceUSD;

      // USD/TRY kurunu al
      if (!usdRate) {
        const today = new Date();
        // TCMB API'den USD/TRY kurunu al (getForexRates ile aynı mantık)
        let usdRateFound = false;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts && !usdRateFound) {
          const date = new Date();
          date.setDate(date.getDate() - attempts);
          
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            attempts++;
            continue;
          }
          
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}/${day}${month}${year}.xml`;

          try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/${dateStr}`, {
            responseType: 'text',
                timeout: 10000,
          }),
        );

        const xmlData = await parseXML(response.data) as any;
        const currencies = xmlData?.Tarih_Date?.Currency || [];
        const usdCurrency = currencies.find((c: any) => c.$.Kod === 'USD');
        
        if (usdCurrency) {
          const forexBuy = parseFloat(usdCurrency.ForexBuying?.[0] || '0');
          const forexSell = parseFloat(usdCurrency.ForexSelling?.[0] || '0');
          usdRate = (forexBuy + forexSell) / 2;
              usdRateFound = true;
              break;
            }
          } catch (error: any) {
            if (error.response?.status === 404) {
              attempts++;
              if (attempts >= maxAttempts) {
                this.logger.warn('USD/TRY kuru bulunamadı, altın fiyatları hesaplanamıyor');
                return [];
              }
              continue;
            }
            throw error;
          }
        }
        
        if (!usdRateFound || !usdRate) {
          this.logger.warn('USD/TRY kuru bulunamadı, altın fiyatları hesaplanamıyor');
          return [];
        }
      }

      // Ons altın fiyatını CoinGecko'dan al (eğer verilmemişse)
      // NOT: CoinGecko'nun "gold" ID'si artık gerçek altın fiyatını vermiyor
      // Alternatif olarak pax-gold veya tether-gold kullanılabilir ama bunlar token fiyatları
      // Bu yüzden direkt varsayılan değer kullanıyoruz veya Harem Altın'dan alıyoruz
      if (!ouncePrice) {
        // CoinGecko artık güvenilir değil, varsayılan değer kullan
        // Harem Altın provider'ından veri gelirse oradan alınacak
        this.logger.debug('Ons altın fiyatı için varsayılan değer kullanılıyor (CoinGecko güvenilir değil)');
        ouncePrice = 2650; // Fallback değer (güncel piyasa ortalaması)
      }

      // USD/TRY kuru kontrolü
      if (!usdRate || usdRate === 0 || usdRate < 20 || usdRate > 50) {
        this.logger.error(`USD/TRY kuru geçersiz: ${usdRate}, altın fiyatları hesaplanamıyor`);
        return [];
      }

      // Ons altın fiyatı kontrolü
      if (!ouncePrice || ouncePrice === 0 || ouncePrice < 2000 || ouncePrice > 3000) {
        this.logger.error(`Ons altın fiyatı geçersiz: ${ouncePrice}, altın fiyatları hesaplanamıyor`);
        return [];
      }

      // Gram altın = (Ons altın / 31.1035) * USD/TRY
      // 1 ons = 31.1035 gram
      const gramGoldPrice = (ouncePrice / 31.1035) * usdRate;
      
      // Fiyat kontrolü - gram altın 5000-8000 arası olmalı (güncel piyasa koşullarına göre)
      if (gramGoldPrice < 1000 || gramGoldPrice > 10000) {
        this.logger.error(`Gram altın fiyatı anormal: ${gramGoldPrice} (Ons: ${ouncePrice}, USD/TRY: ${usdRate})`);
        // Anormal fiyat durumunda boş array döndür, cache'e kaydetme
        return [];
      }
      
      // Çeyrek altın = Gram altın * 1.754 (gerçek ağırlık oranı)
      // Çeyrek altın yaklaşık 1.754 gram
      const quarterGoldPrice = gramGoldPrice * 1.754;
      
      // Cumhuriyet altını = Gram altın * 7.216 (gerçek ağırlık oranı)
      // Cumhuriyet altını yaklaşık 7.216 gram
      const republicGoldPrice = gramGoldPrice * 7.216;

      // Gümüş fiyatı (ons cinsinden)
      let silverPriceUSD = 30;
      try {
        const silverResponse = await firstValueFrom(
          this.httpService.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
              ids: 'silver',
              vs_currencies: 'usd',
            },
          }),
        );
        silverPriceUSD = silverResponse.data?.silver?.usd || 30;
      } catch (error) {
        this.logger.warn('CoinGecko\'dan gümüş fiyatı alınamadı, varsayılan değer kullanılıyor');
      }

      // Detaylı altın fiyatları - Harem Altın gibi çeşitli altın türleri
      // Ağırlık oranları ve ayar hesaplamaları
      const goldData: MarketDataItem[] = [
        // HAS ALTIN (24 ayar, saf altın)
        {
          symbol: 'HAS_ALTIN',
          name: 'Has Altın',
          price: gramGoldPrice, // Gram altın = has altın
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // ONS ALTIN
        {
          symbol: 'ONS_ALTIN',
          name: 'Ons Altın',
          price: ouncePrice,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // GRAM ALTIN
        {
          symbol: 'GRAM_ALTIN',
          name: 'Gram Altın',
          price: gramGoldPrice,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // 22 AYAR ALTIN (22/24 = 0.9167 saflık)
        {
          symbol: 'AYAR_22',
          name: '22 Ayar Altın',
          price: gramGoldPrice * 0.9167,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // ÇEYREK ALTIN (1.754 gram)
        {
          symbol: 'CEYREK_ALTIN',
          name: 'Çeyrek Altın',
          price: quarterGoldPrice,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // YARIM ALTIN (3.508 gram)
        {
          symbol: 'YARIM_ALTIN',
          name: 'Yarım Altın',
          price: gramGoldPrice * 3.508,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // TAM ALTIN (7.016 gram) - Cumhuriyet Altını
        {
          symbol: 'TAM_ALTIN',
          name: 'Tam Altın (Cumhuriyet)',
          price: republicGoldPrice,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // ATA ALTIN (7.216 gram)
        {
          symbol: 'ATA_ALTIN',
          name: 'Ata Altın',
          price: gramGoldPrice * 7.216,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // ATA 5'Lİ ALTIN (36.08 gram)
        {
          symbol: 'ATA_5LI',
          name: 'Ata 5\'li Altın',
          price: gramGoldPrice * 36.08,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // GREMSE ALTIN (14.432 gram)
        {
          symbol: 'GREMSE_ALTIN',
          name: 'Gremse Altın',
          price: gramGoldPrice * 14.432,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // 14 AYAR ALTIN (14/24 = 0.5833 saflık)
        {
          symbol: 'AYAR_14',
          name: '14 Ayar Altın',
          price: gramGoldPrice * 0.5833,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // GÜMÜŞ
        {
          symbol: 'ONS_GUMUS',
          name: 'Ons Gümüş',
          price: silverPriceUSD,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
        // GÜMÜŞ TL (gram cinsinden)
        {
          symbol: 'GRAM_GUMUS',
          name: 'Gram Gümüş',
          price: (silverPriceUSD / 31.1035) * usdRate,
          change: 0,
          changePercent: 0,
          isUp: true,
          timestamp: Date.now(),
          category: 'commodity' as const,
        },
      ];

      return goldData;
    } catch (error: any) {
      this.logger.error(`TCMB Altın API hatası: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * DB'den bugünün döviz kurlarını getir (tarih bilgisi ile)
   */
  private async getForexDataFromDbWithDate(): Promise<{ data: MarketDataItem[]; date: Date | null }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dbRecord = await this.prisma.tcmbDailyData.findUnique({
        where: { date: today },
      });

      if (dbRecord && dbRecord.forexData) {
        // JSON'dan MarketDataItem[]'e çevir
        const forexData = dbRecord.forexData as any;
        if (Array.isArray(forexData)) {
          return {
            data: forexData as MarketDataItem[],
            date: dbRecord.date,
          };
        }
      }

      return { data: [], date: null };
    } catch (error: any) {
      this.logger.error(`DB'den TCMB verisi okunamadı: ${error.message}`, error.stack);
      return { data: [], date: null };
    }
  }

  /**
   * DB'den bugünün döviz kurlarını getir (geriye uyumluluk için)
   */
  private async getForexDataFromDb(): Promise<MarketDataItem[]> {
    const result = await this.getForexDataFromDbWithDate();
    return result.data;
  }

  /**
   * Döviz kurlarını DB'ye kaydet
   */
  private async saveForexDataToDb(data: MarketDataItem[]): Promise<void> {
    try {
      if (!data || data.length === 0) {
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.prisma.tcmbDailyData.upsert({
        where: { date: today },
        update: {
          forexData: data as any,
        },
        create: {
          date: today,
          forexData: data as any,
        },
      });

      this.logger.log(`TCMB döviz kurları DB'ye kaydedildi: ${data.length} döviz çifti`);
    } catch (error: any) {
      this.logger.error(`TCMB döviz kurları DB'ye kaydedilemedi: ${error.message}`, error.stack);
      // Hata olsa bile devam et, kritik değil
    }
  }
}

