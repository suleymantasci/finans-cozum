export interface EconomicEvent {
  date: string; // ISO String
  country: string;
  importance: number; // 1, 2, or 3
  title: string;
  description?: string;
  forecast?: string;
  actual?: string;
  previous?: string;
}

export interface EconomicCalendarResponse {
  events: EconomicEvent[];
  lastUpdate: number;
}

export type CalendarPeriod = 'yesterday' | 'today' | 'tomorrow' | 'week' | 'month';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const economicCalendarApi = {
  async getEvents(period: CalendarPeriod): Promise<EconomicCalendarResponse> {
    const response = await fetch(`${API_BASE_URL}/economic-calendar/${period}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch economic calendar: ${response.statusText}`);
    }

    return response.json();
  },
};
