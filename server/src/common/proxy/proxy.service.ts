import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ipv6UtilService } from './ipv6-util.service';

export type FailoverMode = 'hybrid' | 'ipv4_only' | 'ipv6_only';

export interface ProxyConfig {
  enabled: boolean;
  servers: string[];
  rotationEnabled: boolean;
  ipv6Enabled?: boolean;
  ipv6Subnet?: string;
  failoverMode?: FailoverMode;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly globalProxyConfig: ProxyConfig;
  private currentProxyIndex = 0;
  private ipv6FailureCount = 0; // IPv6 başarısızlık sayacı (failover için)
  private readonly MAX_IPV6_FAILURES = 3; // 3 başarısızlıktan sonra IPv4'e geç

  constructor(
    private readonly configService: ConfigService,
    private readonly ipv6Util: Ipv6UtilService,
  ) {
    // Global proxy ayarları
    const proxyEnabled = this.configService.get<string>('PROXY_ENABLED', 'false') === 'true';
    const proxyServers = this.configService.get<string>('PROXY_SERVERS', '');
    
    this.globalProxyConfig = {
      enabled: proxyEnabled,
      servers: proxyServers
        ? proxyServers.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : [],
      rotationEnabled: true,
    };

    if (this.globalProxyConfig.enabled && this.globalProxyConfig.servers.length > 0) {
      this.logger.log(
        `Global proxy aktif: ${this.globalProxyConfig.servers.length} proxy tanımlı (rotasyon: ${this.globalProxyConfig.rotationEnabled ? 'açık' : 'kapalı'})`
      );
    } else {
      this.logger.debug('Global proxy devre dışı');
    }
  }

  /**
   * Servis için özel proxy config al (override edilebilir)
   * @param serviceName Servis adı (örn: 'harem-altin', 'ipo-scraper')
   * @returns Proxy config
   */
  getProxyConfig(serviceName?: string): ProxyConfig {
    const serviceKey = serviceName?.toUpperCase().replace(/-/g, '_') || '';
    
    // Servis özel IPv6 ayarları kontrol et
    if (serviceName) {
      const serviceIpv6Enabled = this.configService.get<string>(
        `PROXY_${serviceKey}_IPV6_ENABLED`
      );
      const serviceIpv6Subnet = this.configService.get<string>(
        `PROXY_${serviceKey}_IPV6_SUBNET`
      );
      const serviceFailoverMode = this.configService.get<FailoverMode>(
        `PROXY_${serviceKey}_FAILOVER_MODE`,
        'hybrid'
      );

      // Servis özel IPv4 proxy ayarları
      const serviceProxyEnabled = this.configService.get<string>(
        `PROXY_${serviceKey}_ENABLED`
      );
      const serviceProxyServers = this.configService.get<string>(
        `PROXY_${serviceKey}_SERVERS`
      );

      // Servis özel IPv6 aktifse
      if (serviceIpv6Enabled === 'true') {
        // Servis özel subnet yoksa global subnet'i kullan
        const ipv6SubnetToUse = serviceIpv6Subnet || this.configService.get<string>('IPV6_SUBNET');
        
        if (ipv6SubnetToUse) {
          const config: ProxyConfig = {
            enabled: true,
            servers: [],
            rotationEnabled: true,
            ipv6Enabled: true,
            ipv6Subnet: ipv6SubnetToUse,
            failoverMode: serviceFailoverMode,
          };

          // Failover modda IPv4 proxy'leri de ekle
          if (serviceFailoverMode === 'hybrid' && serviceProxyEnabled === 'true' && serviceProxyServers) {
            const servers = serviceProxyServers
              .split(',')
              .map(p => p.trim())
              .filter(p => p.length > 0);
            if (servers.length > 0) {
              config.servers = servers;
            }
          }

          const subnetSource = serviceIpv6Subnet ? 'servis özel' : 'global';
          this.logger.debug(`Servis özel IPv6 proxy kullanılıyor: ${serviceName} (subnet: ${ipv6SubnetToUse}, kaynak: ${subnetSource})`);
          return config;
        } else {
          this.logger.warn(`Servis özel IPv6 aktif ama subnet tanımlı değil: ${serviceName}`);
        }
      }

      // Servis özel IPv4 proxy ayarları (IPv6 yoksa)
      if (serviceProxyEnabled === 'true' && serviceProxyServers) {
        const servers = serviceProxyServers
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0);

        if (servers.length > 0) {
          this.logger.debug(`Servis özel IPv4 proxy kullanılıyor: ${serviceName}`);
          return {
            enabled: true,
            servers,
            rotationEnabled: true,
            ipv6Enabled: false,
            failoverMode: 'ipv4_only',
          };
        }
      }
    }

    // Global IPv6 ayarları kontrol et
    const globalIpv6Enabled = this.configService.get<string>('IPV6_ENABLED', 'false') === 'true';
    const globalIpv6Subnet = this.configService.get<string>('IPV6_SUBNET');
    const globalFailoverMode = this.configService.get<FailoverMode>('PROXY_FAILOVER_MODE', 'hybrid');

    if (globalIpv6Enabled && globalIpv6Subnet) {
      const config: ProxyConfig = {
        ...this.globalProxyConfig,
        ipv6Enabled: true,
        ipv6Subnet: globalIpv6Subnet,
        failoverMode: globalFailoverMode,
      };
      return config;
    }

    // Global proxy config döndür
    return {
      ...this.globalProxyConfig,
      ipv6Enabled: false,
      failoverMode: 'ipv4_only',
    };
  }

  /**
   * Bir sonraki proxy'yi al (rotasyon ile)
   * @param serviceName Servis adı (opsiyonel)
   * @returns Proxy URL veya undefined
   */
  getNextProxy(serviceName?: string): string | undefined {
    const config = this.getProxyConfig(serviceName);

    if (!config.enabled) {
      return undefined;
    }

    // IPv6 aktifse ve failover modda değilsek veya ipv6_only moddaysa
    if (config.ipv6Enabled && config.ipv6Subnet) {
      // ipv6_only modda veya hybrid modda ama IPv6 başarısızlık sayısı limit altındaysa
      if (config.failoverMode === 'ipv6_only' || 
          (config.failoverMode === 'hybrid' && this.ipv6FailureCount < this.MAX_IPV6_FAILURES)) {
        try {
          // Rastgele IPv6 adresi üret
          const randomIPv6 = this.ipv6Util.generateRandomIPv6(config.ipv6Subnet);
          // Proxy formatına çevir (port 80 varsayılan, gerekirse config'den alınabilir)
          const proxyUrl = this.ipv6Util.formatProxyUrl(randomIPv6, 80);
          this.logger.debug(`IPv6 proxy üretildi${serviceName ? ` (${serviceName})` : ''}: [${randomIPv6}]`);
          return proxyUrl;
        } catch (error) {
          this.logger.warn(`IPv6 adresi üretilemedi${serviceName ? ` (${serviceName})` : ''}: ${error.message}`);
          // Hata durumunda failover'a geç
          if (config.failoverMode === 'hybrid' && config.servers.length > 0) {
            this.ipv6FailureCount++;
            this.logger.debug(`IPv6 başarısız, IPv4'e geçiliyor (${this.ipv6FailureCount}/${this.MAX_IPV6_FAILURES})`);
          }
        }
      }
    }

    // IPv4 proxy'leri kullan (hybrid modda failover veya ipv4_only modda)
    if (config.servers.length === 0) {
      return undefined;
    }

    if (!config.rotationEnabled) {
      // Rotasyon kapalıysa ilk proxy'yi döndür
      return config.servers[0];
    }

    // Rotasyon ile bir sonraki proxy'yi al
    const proxy = config.servers[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % config.servers.length;
    return proxy;
  }

  /**
   * IPv6 başarısızlık sayacını sıfırla (başarılı istek sonrası)
   */
  resetIpv6FailureCount(): void {
    if (this.ipv6FailureCount > 0) {
      this.logger.debug(`IPv6 başarı sayacı sıfırlandı (önceki: ${this.ipv6FailureCount})`);
      this.ipv6FailureCount = 0;
    }
  }

  /**
   * IPv6 başarısızlık sayacını artır (hata durumunda)
   */
  incrementIpv6FailureCount(): void {
    this.ipv6FailureCount++;
    this.logger.warn(`IPv6 başarısızlık sayacı: ${this.ipv6FailureCount}/${this.MAX_IPV6_FAILURES}`);
  }

  /**
   * Proxy'nin aktif olup olmadığını kontrol et
   * @param serviceName Servis adı (opsiyonel)
   * @returns Proxy aktif mi?
   */
  isEnabled(serviceName?: string): boolean {
    const config = this.getProxyConfig(serviceName);
    return config.enabled && (config.ipv6Enabled || config.servers.length > 0);
  }

  /**
   * Proxy'yi browser launch args'ına ekle
   * @param launchArgs Mevcut launch args array'i
   * @param serviceName Servis adı (opsiyonel)
   * @returns Güncellenmiş launch args
   */
  addProxyToLaunchArgs(launchArgs: string[], serviceName?: string): string[] {
    const proxy = this.getNextProxy(serviceName);
    
    if (proxy) {
      launchArgs.push(`--proxy-server=${proxy}`);
      const maskedProxy = proxy.replace(/:[^:@]*@/, ':****@');
      this.logger.debug(`Proxy eklendi${serviceName ? ` (${serviceName})` : ''}: ${maskedProxy}`);
    }
    
    return launchArgs;
  }

  /**
   * Proxy durumunu logla
   * @param serviceName Servis adı (opsiyonel)
   */
  logProxyStatus(serviceName?: string): void {
    const config = this.getProxyConfig(serviceName);
    
    if (!config.enabled) {
      this.logger.debug(`Proxy durumu${serviceName ? ` (${serviceName})` : ''}: Devre dışı`);
      return;
    }

    if (config.ipv6Enabled && config.ipv6Subnet) {
      const ipv4Info = config.servers.length > 0 
        ? `, ${config.servers.length} IPv4 proxy (failover)` 
        : '';
      this.logger.log(
        `Proxy durumu${serviceName ? ` (${serviceName})` : ''}: IPv6 aktif (subnet: ${config.ipv6Subnet})` +
        `${ipv4Info}, mod: ${config.failoverMode || 'hybrid'}`
      );
    } else if (config.servers.length > 0) {
      this.logger.log(
        `Proxy durumu${serviceName ? ` (${serviceName})` : ''}: ${config.servers.length} IPv4 proxy tanımlı, ` +
        `rotasyon ${config.rotationEnabled ? 'açık' : 'kapalı'}`
      );
    } else {
      this.logger.debug(`Proxy durumu${serviceName ? ` (${serviceName})` : ''}: Devre dışı`);
    }
  }
}

