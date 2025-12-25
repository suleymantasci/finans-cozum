import { Injectable } from '@nestjs/common';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheItem<any>>();

  /**
   * Cache'e veri ekle
   * @param key Cache anahtarı
   * @param data Cache'lenecek veri
   * @param ttlSeconds Time to live (saniye cinsinden)
   */
  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Cache'den veri al
   * @param key Cache anahtarı
   * @returns Cache'deki veri veya null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Süresi dolmuş mu kontrol et
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Cache'den veri sil
   * @param key Cache anahtarı
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Cache'i temizle
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Süresi dolmuş cache'leri temizle
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cache'deki tüm anahtarları döndür
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Cache'deki öğe sayısını döndür
   */
  size(): number {
    return this.cache.size;
  }
}


