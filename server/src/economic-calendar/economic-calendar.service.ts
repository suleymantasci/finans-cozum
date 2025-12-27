import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { EconomicCalendarResponse, EconomicEvent, CalendarPeriod } from './dto/economic-calendar.dto';

@Injectable()
export class EconomicCalendarService {
  private readonly logger = new Logger(EconomicCalendarService.name);
  private readonly CACHE_TTL = 14400; // 4 hours in seconds
  private readonly BASE_URL = 'https://finans.mynet.com/api/ekonomiktakvim/events';

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Get economic calendar events for a specific period
   */
  async getEvents(period: CalendarPeriod): Promise<EconomicCalendarResponse> {
    const CACHE_KEY = `economic-calendar:${period}`;

    // Check cache first
    const cached = this.cacheService.get<EconomicCalendarResponse>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Fetch from API
    try {
      const data = await this.fetchEventsFromAPI(period);
      this.cacheService.set(CACHE_KEY, data, this.CACHE_TTL);
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to fetch economic calendar for ${period}: ${error.message}`, error.stack);
      
      // Return empty response on error
      const emptyResponse: EconomicCalendarResponse = {
        events: [],
        lastUpdate: Date.now(),
      };
      
      // Cache empty response for shorter time to retry sooner
      this.cacheService.set(CACHE_KEY, emptyResponse, 300); // 5 minutes
      return emptyResponse;
    }
  }

  /**
   * Fetch events from Mynet Finance API
   */
  private async fetchEventsFromAPI(period: CalendarPeriod): Promise<EconomicCalendarResponse> {
    const url = `${this.BASE_URL}/${period}`;
    
    this.logger.debug(`Fetching economic calendar from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const rawData = await response.json();
    
    // Transform the data to use readable property names
    const descriptions = rawData.descriptions || {};
    const events: EconomicEvent[] = (rawData.events || []).map((event: any) => {
      const transformedEvent: EconomicEvent = {
        date: new Date(event.d).toISOString(),
        country: event.c,
        importance: event.i,
        title: event.e,
        forecast: event.f,
        actual: event.a,
        previous: event.p,
      };

      // Add description if available
      if (event.did && descriptions[`did${event.did}`]) {
        transformedEvent.description = descriptions[`did${event.did}`];
      }

      return transformedEvent;
    });

    return {
      events,
      lastUpdate: Date.now(),
    };
  }
}
