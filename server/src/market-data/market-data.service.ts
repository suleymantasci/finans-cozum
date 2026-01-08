import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from '../cache/cache.service';
import { CoinGeckoProvider } from './providers/coingecko.provider';
import { BinanceProvider } from './providers/binance.provider';
import { TcmbProvider } from './providers/tcmb.provider';
import { HaremAltinProvider } from './providers/haremaltin.provider';
import { BistProvider } from './providers/bist.provider';
import { PrismaService } from '../prisma/prisma.service';
import { MarketDataResponse, MarketDetailResponse, MarketDataItem, TcmbForexResponse } from './dto/market-data.dto';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly CACHE_TTL = 25; // 25 saniye - client istek süresi 30 saniye
  private readonly CACHE_TTL_OFF_HOURS = 60; // 1 dakika (60 saniye) - hafta içi akşamları
  private isUpdating = false; // Update işlemi devam ediyor mu kontrolü

  constructor(
    private readonly cacheService: CacheService,
    private readonly coinGeckoProvider: CoinGeckoProvider,
    private readonly binanceProvider: BinanceProvider,
    private readonly tcmbProvider: TcmbProvider,
    private readonly haremAltinProvider: HaremAltinProvider,
    private readonly bistProvider: BistProvider,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Tüm piyasa verilerini getir (cache'den - background task ile güncelleniyor)
   */
  async getAllMarketData(): Promise<MarketDataResponse> {
    const CACHE_KEY = 'market-data:all';
    
    // Cache'den döndür (background task ile güncelleniyor)
    const cached = this.cacheService.get<MarketDataResponse>(CACHE_KEY);
    if (cached) {
      return cached;
    }
    
    // Cache yoksa (ilk başlatma durumu) veriyi çek ve cache'le
    // Normalde background task bu işi yapıyor ama ilk başlatmada olmayabilir
    const data = await this.fetchAllMarketData();
    this.cacheService.set(CACHE_KEY, data, this.CACHE_TTL * 2); // İlk cache daha uzun süre geçerli olsun
    return data;
  }

  /**
   * API'lerden tüm piyasa verilerini çek ve cache'e kaydet
   */
  private async fetchAllMarketData(): Promise<MarketDataResponse> {
    try {
      // Önce forex verilerini al (USD/TRY için)
      const forexResult = await Promise.allSettled([this.tcmbProvider.getForexRatesWithDate()]);
      const forexResponse = forexResult[0].status === 'fulfilled' ? forexResult[0].value : { data: [], date: new Date().toISOString().split('T')[0] };
      const forexData = forexResponse.data;
      
      // USD/TRY kurunu bul
      const usdTry = forexData.find((f) => f.symbol === 'USD/TRY');
      const usdTryRate = usdTry?.price || 0;

      // Piyasa saatlerini kontrol et - emtia verisi için
      const marketHours = this.checkMarketHours();
      
      // Emtia verisi: piyasa saatlerine göre scrape veya DB'den al
      const commodityPromise = marketHours.shouldScrape
        ? this.haremAltinProvider.getGoldPrices()
        : Promise.resolve(await this.getCommodityDataFromDb());

      const [crypto, stocks, commodities] = await Promise.allSettled([
        this.binanceProvider.getCryptoPrices(), // Binance API kullan
        this.bistProvider.getBistData(),
        commodityPromise, // Piyasa saatlerine göre scrape veya DB
      ]);

      const cryptoData = crypto.status === 'fulfilled' ? crypto.value : [];
      const stockData = stocks.status === 'fulfilled' ? stocks.value : [];
      const commodityData = commodities.status === 'fulfilled' ? commodities.value : [];
      
      // BIST endeks bilgilerini al
      const bistIndicesResult = await Promise.allSettled([this.bistProvider.getBistIndices()]);
      const bistIndices = bistIndicesResult[0].status === 'fulfilled' ? bistIndicesResult[0].value : [];

      // Ticker için seçilen veriler
      const tickerData: MarketDataItem[] = [];
      
      // Döviz: USD/TRY, EUR/TRY, GBP/TRY
      const tickerForexSymbols = ['USD/TRY', 'EUR/TRY', 'GBP/TRY'];
      tickerForexSymbols.forEach(symbol => {
        const item = forexData.find(f => f.symbol === symbol);
        if (item) tickerData.push(item);
      });
      
      // Kripto: BTC, ETH, XRP
      const tickerCryptoSymbols = ['BTC', 'ETH', 'XRP'];
      tickerCryptoSymbols.forEach(symbol => {
        const item = cryptoData.find(c => c.symbol === symbol || c.symbol.startsWith(symbol));
        if (item) tickerData.push(item);
      });
      
      // Altın: Gram Altın, Çeyrek Altın, Tam Altın, Has Altın
      // CEYREK_YENI veya CEYREK_ALTIN olabilir, TAM_YENI veya TAM_ALTIN olabilir
      const tickerCommoditySymbols = ['GRAM_ALTIN', 'CEYREK_YENI', 'CEYREK_ALTIN', 'TAM_YENI', 'TAM_ALTIN', 'HAS_ALTIN', 'GRAM_GUMUS'];
      tickerCommoditySymbols.forEach(symbol => {
        const item = commodityData.find(c => c.symbol === symbol);
        if (item) tickerData.push(item);
      });
      
      // BIST: Endeks bilgileri (BIST 100, BIST 50, BIST 30)
      bistIndices.forEach(index => {
        tickerData.push({
          symbol: index.name,
          name: index.name,
          price: index.price,
          change: (index.changePercent / 100) * index.price,
          changePercent: index.changePercent,
          isUp: index.isUp,
          timestamp: Date.now(),
          category: 'stock' as const,
          metadata: {},
        });
      });

      const response: MarketDataResponse = {
        ticker: tickerData,
        forex: forexData,
        crypto: cryptoData,
        stocks: stockData,
        commodities: commodityData,
        lastUpdate: Date.now(),
      };

      return response;
    } catch (error: any) {
      this.logger.error(`Piyasa verileri çekilirken hata: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Döviz verilerini getir (tarih bilgisi ile - cache ile)
   */
  async getForexData(): Promise<TcmbForexResponse> {
    const CACHE_KEY = 'market-data:forex';
    
    // Önce cache'den bak
    const cached = this.cacheService.get<TcmbForexResponse>(CACHE_KEY);
    if (cached) {
      return cached;
    }
    
      // Cache yoksa (ilk başlatma durumu) veriyi çek ve cache'le
    try {
      const data = await this.tcmbProvider.getForexRatesWithDate();
      this.cacheService.set(CACHE_KEY, data, this.CACHE_TTL * 2);
      return data;
    } catch (error: any) {
      this.logger.error(`Döviz verileri çekilirken hata: ${error.message}`);
      const errorResponse = {
        data: [],
        date: new Date().toISOString().split('T')[0],
      };
      this.cacheService.set(CACHE_KEY, errorResponse, this.CACHE_TTL * 2);
      return errorResponse;
    }
  }

  /**
   * Kripto verilerini getir (cache'den - background task ile güncelleniyor)
   */
  async getCryptoData(): Promise<MarketDataItem[]> {
    const CACHE_KEY = 'market-data:crypto';
    
    // Cache'den döndür (background task ile güncelleniyor)
    const cached = this.cacheService.get<MarketDataItem[]>(CACHE_KEY);
    if (cached) {
      return cached;
    }
    
    // Cache yoksa (ilk başlatma durumu) veriyi çek ve cache'le
    try {
      // Binance API kullan (daha fazla coin ve gerçek zamanlı veri)
      const data = await this.binanceProvider.getCryptoPrices();
      this.cacheService.set(CACHE_KEY, data, this.CACHE_TTL * 2);
      return data;
    } catch (error: any) {
      this.logger.error(`Kripto verileri çekilirken hata: ${error.message}`);
      // Fallback olarak CoinGecko kullan
      try {
        const fallbackData = await this.coinGeckoProvider.getCryptoPrices();
        this.cacheService.set(CACHE_KEY, fallbackData, this.CACHE_TTL * 2);
        return fallbackData;
      } catch (fallbackError: any) {
        this.logger.error(`CoinGecko fallback hatası: ${fallbackError.message}`);
        const emptyData: MarketDataItem[] = [];
        this.cacheService.set(CACHE_KEY, emptyData, this.CACHE_TTL * 2);
        return emptyData;
      }
    }
  }

  /**
   * Borsa verilerini getir (cache'den - background task ile güncelleniyor)
   */
  async getStockData(): Promise<MarketDataItem[]> {
    const CACHE_KEY = 'market-data:stocks';
    
    // Cache'den döndür (background task ile güncelleniyor)
    const cached = this.cacheService.get<MarketDataItem[]>(CACHE_KEY);
    if (cached) {
      return cached;
    }
    
    // Cache yoksa (ilk başlatma durumu) veriyi çek ve cache'le
    try {
      const data = await this.bistProvider.getBistData();
      this.cacheService.set(CACHE_KEY, data, this.CACHE_TTL * 2);
      return data;
    } catch (error: any) {
      this.logger.error(`Borsa verileri çekilirken hata: ${error.message}`);
      const emptyData: MarketDataItem[] = [];
      this.cacheService.set(CACHE_KEY, emptyData, this.CACHE_TTL * 2);
      return emptyData;
    }
  }

  /**
   * BIST endeks bilgilerini getir (cache'den - background task ile güncelleniyor)
   */
  async getBistIndices(): Promise<Array<{ name: string; price: number; changePercent: number; isUp: boolean }>> {
    const CACHE_KEY = 'market-data:stocks:indices';
    
    // Cache'den döndür (background task ile güncelleniyor)
    const cached = this.cacheService.get<Array<{ name: string; price: number; changePercent: number; isUp: boolean }>>(CACHE_KEY);
    if (cached) {
      return cached;
    }
    
    // Cache yoksa (ilk başlatma durumu) veriyi çek ve cache'le
    try {
      const data = await this.bistProvider.getBistIndices();
      this.cacheService.set(CACHE_KEY, data, this.CACHE_TTL * 2);
      return data;
    } catch (error: any) {
      this.logger.error(`BIST endeks bilgileri çekilirken hata: ${error.message}`);
      const emptyData: Array<{ name: string; price: number; changePercent: number; isUp: boolean }> = [];
      this.cacheService.set(CACHE_KEY, emptyData, this.CACHE_TTL * 2);
      return emptyData;
    }
  }

  /**
   * Piyasa saatlerini kontrol et
   * Piyasa: Pazartesi 02:05 açılıyor, ertesi gün 00:55 kapanıyor
   * Cumartesi 00:55'te kapanıyor, Pazartesi 02:05'e kadar kapalı
   * @returns { shouldScrape: boolean, cacheTTL: number, reason: string, shouldSaveToDb: boolean }
   */
  private checkMarketHours(): { shouldScrape: boolean; cacheTTL: number; reason: string; shouldSaveToDb: boolean } {
    const now = new Date();
    const day = now.getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute; // Dakika cinsinden

    // Piyasa açılış: 02:05 = 125 dakika
    // Piyasa kapanış: 00:55 = 55 dakika (ertesi gün)
    const marketOpenTime = 2 * 60 + 5; // 02:05 = 125 dakika
    const marketCloseTime = 0 * 60 + 55; // 00:55 = 55 dakika

    // Hafta sonu kontrolü: Cumartesi 00:55 - Pazartesi 02:05 arası kapalı
    if (day === 6 && currentTime >= marketCloseTime) { // Cumartesi 00:55'ten sonra
      return {
        shouldScrape: false,
        cacheTTL: this.CACHE_TTL_OFF_HOURS,
        reason: 'Hafta sonu - piyasa kapalı (Cumartesi 00:55+)',
        shouldSaveToDb: false,
      };
    }
    if (day === 0) { // Pazar günü (tamamen kapalı)
      return {
        shouldScrape: false,
        cacheTTL: this.CACHE_TTL_OFF_HOURS,
        reason: 'Hafta sonu - piyasa kapalı (Pazar)',
        shouldSaveToDb: false,
      };
    }
    if (day === 1 && currentTime < marketOpenTime) { // Pazartesi 02:05'ten önce
      return {
        shouldScrape: false,
        cacheTTL: this.CACHE_TTL_OFF_HOURS,
        reason: 'Hafta sonu - piyasa kapalı (Pazartesi 02:05 öncesi)',
        shouldSaveToDb: false,
      };
    }

    // Hafta içi günlük kapalılık kontrolü: Her gün 00:55 - 02:05 arası kapalı
    if (currentTime >= marketCloseTime && currentTime < marketOpenTime) {
      // Günlük kapalılık (00:55 - 02:05 arası)
      return {
        shouldScrape: false,
        cacheTTL: this.CACHE_TTL_OFF_HOURS,
        reason: `Hafta içi günlük kapalılık - piyasa kapalı (00:55-02:05) (${hour}:${minute.toString().padStart(2, '0')})`,
        shouldSaveToDb: false,
      };
    }

    // Piyasa açık - scrape yapılabilir
    // Akşam saatleri (19:00-09:00) kontrolü: Cache süresi 1 dakika
    const eveningStart = 19 * 60; // 19:00 = 1140 dakika
    const morningEnd = 9 * 60; // 09:00 = 540 dakika
    
    if (currentTime >= eveningStart || currentTime < morningEnd) {
      // Akşam veya gece (19:00-09:00 arası) -> scrape yap ama cache 1 dakika
      return {
        shouldScrape: true,
        cacheTTL: this.CACHE_TTL_OFF_HOURS, // 1 dakika (60 saniye)
        reason: `Hafta içi akşam/gece - scrape yapılıyor, cache 1 dk (${hour}:${minute.toString().padStart(2, '0')})`,
        shouldSaveToDb: false, // shouldSaveToDb artık kullanılmıyor, ayrı cron job var
      };
    }

    // Hafta içi gündüz (09:00 - 19:00) -> normal scrape
    return {
      shouldScrape: true,
      cacheTTL: this.CACHE_TTL,
      reason: `Hafta içi gündüz - normal scrape (${hour}:${minute.toString().padStart(2, '0')})`,
      shouldSaveToDb: false, // shouldSaveToDb artık kullanılmıyor, ayrı cron job var
    };
  }

  /**
   * Emtia verilerini getir (cache ile)
   * Harem Altın'dan veri alınamazsa DB'den son kaydedilen veriyi kullanır
   * Piyasa saatlerine göre scrape yapar veya DB'den alır
   */
  async getCommodityData(): Promise<MarketDataItem[]> {
    const CACHE_KEY = 'market-data:commodities';
    
    // Önce cache'den bak
    const cached = this.cacheService.get<MarketDataItem[]>(CACHE_KEY);
    if (cached) {
      return cached;
    }
    
    // Piyasa saatlerini kontrol et
    const marketHours = this.checkMarketHours();
    
    // Hafta sonu -> DB'den al (scrape yok)
    if (!marketHours.shouldScrape) {
      this.logger.debug(`Emtia verisi: ${marketHours.reason}`);
      const dbData = await this.getCommodityDataFromDb();
      if (dbData && dbData.length > 0) {
        this.cacheService.set(CACHE_KEY, dbData, marketHours.cacheTTL);
        return dbData;
      }
      // DB'de veri yoksa boş array döndür
      return [];
    }

    // Hafta içi (gündüz veya akşam) -> scrape yap (cache süresi piyasa saatlerine göre)
    try {
      this.logger.debug(`Emtia verisi: ${marketHours.reason}`);
      
      // Harem Altın'dan direkt fiyatları al
      let data = await this.haremAltinProvider.getGoldPrices();
      
      // Veri geçerliliği kontrolü - NaN, null, undefined kontrolü
      if (!data || data.length === 0) {
        this.logger.warn('Harem Altın\'dan veri alınamadı, DB\'den son kaydedilen veri kullanılıyor');
        data = await this.getCommodityDataFromDb();
      } else {
        // Veri var ama geçerli mi kontrol et (NaN, null, undefined kontrolü)
        const hasValidData = data.some(item => 
          item && 
          item.price !== null && 
          item.price !== undefined && 
          !isNaN(item.price) && 
          isFinite(item.price)
        );
        
        if (!hasValidData) {
          this.logger.warn('Harem Altın\'dan alınan veri geçersiz (NaN/null/undefined), DB\'den veri kullanılıyor');
          data = await this.getCommodityDataFromDb();
        }
      }
      
      // Veri kontrolü - en az bir geçerli fiyat olmalı
      if (!data || data.length === 0) {
        this.logger.error('Emtia verileri boş döndü (ne scraping ne DB\'den veri bulunamadı)');
        const emptyData: MarketDataItem[] = [];
        this.cacheService.set(CACHE_KEY, emptyData, marketHours.cacheTTL);
        return emptyData;
      }

      // Başarılı veriyi cache'le (piyasa saatlerine göre TTL)
      this.cacheService.set(CACHE_KEY, data, marketHours.cacheTTL);
      return data;
    } catch (error: any) {
      this.logger.error(`Emtia verileri çekilirken hata: ${error.message}`, error.stack);
      // Hata durumunda DB'den veri çek
      try {
        const dbData = await this.getCommodityDataFromDb();
        if (dbData && dbData.length > 0) {
          this.logger.warn('Hata nedeniyle DB\'den veri kullanılıyor');
          this.cacheService.set(CACHE_KEY, dbData, marketHours.cacheTTL);
          return dbData;
        }
      } catch (dbError: any) {
        this.logger.error(`DB\'den veri çekilirken hata: ${dbError.message}`);
      }
      const emptyData: MarketDataItem[] = [];
      // marketHours catch bloğunda erişilebilir (try bloğunda tanımlı)
      this.cacheService.set(CACHE_KEY, emptyData, marketHours.cacheTTL);
      return emptyData;
    }
  }

  /**
   * DB'den son kaydedilen emtia verilerini getir
   */
  private async getCommodityDataFromDb(): Promise<MarketDataItem[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Bugünün saat başı kayıtlarını ara (en son kaydedileni al)
      const latestRecord = await this.prisma.commodityDailyData.findFirst({
        where: {
          date: {
            gte: today,
          },
        },
        orderBy: [
          { date: 'desc' },
          { hour: 'desc' },
        ],
      });

      if (!latestRecord) {
        // Bugün kayıt yoksa, en son kaydedilen kaydı al
        const anyRecord = await this.prisma.commodityDailyData.findFirst({
          orderBy: [
            { date: 'desc' },
            { hour: 'desc' },
          ],
        });

        if (!anyRecord) {
          this.logger.warn('DB\'de hiç emtia verisi bulunamadı');
          return [];
        }

        const data = anyRecord.commodityData as unknown as MarketDataItem[];
        this.logger.debug(`DB'den eski veri kullanılıyor (${anyRecord.date.toISOString().split('T')[0]} ${anyRecord.hour}:00)`);
        return data;
      }

      const data = latestRecord.commodityData as unknown as MarketDataItem[];
        this.logger.debug(`DB'den veri kullanılıyor (${latestRecord.date.toISOString().split('T')[0]} ${latestRecord.hour}:00)`);
        return data;
    } catch (error: any) {
      this.logger.error(`DB'den emtia verisi çekilirken hata: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Belirli bir sembol için detaylı veri getir (gerçek zamanlı - cache yok)
   */
  async getMarketDetail(symbol: string): Promise<MarketDetailResponse | null> {
    try {
      // Sembolü normalize et (örn: usd-try -> usdtry, 22-ayar -> 22ayar)
      const normalizedSymbol = symbol.toLowerCase().replace(/-/g, '').replace(/_/g, '');
      
      // Tüm veri kaynaklarından paralel olarak veri çek
      const [forexResponse, cryptoData, commodityData, stockData] = await Promise.all([
        this.getForexData(),
        this.getCryptoData(),
        this.getCommodityData(),
        this.getStockData(),
      ]);

      // 1. Önce emtia kontrolü yap (en spesifik semboller)
      // Emtia sembolleri: GRAM_ALTIN, 22_AYAR, CEYREK_ALTIN, GUMUS, ONS_ALTIN, vb.
      const commodityItem = commodityData.find((c) => {
        const commoditySymbol = c.symbol.toLowerCase().replace(/_/g, '').replace(/-/g, '');
        return commoditySymbol === normalizedSymbol;
      });
      
      if (commodityItem) {
        return {
          symbol: commodityItem.symbol,
          name: commodityItem.name || commodityItem.symbol,
          currentPrice: commodityItem.price,
          change: commodityItem.change,
          changePercent: commodityItem.changePercent,
          open: commodityItem.metadata?.open || commodityItem.price,
          high: commodityItem.metadata?.high || commodityItem.price,
          low: commodityItem.metadata?.low || commodityItem.price,
          prevClose: commodityItem.metadata?.prevClose || commodityItem.price,
          type: 'Emtia',
          category: 'Değerli Maden',
          metadata: commodityItem.metadata,
          lastUpdate: commodityItem.timestamp,
        };
      }

      // 2. Döviz kontrolü - sadece bilinen parite formatları (XXX/YYY veya XXXYYY)
      // Döviz sembolleri: USD/TRY, EUR/TRY, GBP/TRY, EUR/USD, vb.
      const forexItem = forexResponse.data.find((f) => {
        const forexSymbol = f.symbol.toLowerCase().replace(/\//g, '');
        return forexSymbol === normalizedSymbol;
      });
      
      if (forexItem) {
        return {
          symbol: forexItem.symbol,
          name: forexItem.symbol,
          currentPrice: forexItem.price,
          change: forexItem.change,
          changePercent: forexItem.changePercent,
          open: forexItem.metadata?.open || forexItem.price,
          high: forexItem.metadata?.high || forexItem.price,
          low: forexItem.metadata?.low || forexItem.price,
          prevClose: forexItem.metadata?.prevClose || forexItem.price,
          type: 'Döviz',
          category: 'Majör Parite',
          metadata: forexItem.metadata,
          lastUpdate: forexItem.timestamp,
        };
      }

      // 3. Kripto kontrolü - sembol veya sembol+usd formatı
      // Kripto sembolleri: BTC, ETH, BNB, SOL, XRP, vb.
      const cryptoItem = cryptoData.find((c) => {
        const cryptoSymbol = c.symbol.toLowerCase();
        // Tam eşleşme veya "btcusd" -> "btc" formatı
        return cryptoSymbol === normalizedSymbol || 
               normalizedSymbol === `${cryptoSymbol}usd` ||
               normalizedSymbol === `${cryptoSymbol}usdt`;
      });
      
      if (cryptoItem) {
        return {
          symbol: cryptoItem.symbol,
          name: cryptoItem.name || cryptoItem.symbol,
          currentPrice: cryptoItem.price,
          change: cryptoItem.change,
          changePercent: cryptoItem.changePercent,
          open: cryptoItem.metadata?.open || cryptoItem.price,
          high: cryptoItem.metadata?.high || cryptoItem.price,
          low: cryptoItem.metadata?.low || cryptoItem.price,
          prevClose: cryptoItem.metadata?.prevClose || cryptoItem.price,
          marketCap: cryptoItem.metadata?.marketCap,
          type: 'Kripto Para',
          category: 'Kripto',
          metadata: cryptoItem.metadata,
          lastUpdate: cryptoItem.timestamp,
        };
      }

      // 4. Borsa kontrolü (varsayılan)
      // Borsa sembolleri: XU100, THYAO, GARAN, vb.
      const stockItem = stockData.find((s) => s.symbol.toLowerCase() === normalizedSymbol);
      
      if (stockItem) {
        return {
          symbol: stockItem.symbol,
          name: stockItem.name || stockItem.symbol,
          currentPrice: stockItem.price,
          change: stockItem.change,
          changePercent: stockItem.changePercent,
          open: stockItem.metadata?.open || stockItem.price,
          high: stockItem.metadata?.high || stockItem.price,
          low: stockItem.metadata?.low || stockItem.price,
          prevClose: stockItem.metadata?.prevClose || stockItem.price,
          volume: stockItem.metadata?.volume,
          type: 'Hisse Senedi',
          category: 'BIST',
          metadata: stockItem.metadata,
          lastUpdate: stockItem.timestamp,
        };
      }

      // Hiçbir kategoride bulunamadı
      this.logger.warn(`Sembol bulunamadı: ${symbol} (normalized: ${normalizedSymbol})`);
      return null;
    } catch (error: any) {
      this.logger.error(`Market detay verisi çekilirken hata: ${error.message}`);
      return null;
    }
  }


  /**
   * Her 20 saniyede bir piyasa verilerini güncelle
   */
  @Cron('*/20 * * * * *') // Her 20 saniyede bir - background task
  async updateMarketData() {
    // Eğer bir update işlemi zaten devam ediyorsa, yeni isteği atla
    if (this.isUpdating) {
      this.logger.debug('Background: Update işlemi zaten devam ediyor, atlanıyor...');
      return;
    }

    this.isUpdating = true;
    this.logger.debug('Background: Piyasa verileri güncelleniyor...');
    
    try {
      // Tüm verileri çek ve cache'le (client request'i beklemeden)
      const allData = await this.fetchAllMarketData();
      this.cacheService.set('market-data:all', allData, this.CACHE_TTL);
      
      // Ayrı ayrı cache'le (getAllMarketData içindeki forex, crypto, stocks, commodities cache'lenmiyor)
      // Bu şekilde her endpoint kendi cache'inden okuyabilir
      this.cacheService.set('market-data:forex', { data: allData.forex, date: new Date().toISOString().split('T')[0] }, this.CACHE_TTL);
      this.cacheService.set('market-data:crypto', allData.crypto, this.CACHE_TTL);
      this.cacheService.set('market-data:stocks', allData.stocks, this.CACHE_TTL);
      
      // Commodities için - fetchAllMarketData zaten getGoldPrices() çağırıyor, tekrar çağırmaya gerek yok
      // allData.commodities içinde zaten güncel veri var
      if (allData.commodities && allData.commodities.length > 0) {
        this.cacheService.set('market-data:commodities', allData.commodities, this.CACHE_TTL);
      } else {
        // Eğer fetchAllMarketData içinde veri alınamadıysa, DB'den dene
        try {
          const commodityData = await this.getCommodityDataFromDb();
          if (commodityData && commodityData.length > 0) {
            this.cacheService.set('market-data:commodities', commodityData, this.CACHE_TTL);
          }
        } catch (error: any) {
          this.logger.error(`Background: Commodities DB'den cache'lenirken hata: ${error.message}`);
        }
      }
      
      // BIST endeks bilgilerini de cache'le
      try {
        const bistIndices = await this.bistProvider.getBistIndices();
        this.cacheService.set('market-data:stocks:indices', bistIndices, this.CACHE_TTL);
      } catch (error: any) {
        this.logger.error(`Background: BIST endeks bilgileri cache'lenirken hata: ${error.message}`);
      }
      
      this.logger.debug('Background: Piyasa verileri başarıyla güncellendi ve cache\'lendi');
    } catch (error: any) {
      this.logger.error(`Background: Piyasa verileri güncellenirken hata: ${error.message}`);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Her saat başı emtia verilerini DB'ye kaydet (piyasa açıkken)
   */
  @Cron('0 * * * *') // Her saat başı (0. dakikada)
  async saveCommodityDataToDb() {
    // Piyasa saatlerini kontrol et
    const marketHours = this.checkMarketHours();
    
    // Piyasa kapalıysa kayıt yapma
    if (!marketHours.shouldScrape) {
      this.logger.debug(`Scheduled: ${marketHours.reason} - DB kaydı atlanıyor`);
      return;
    }

    this.logger.log('Scheduled: Emtia verileri DB\'ye kaydediliyor...');
    try {
      // Harem Altın'dan veri çek (piyasa açıkken)
      const commodityData = await this.haremAltinProvider.getGoldPrices();
      
      // Veri geçerliliği kontrolü - NaN, null, undefined kontrolü
      if (!commodityData || commodityData.length === 0) {
        this.logger.warn('Scheduled: Harem Altın\'dan veri alınamadı, DB\'ye kayıt yapılmadı');
        return;
      }

      // Veri geçerliliği kontrolü - en az bir geçerli fiyat olmalı
      const hasValidData = commodityData.some(item => 
        item && 
        item.price !== null && 
        item.price !== undefined && 
        !isNaN(item.price) && 
        isFinite(item.price)
      );

      if (!hasValidData) {
        this.logger.warn('Scheduled: Harem Altın\'dan alınan veri geçersiz (NaN/null/undefined), DB\'ye kayıt yapılmadı');
        return;
      }

      // Bugünün tarihini ve saati al
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const hour = now.getHours();

      // DB'ye kaydet (upsert - aynı tarih ve saat varsa güncelle)
      await this.prisma.commodityDailyData.upsert({
        where: {
          date_hour: {
            date,
            hour,
          },
        },
        update: {
          commodityData: commodityData as any,
          updatedAt: new Date(),
        },
        create: {
          date,
          hour,
          commodityData: commodityData as any,
        },
      });

      this.logger.log(`Scheduled: Emtia verileri DB'ye kaydedildi (${date.toISOString().split('T')[0]} ${hour}:00)`);
    } catch (error: any) {
      this.logger.error(`Scheduled: Emtia verileri DB'ye kaydedilirken hata: ${error.message}`, error.stack);
    }
  }

  /**
   * Piyasa kapanmadan önce son veriyi DB'ye kaydet (00:54'te)
   */
  @Cron('54 0 * * 1-6') // Hafta içi her gün 00:54'te (Cumartesi dahil)
  async saveCommodityDataBeforeClose() {
    this.logger.log('Scheduled: Piyasa kapanmadan önce son emtia verileri DB\'ye kaydediliyor...');
    try {
      // Harem Altın'dan son veriyi çek
      const commodityData = await this.haremAltinProvider.getGoldPrices();
      
      // Veri geçerliliği kontrolü - NaN, null, undefined kontrolü
      if (!commodityData || commodityData.length === 0) {
        this.logger.warn('Scheduled: Harem Altın\'dan veri alınamadı, DB\'ye kayıt yapılmadı');
        return;
      }

      // Veri geçerliliği kontrolü - en az bir geçerli fiyat olmalı
      const hasValidData = commodityData.some(item => 
        item && 
        item.price !== null && 
        item.price !== undefined && 
        !isNaN(item.price) && 
        isFinite(item.price)
      );

      if (!hasValidData) {
        this.logger.warn('Scheduled: Harem Altın\'dan alınan veri geçersiz (NaN/null/undefined), DB\'ye kayıt yapılmadı');
        return;
      }

      // Bugünün tarihini ve saati al (00:54'teki veriyi 00:00 olarak kaydet, çünkü kapanmadan önce)
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const hour = 0; // 00:54'teki veriyi 00:00 olarak kaydet

      // DB'ye kaydet (upsert - aynı tarih ve saat varsa güncelle)
      await this.prisma.commodityDailyData.upsert({
        where: {
          date_hour: {
            date,
            hour,
          },
        },
        update: {
          commodityData: commodityData as any,
          updatedAt: new Date(),
        },
        create: {
          date,
          hour,
          commodityData: commodityData as any,
        },
      });

      this.logger.log(`Scheduled: Piyasa kapanmadan önce emtia verileri DB'ye kaydedildi (${date.toISOString().split('T')[0]} ${hour}:00 - 00:54'te alındı)`);
    } catch (error: any) {
      this.logger.error(`Scheduled: Piyasa kapanmadan önce emtia verileri DB'ye kaydedilirken hata: ${error.message}`, error.stack);
    }
  }

  /**
   * Cache temizleme (her 5 dakikada bir)
   */
  @Cron('*/5 * * * *') // Her 5 dakikada bir
  async cleanupCache() {
    this.cacheService.cleanup();
  }
}

