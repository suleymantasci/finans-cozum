import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from '../cache/cache.service';
import { CoinGeckoProvider } from './providers/coingecko.provider';
import { BinanceProvider } from './providers/binance.provider';
import { TcmbProvider } from './providers/tcmb.provider';
import { HaremAltinProvider } from './providers/haremaltin.provider';
import { BistProvider } from './providers/bist.provider';
import { MarketDataResponse, MarketDetailResponse, MarketDataItem, TcmbForexResponse } from './dto/market-data.dto';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly CACHE_TTL = 20; // 20 saniye - client istek süresi ile aynı

  constructor(
    private readonly cacheService: CacheService,
    private readonly coinGeckoProvider: CoinGeckoProvider,
    private readonly binanceProvider: BinanceProvider,
    private readonly tcmbProvider: TcmbProvider,
    private readonly haremAltinProvider: HaremAltinProvider,
    private readonly bistProvider: BistProvider,
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

      const [crypto, stocks, commodities] = await Promise.allSettled([
        this.binanceProvider.getCryptoPrices(), // Binance API kullan
        this.bistProvider.getBistData(),
        this.haremAltinProvider.getGoldPrices(), // Harem Altın scraping
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
   * Emtia verilerini getir (cache ile)
   */
  async getCommodityData(): Promise<MarketDataItem[]> {
    const CACHE_KEY = 'market-data:commodities';
    
    // Önce cache'den bak
    const cached = this.cacheService.get<MarketDataItem[]>(CACHE_KEY);
    if (cached) {
      return cached;
    }
    
    // Cache yoksa veriyi çek ve cache'le
    try {
      // USD/TRY kurunu al (kendi cache'i ile)
      const forexResponse = await this.getForexData();
      const usdTry = forexResponse.data.find((f) => f.symbol === 'USD/TRY');
      const usdTryRate = usdTry?.price || 0;

      // Harem Altın'dan direkt fiyatları al
      let data = await this.haremAltinProvider.getGoldPrices();
      
      // Eğer Harem Altın'dan veri gelmezse, TCMB + CoinGecko ile hesapla (fallback)
      if (!data || data.length === 0) {
        this.logger.warn('Harem Altın\'dan veri alınamadı, TCMB+CoinGecko fallback kullanılıyor');
        
        const forexResponse2 = await this.getForexData();
        const usdTry2 = forexResponse2.data.find((f) => f.symbol === 'USD/TRY');
        const usdTryRate2 = usdTry2?.price || 0;

        if (!usdTryRate2 || usdTryRate2 === 0) {
          this.logger.error('USD/TRY kuru alınamadı, emtia fiyatları hesaplanamıyor');
          const emptyData: MarketDataItem[] = [];
          this.cacheService.set(CACHE_KEY, emptyData, this.CACHE_TTL * 2);
          return emptyData;
        }

        data = await this.tcmbProvider.getGoldPrices(usdTryRate2);
      }
      
      // Veri kontrolü - en az bir geçerli fiyat olmalı
      if (!data || data.length === 0) {
        this.logger.error('Emtia verileri boş döndü');
        const emptyData: MarketDataItem[] = [];
        this.cacheService.set(CACHE_KEY, emptyData, this.CACHE_TTL * 2);
        return emptyData;
      }

      // Fiyat kontrolü - gram altın 1000-10000 arası olmalı
      const gramAltin = data.find((item) => item.symbol === 'GRAM_ALTIN');
      if (gramAltin && (gramAltin.price < 1000 || gramAltin.price > 10000)) {
        this.logger.error(`Gram altın fiyatı anormal: ${gramAltin.price}`);
        const emptyData: MarketDataItem[] = [];
        this.cacheService.set(CACHE_KEY, emptyData, this.CACHE_TTL * 2);
        return emptyData;
      }

      // Başarılı veriyi cache'le
      this.cacheService.set(CACHE_KEY, data, this.CACHE_TTL * 2);
      return data;
    } catch (error: any) {
      this.logger.error(`Emtia verileri çekilirken hata: ${error.message}`, error.stack);
      const emptyData: MarketDataItem[] = [];
      this.cacheService.set(CACHE_KEY, emptyData, this.CACHE_TTL * 2);
      return emptyData;
    }
  }

  /**
   * Belirli bir sembol için detaylı veri getir (gerçek zamanlı - cache yok)
   */
  async getMarketDetail(symbol: string): Promise<MarketDetailResponse | null> {
    try {
      // Sembolü parse et (örn: usd-try, btc-usd, xu100)
      const normalizedSymbol = symbol.toLowerCase().replace(/-/g, '');
      
      // Kategoriye göre ilgili provider'dan veri çek
      if (normalizedSymbol.includes('try') || normalizedSymbol.includes('usd') || normalizedSymbol.includes('eur')) {
        // Döviz
        const forexResponse = await this.getForexData();
        const item = forexResponse.data.find(
          (f) => f.symbol.toLowerCase().replace(/\//g, '') === normalizedSymbol,
        );
        
        if (item) {
          const detail: MarketDetailResponse = {
            symbol: item.symbol,
            name: item.symbol,
            currentPrice: item.price,
            change: item.change,
            changePercent: item.changePercent,
            open: item.metadata?.open || item.price,
            high: item.metadata?.high || item.price,
            low: item.metadata?.low || item.price,
            prevClose: item.metadata?.prevClose || item.price,
            type: 'Döviz',
            category: 'Majör Parite',
            metadata: item.metadata,
            lastUpdate: item.timestamp,
          };
          
          return detail;
        }
      } else if (normalizedSymbol.includes('btc') || normalizedSymbol.includes('eth') || normalizedSymbol.includes('crypto')) {
        // Kripto
        const cryptoData = await this.getCryptoData();
        const item = cryptoData.find((c) => c.symbol.toLowerCase() === normalizedSymbol.split('usd')[0]);
        
        if (item) {
          const detail: MarketDetailResponse = {
            symbol: item.symbol,
            name: item.name || item.symbol,
            currentPrice: item.price,
            change: item.change,
            changePercent: item.changePercent,
            open: item.metadata?.open || item.price,
            high: item.metadata?.high || item.price,
            low: item.metadata?.low || item.price,
            prevClose: item.metadata?.prevClose || item.price,
            marketCap: item.metadata?.marketCap,
            type: 'Kripto Para',
            category: 'Kripto',
            metadata: item.metadata,
            lastUpdate: item.timestamp,
          };
          
          return detail;
        }
      } else if (normalizedSymbol.includes('altin') || normalizedSymbol.includes('gumus')) {
        // Emtia
        const commodityData = await this.getCommodityData();
        const item = commodityData.find((c) => 
          c.symbol.toLowerCase().replace(/_/g, '') === normalizedSymbol.replace(/-/g, ''),
        );
        
        if (item) {
          const detail: MarketDetailResponse = {
            symbol: item.symbol,
            name: item.name || item.symbol,
            currentPrice: item.price,
            change: item.change,
            changePercent: item.changePercent,
            open: item.metadata?.open || item.price,
            high: item.metadata?.high || item.price,
            low: item.metadata?.low || item.price,
            prevClose: item.metadata?.prevClose || item.price,
            type: 'Emtia',
            category: 'Değerli Maden',
            metadata: item.metadata,
            lastUpdate: item.timestamp,
          };
          
          return detail;
        }
      } else {
        // Borsa
        const stockData = await this.getStockData();
        const item = stockData.find((s) => s.symbol.toLowerCase() === normalizedSymbol);
        
        if (item) {
          const detail: MarketDetailResponse = {
            symbol: item.symbol,
            name: item.name || item.symbol,
            currentPrice: item.price,
            change: item.change,
            changePercent: item.changePercent,
            open: item.metadata?.open || item.price,
            high: item.metadata?.high || item.price,
            low: item.metadata?.low || item.price,
            prevClose: item.metadata?.prevClose || item.price,
            volume: item.metadata?.volume,
            type: 'Hisse Senedi',
            category: 'BIST',
            metadata: item.metadata,
            lastUpdate: item.timestamp,
          };
          
          return detail;
        }
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Market detay verisi çekilirken hata: ${error.message}`);
      return null;
    }
  }

  /**
   * Belirli bir sembol için geçmiş fiyat verilerini getir (grafik için - gerçek zamanlı)
   */
  async getMarketHistory(symbol: string, days: number = 30): Promise<Array<{ date: string; price: number }>> {
    try {
      // Şimdilik mock data döndürüyoruz
      // İleride gerçek API'lerden geçmiş veri çekilebilir
      const history: Array<{ date: string; price: number }> = [];
      const now = Date.now();
      const currentPrice = await this.getCurrentPriceForSymbol(symbol);

      if (!currentPrice) {
        return [];
      }

      // Son N gün için mock veri oluştur
      for (let i = days; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        // Rastgele varyasyon ekle (gerçek veri yerine)
        const variation = (Math.random() - 0.5) * 0.1; // ±5% varyasyon
        const price = currentPrice * (1 + variation);
        
        history.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(4)),
        });
      }

      return history;
    } catch (error: any) {
      this.logger.error(`Market history hatası: ${error.message}`);
      return [];
    }
  }

  /**
   * Sembol için mevcut fiyatı getir (history için)
   */
  private async getCurrentPriceForSymbol(symbol: string): Promise<number | null> {
    const normalizedSymbol = symbol.toLowerCase().replace(/-/g, '');
    
    if (normalizedSymbol.includes('try') || normalizedSymbol.includes('usd') || normalizedSymbol.includes('eur')) {
      const forexResponse = await this.getForexData();
      const item = forexResponse.data.find((f) => f.symbol.toLowerCase().replace(/\//g, '') === normalizedSymbol);
      return item?.price || null;
    } else if (normalizedSymbol.includes('btc') || normalizedSymbol.includes('eth') || normalizedSymbol.includes('crypto')) {
      const cryptoData = await this.getCryptoData();
      const item = cryptoData.find((c) => c.symbol.toLowerCase() === normalizedSymbol.split('usd')[0]);
      return item?.price || null;
    } else if (normalizedSymbol.includes('altin') || normalizedSymbol.includes('gumus')) {
      const commodityData = await this.getCommodityData();
      const item = commodityData.find((c) => 
        c.symbol.toLowerCase().replace(/_/g, '') === normalizedSymbol.replace(/-/g, ''),
      );
      return item?.price || null;
    } else {
      const stockData = await this.getStockData();
      const item = stockData.find((s) => s.symbol.toLowerCase() === normalizedSymbol);
      return item?.price || null;
    }
  }

  /**
   * Her 20 saniyede bir piyasa verilerini güncelle
   */
  @Cron('*/20 * * * * *') // Her 20 saniyede bir - background task
  async updateMarketData() {
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
      
      // Commodities için özel cache'leme (getCommodityData getForexData'yı çağırdığı için)
      try {
        const forexResponse = await this.tcmbProvider.getForexRatesWithDate();
        const usdTry = forexResponse.data.find((f) => f.symbol === 'USD/TRY');
        const usdTryRate = usdTry?.price || 0;
        let commodityData = await this.haremAltinProvider.getGoldPrices();
        if (!commodityData || commodityData.length === 0) {
          if (usdTryRate > 0) {
            commodityData = await this.tcmbProvider.getGoldPrices(usdTryRate);
          }
        }
        if (commodityData && commodityData.length > 0) {
          this.cacheService.set('market-data:commodities', commodityData, this.CACHE_TTL);
        } else {
          this.cacheService.set('market-data:commodities', allData.commodities, this.CACHE_TTL);
        }
      } catch (error: any) {
        this.logger.error(`Background: Commodities cache'lenirken hata: ${error.message}`);
        this.cacheService.set('market-data:commodities', allData.commodities, this.CACHE_TTL);
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

