import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseProcessor } from './base-processor';

@Injectable()
export class TcmbProcessor extends BaseProcessor {
  constructor(httpService: HttpService) {
    super(httpService);
  }

  async processTcmbData(data: any) {
    // TCMB API response formatını işle
    // Örnek: { items: [{ SERIE_CODE: 'TP.DK.USD.A', TP_DK_USD_A: 34.5, TARIH: '2024-01-01' }] }
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        code: item.SERIE_CODE || item.code,
        rate: item.TP_DK_USD_A || item.TP_DK_EUR_A || item.TP_DK_GBP_A || item.rate,
        date: item.TARIH || item.date,
        currency: this.extractCurrencyCode(item.SERIE_CODE || item.code),
      }));
    }

    return data;
  }

  private extractCurrencyCode(serieCode: string): string {
    if (serieCode.includes('USD')) return 'USD';
    if (serieCode.includes('EUR')) return 'EUR';
    if (serieCode.includes('GBP')) return 'GBP';
    return serieCode;
  }
}


