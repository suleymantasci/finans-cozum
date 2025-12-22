import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BaseProcessor {
  constructor(protected httpService: HttpService) {}

  async fetchData(apiUrl: string, method: string = 'GET', headers?: any, body?: any) {
    try {
      const config: any = {
        headers: headers || {},
      };

      let response;
      if (method === 'GET') {
        response = await firstValueFrom(this.httpService.get(apiUrl, config));
      } else if (method === 'POST') {
        response = await firstValueFrom(this.httpService.post(apiUrl, body, config));
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`API fetch error: ${error.message}`);
    }
  }

  extractDataPath(data: any, path?: string): any {
    if (!path) {
      return data;
    }

    const keys = path.split('.');
    let result = data;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return null;
      }
    }

    return result;
  }

  transformData(data: any, transformScript?: string): any {
    if (!transformScript) {
      return data;
    }

    try {
      // Basit transform script execution
      // Güvenlik için sadece belirli fonksiyonlara izin verilebilir
      const func = new Function('data', transformScript);
      return func(data);
    } catch (error: any) {
      throw new Error(`Transform script error: ${error.message}`);
    }
  }
}

