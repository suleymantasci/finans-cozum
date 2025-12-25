import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataItem } from '../dto/market-data.dto';

@Injectable()
export class BinanceProvider {
  private readonly logger = new Logger(BinanceProvider.name);
  private readonly baseUrl = 'https://api.binance.com/api/v3';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Binance'den kripto para fiyatlarını getir
   * Sadece USDT ile biten coinleri listeler
   */
  async getCryptoPrices(): Promise<MarketDataItem[]> {
    try {
      // 24 saatlik ticker verilerini al
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/ticker/24hr`),
      );

      const allTickers = response.data;
      
      // Sadece USDT ile biten coinleri filtrele
      const filteredTickers = allTickers.filter((ticker: any) =>
        ticker.symbol.endsWith('USDT'),
      );

      // Popüler coinler için isim mapping (opsiyonel, yoksa symbol kullanılır)
      const nameMap: Record<string, string> = {
        BTCUSDT: 'Bitcoin',
        ETHUSDT: 'Ethereum',
        BNBUSDT: 'Binance Coin',
        XRPUSDT: 'Ripple',
        ADAUSDT: 'Cardano',
        SOLUSDT: 'Solana',
        DOGEUSDT: 'Dogecoin',
        DOTUSDT: 'Polkadot',
        MATICUSDT: 'Polygon',
        AVAXUSDT: 'Avalanche',
        LINKUSDT: 'Chainlink',
        UNIUSDT: 'Uniswap',
        LTCUSDT: 'Litecoin',
        ATOMUSDT: 'Cosmos',
        ETCUSDT: 'Ethereum Classic',
        XLMUSDT: 'Stellar',
        ALGOUSDT: 'Algorand',
        VETUSDT: 'VeChain',
        FILUSDT: 'Filecoin',
        TRXUSDT: 'TRON',
        EOSUSDT: 'EOS',
        AAVEUSDT: 'Aave',
        MKRUSDT: 'Maker',
        GRTUSDT: 'The Graph',
        SHIBUSDT: 'Shiba Inu',
        APTUSDT: 'Aptos',
        ARBUSDT: 'Arbitrum',
        OPUSDT: 'Optimism',
        NEARUSDT: 'NEAR Protocol',
        ICPUSDT: 'Internet Computer',
        SUIUSDT: 'Sui',
        INJUSDT: 'Injective',
        TIAUSDT: 'Celestia',
        SEIUSDT: 'Sei',
        RENDERUSDT: 'Render',
        FETUSDT: 'Fetch.ai',
        THETAUSDT: 'Theta Network',
        FTMUSDT: 'Fantom',
        SANDUSDT: 'The Sandbox',
        MANAUSDT: 'Decentraland',
        AXSUSDT: 'Axie Infinity',
        GALAUSDT: 'Gala',
        CHZUSDT: 'Chiliz',
        ENJUSDT: 'Enjin',
        FLOWUSDT: 'Flow',
        SUSHIUSDT: 'SushiSwap',
        CRVUSDT: 'Curve',
        COMPUSDT: 'Compound',
      };

      return filteredTickers
        .map((ticker: any) => {
          const rawPrice = parseFloat(ticker.lastPrice);
          
          // Fiyat 0, NaN veya geçersizse atla
          if (!rawPrice || isNaN(rawPrice) || rawPrice <= 0) {
            return null;
          }
          
          // Fiyatı mantıklı ondalık basamak sayısına yuvarla
          const price = this.formatCryptoPrice(rawPrice);
          
          // Formatlanmış fiyat da 0 ise atla
          if (price <= 0) {
            return null;
          }
          
          const changePercent = parseFloat(ticker.priceChangePercent);
          const change = (price * changePercent) / 100;
          const volume = parseFloat(ticker.volume);
          const marketCap = price * volume; // Basit hesaplama

          // Symbol'den USDT'yi kaldır (BTCUSDT -> BTC)
          const symbol = ticker.symbol.replace('USDT', '');
          // İsim mapping'de yoksa symbol'ü kullan
          const name = nameMap[ticker.symbol] || symbol;

          return {
            symbol,
            name,
            price,
            change,
            changePercent,
            isUp: changePercent >= 0,
            timestamp: Date.now(),
            category: 'crypto' as const,
            metadata: {
              volume,
              high: this.formatCryptoPrice(parseFloat(ticker.highPrice)),
              low: this.formatCryptoPrice(parseFloat(ticker.lowPrice)),
              open: this.formatCryptoPrice(parseFloat(ticker.openPrice)),
              prevClose: this.formatCryptoPrice(parseFloat(ticker.prevClosePrice)),
              marketCap: this.formatMarketCap(marketCap),
            },
          };
        })
        .filter((item: any) => item !== null); // null olanları filtrele
    } catch (error: any) {
      this.logger.error(`Binance API hatası: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Kripto fiyatını mantıklı ondalık basamak sayısına formatla
   * Çok küçük değerler için daha fazla ondalık basamak kullan
   */
  private formatCryptoPrice(price: number): number {
    if (isNaN(price) || price === 0) return 0;
    
    // Fiyat aralığına göre ondalık basamak sayısı belirle
    if (price >= 1) {
      // 1 USD ve üzeri: 2 ondalık basamak (örn: 1234.56)
      return parseFloat(price.toFixed(4));
    } else if (price >= 0.01) {
      // 0.01 - 1 USD arası: 4 ondalık basamak (örn: 0.1234)
      return parseFloat(price.toFixed(6));
    } else if (price >= 0.0001) {
      // 0.0001 - 0.01 USD arası: 6 ondalık basamak (örn: 0.000123)
      return parseFloat(price.toFixed(8));
    } else if (price >= 0.000001) {
      // 0.000001 - 0.0001 USD arası: 8 ondalık basamak (örn: 0.00001234)
      return parseFloat(price.toFixed(10));
    } else {
      // 0.000001'den küçük: 10 ondalık basamak (örn: 0.0000001234)
      return parseFloat(price.toFixed(12));
    }
  }

  private formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(2)}`;
  }
}

