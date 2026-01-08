import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class Ipv6UtilService {
  private readonly logger = new Logger(Ipv6UtilService.name);

  /**
   * IPv6 subnet'ini parse et
   * @param subnet IPv6 subnet (örn: "2001:db8::/64")
   * @returns Base adres ve prefix length
   */
  parseSubnet(subnet: string): { base: string; prefixLength: number } {
    const parts = subnet.split('/');
    if (parts.length !== 2) {
      throw new Error(`Geçersiz IPv6 subnet formatı: ${subnet}. Format: 2001:db8::/64`);
    }

    const base = parts[0].trim();
    const prefixLength = parseInt(parts[1].trim(), 10);

    if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 128) {
      throw new Error(`Geçersiz prefix length: ${prefixLength}. 0-128 arası olmalı.`);
    }

    if (!this.isValidIPv6(base)) {
      throw new Error(`Geçersiz IPv6 adresi: ${base}`);
    }

    return { base, prefixLength };
  }

  /**
   * IPv6 adresinin geçerli olup olmadığını kontrol et
   */
  isValidIPv6(ip: string): boolean {
    // Basit IPv6 validasyonu
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    const compressedRegex = /^::([0-9a-fA-F]{0,4}:){0,6}[0-9a-fA-F]{0,4}$|^([0-9a-fA-F]{0,4}:){1,7}::$|^::$/;
    
    return ipv6Regex.test(ip) || compressedRegex.test(ip);
  }

  /**
   * IPv6 adresini BigInt'e çevir
   */
  private ipv6ToBigInt(ip: string): bigint {
    // IPv6 adresini normalize et (:: kısaltmasını genişlet)
    const normalized = this.normalizeIPv6(ip);
    
    // Her hextet'i parse et
    const parts = normalized.split(':');
    let result = 0n;
    
    for (let i = 0; i < parts.length; i++) {
      const hextet = parseInt(parts[i], 16);
      result = (result << 16n) | BigInt(hextet);
    }
    
    return result;
  }

  /**
   * BigInt'i IPv6 adresine çevir
   */
  private bigIntToIPv6(value: bigint): string {
    const parts: string[] = [];
    
    for (let i = 0; i < 8; i++) {
      const hextet = Number(value & 0xFFFFn);
      parts.unshift(hextet.toString(16));
      value = value >> 16n;
    }
    
    return parts.join(':');
  }

  /**
   * IPv6 adresini normalize et (:: kısaltmasını genişlet)
   */
  private normalizeIPv6(ip: string): string {
    if (!ip.includes('::')) {
      return ip;
    }

    const parts = ip.split('::');
    const leftParts = parts[0] ? parts[0].split(':') : [];
    const rightParts = parts[1] ? parts[1].split(':') : [];
    
    const missingParts = 8 - leftParts.length - rightParts.length;
    const zeros = Array(missingParts).fill('0');
    
    return [...leftParts, ...zeros, ...rightParts].join(':');
  }

  /**
   * Subnet aralığını hesapla
   */
  getSubnetRange(subnet: string): { min: bigint; max: bigint } {
    const { base, prefixLength } = this.parseSubnet(subnet);
    const baseBigInt = this.ipv6ToBigInt(base);
    
    // Prefix length'e göre mask hesapla
    const hostBits = 128n - BigInt(prefixLength);
    const mask = (1n << hostBits) - 1n;
    
    const min = baseBigInt & ~mask;
    const max = baseBigInt | mask;
    
    return { min, max };
  }

  /**
   * Subnet içinden rastgele bir IPv6 adresi üret
   */
  generateRandomIPv6(subnet: string): string {
    try {
      const { min, max } = this.getSubnetRange(subnet);
      
      // Rastgele bir sayı üret (min ve max arasında)
      const range = max - min;
      const randomOffset = BigInt(Math.floor(Math.random() * Number(range + 1n)));
      const randomIP = min + randomOffset;
      
      // BigInt'i IPv6 adresine çevir
      const ipv6 = this.bigIntToIPv6(randomIP);
      
      // Kısaltılmış formata çevir (gerekirse)
      return this.compressIPv6(ipv6);
    } catch (error) {
      this.logger.error(`IPv6 adresi üretilirken hata: ${error.message}`);
      throw error;
    }
  }

  /**
   * IPv6 adresini kısaltılmış formata çevir (:: kullanarak)
   */
  private compressIPv6(ip: string): string {
    const parts = ip.split(':');
    
    // En uzun sıfır dizisini bul
    let maxZeroStart = -1;
    let maxZeroLength = 0;
    let currentZeroStart = -1;
    let currentZeroLength = 0;
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '0') {
        if (currentZeroStart === -1) {
          currentZeroStart = i;
          currentZeroLength = 1;
        } else {
          currentZeroLength++;
        }
      } else {
        if (currentZeroLength > maxZeroLength && currentZeroLength > 1) {
          maxZeroStart = currentZeroStart;
          maxZeroLength = currentZeroLength;
        }
        currentZeroStart = -1;
        currentZeroLength = 0;
      }
    }
    
    // Son kontrol
    if (currentZeroLength > maxZeroLength && currentZeroLength > 1) {
      maxZeroStart = currentZeroStart;
      maxZeroLength = currentZeroLength;
    }
    
    // Kısaltılmış formatı oluştur
    if (maxZeroStart !== -1 && maxZeroLength > 1) {
      const before = parts.slice(0, maxZeroStart).join(':');
      const after = parts.slice(maxZeroStart + maxZeroLength).join(':');
      
      if (!before && !after) {
        return '::';
      }
      if (!before) {
        return `::${after}`;
      }
      if (!after) {
        return `${before}::`;
      }
      return `${before}::${after}`;
    }
    
    return ip;
  }

  /**
   * IPv6 adresini proxy formatına çevir
   * @param ip IPv6 adresi
   * @param port Port numarası (varsayılan: 80)
   * @returns Proxy URL formatı: http://[2001:db8::1]:port
   */
  formatProxyUrl(ip: string, port: number = 80): string {
    // IPv6 adresini köşeli parantez içine al
    return `http://[${ip}]:${port}`;
  }
}

