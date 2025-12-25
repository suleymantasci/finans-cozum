import { api } from './api';

export interface MarketDataItem {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  isUp: boolean;
  timestamp: number;
  category: 'forex' | 'crypto' | 'stock' | 'commodity';
  metadata?: {
    buy?: number;
    sell?: number;
    marketCap?: string;
    volume?: number;
    high?: number;
    low?: number;
    open?: number;
    prevClose?: number;
    time?: string; // Veri saati (HH:mm formatında)
  };
}

export interface MarketDataResponse {
  ticker: MarketDataItem[];
  forex: MarketDataItem[];
  crypto: MarketDataItem[];
  stocks: MarketDataItem[];
  commodities: MarketDataItem[];
  lastUpdate: number;
}

export interface MarketDetailResponse {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume?: number;
  marketCap?: string;
  high52w?: number;
  low52w?: number;
  type: string;
  category: string;
  metadata?: Record<string, any>;
  lastUpdate: number;
}

export interface TcmbForexResponse {
  data: MarketDataItem[];
  date: string; // ISO date string (YYYY-MM-DD)
}

export const marketApi = {
  /**
   * Tüm piyasa verilerini getir
   */
  getAllMarketData: async (): Promise<MarketDataResponse> => {
    return api.get<MarketDataResponse>('/market-data/all');
  },

  /**
   * Ticker için veri getir
   */
  getTickerData: async (): Promise<{ items: MarketDataItem[]; lastUpdate: number }> => {
    return api.get<{ items: MarketDataItem[]; lastUpdate: number }>('/market-data/ticker');
  },

  /**
   * Döviz verilerini getir (TCMB - tarih bilgisi ile)
   */
  getForexData: async (): Promise<TcmbForexResponse> => {
    return api.get<TcmbForexResponse>('/market-data/forex');
  },

  /**
   * Kripto verilerini getir
   */
  getCryptoData: async (): Promise<MarketDataItem[]> => {
    return api.get<MarketDataItem[]>('/market-data/crypto');
  },

  /**
   * Borsa verilerini getir
   */
  getStockData: async (): Promise<MarketDataItem[]> => {
    return api.get<MarketDataItem[]>('/market-data/stocks');
  },

  /**
   * BIST endeks bilgilerini getir (BIST 100, BIST 50, BIST 30)
   */
  getBistIndices: async (): Promise<Array<{ name: string; price: number; changePercent: number; isUp: boolean }>> => {
    return api.get<Array<{ name: string; price: number; changePercent: number; isUp: boolean }>>('/market-data/stocks/indices');
  },

  /**
   * Emtia verilerini getir
   */
  getCommodityData: async (): Promise<MarketDataItem[]> => {
    return api.get<MarketDataItem[]>('/market-data/commodities');
  },

  /**
   * Belirli bir sembol için detaylı veri getir
   */
  getMarketDetail: async (symbol: string): Promise<MarketDetailResponse | null> => {
    return api.get<MarketDetailResponse | null>(`/market-data/detail/${symbol}`);
  },

  /**
   * Belirli bir sembol için geçmiş fiyat verilerini getir (grafik için)
   */
  getMarketHistory: async (symbol: string, days: number = 30): Promise<Array<{ date: string; price: number }>> => {
    return api.get<Array<{ date: string; price: number }>>(`/market-data/history/${symbol}?days=${days}`);
  },
};

