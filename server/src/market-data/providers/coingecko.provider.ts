import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataItem } from '../dto/market-data.dto';

@Injectable()
export class CoinGeckoProvider {
  private readonly logger = new Logger(CoinGeckoProvider.name);
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Kripto para fiyatlarını getir
   */
  async getCryptoPrices(): Promise<MarketDataItem[]> {
    try {
      const coinIds = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana'];
      const vsCurrency = 'usd';

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/simple/price`, {
          params: {
            ids: coinIds.join(','),
            vs_currencies: vsCurrency,
            include_24hr_change: true,
            include_market_cap: true,
          },
        }),
      );

      const data = response.data;
      const symbolMap: Record<string, string> = {
        bitcoin: 'BTC',
        ethereum: 'ETH',
        binancecoin: 'BNB',
        ripple: 'XRP',
        cardano: 'ADA',
        solana: 'SOL',
      };

      const nameMap: Record<string, string> = {
        bitcoin: 'Bitcoin',
        ethereum: 'Ethereum',
        binancecoin: 'Binance Coin',
        ripple: 'Ripple',
        cardano: 'Cardano',
        solana: 'Solana',
      };

      return coinIds
        .filter((id) => data[id])
        .map((id) => {
          const coinData = data[id];
          const changePercent = coinData[`${vsCurrency}_24h_change`] || 0;
          const price = coinData[vsCurrency] || 0;
          const marketCap = coinData[`${vsCurrency}_market_cap`] || 0;

          return {
            symbol: symbolMap[id],
            name: nameMap[id],
            price,
            change: (price * changePercent) / 100,
            changePercent,
            isUp: changePercent >= 0,
            timestamp: Date.now(),
            category: 'crypto' as const,
            metadata: {
              marketCap: this.formatMarketCap(marketCap),
            },
          };
        });
    } catch (error: any) {
      this.logger.error(`CoinGecko API hatası: ${error.message}`, error.stack);
      throw error;
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


