export interface EconomicEvent {
  date: string; // ISO String
  country: string;
  importance: number; // 1, 2, or 3
  title: string;
  description?: string; // Populated from descriptions map
  forecast?: string;
  actual?: string;
  previous?: string;
}

export interface EconomicCalendarResponse {
  events: EconomicEvent[];
  lastUpdate: number;
}

export type CalendarPeriod = 'yesterday' | 'today' | 'tomorrow' | 'week' | 'month';
