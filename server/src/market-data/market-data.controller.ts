import { Controller, Get, Param, Query, Header } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { MarketDataResponse, MarketDetailResponse } from './dto/market-data.dto';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('all')
  async getAllMarketData(): Promise<MarketDataResponse> {
    return this.marketDataService.getAllMarketData();
  }

  @Get('ticker')
  async getTickerData() {
    const data = await this.marketDataService.getAllMarketData();
    return {
      items: data.ticker,
      lastUpdate: data.lastUpdate,
    };
  }

  @Get('forex')
  async getForexData() {
    return this.marketDataService.getForexData();
  }

  @Get('crypto')
  async getCryptoData() {
    return this.marketDataService.getCryptoData();
  }

  @Get('stocks')
  async getStockData() {
    return this.marketDataService.getStockData();
  }

  @Get('stocks/indices')
  async getBistIndices() {
    return this.marketDataService.getBistIndices();
  }

  @Get('commodities')
  async getCommodityData() {
    return this.marketDataService.getCommodityData();
  }

  @Get('detail/:symbol')
  async getMarketDetail(@Param('symbol') symbol: string): Promise<MarketDetailResponse | null> {
    return this.marketDataService.getMarketDetail(symbol);
  }
}

