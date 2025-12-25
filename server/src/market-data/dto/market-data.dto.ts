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
    bistGroups?: string[]; // BIST grupları (BIST 100, BIST 50, BIST 30, vs.)
    time?: string; // Veri saati (HH:mm formatında)
    [key: string]: any; // Diğer ek metadata alanları için
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


