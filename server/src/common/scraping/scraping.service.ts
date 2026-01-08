import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  // Gerçekçi user agent'lar (rotasyon için)
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  // Gerçekçi viewport boyutları
  private readonly viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
    { width: 1600, height: 900 },
  ];

  // Cookie persistence için storage path
  private readonly cookieStoragePath = '/tmp/playwright-cookies';

  constructor(private readonly proxyService: ProxyService) {
    // Cookie storage dizinini oluştur
    const fs = require('fs');
    if (!fs.existsSync(this.cookieStoragePath)) {
      fs.mkdirSync(this.cookieStoragePath, { recursive: true });
    }
  }

  /**
   * Rastgele bir sayı üret (min-max arası)
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Rastgele bir user agent seç
   */
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Rastgele bir viewport seç
   */
  private getRandomViewport(): { width: number; height: number } {
    return this.viewports[Math.floor(Math.random() * this.viewports.length)];
  }

  /**
   * İnsan benzeri rastgele bekleme (1-2 saniye arası - finans siteleri için daha gerçekçi)
   */
  async humanLikeDelay(min: number = 1000, max: number = 2000): Promise<void> {
    const delay = this.randomInt(min, max);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * İnsan benzeri mouse hareketleri ve scroll simülasyonu
   */
  async simulateHumanBehavior(page: Page): Promise<void> {
    try {
      // Rastgele scroll yap
      const scrollAmount = this.randomInt(100, 500);
      await page.evaluate((amount) => {
        window.scrollBy(0, amount);
      }, scrollAmount);
      
      await this.humanLikeDelay(200, 500);
      
      // Rastgele mouse hareketi
      await page.mouse.move(
        this.randomInt(100, 800),
        this.randomInt(100, 600),
        { steps: this.randomInt(5, 15) }
      );
      
      await this.humanLikeDelay(100, 300);
    } catch (error) {
      // Hata olursa devam et, kritik değil
    }
  }

  /**
   * Bot tespitini engellemek için init script'leri ekle (rastgele plugin/chrome spoof)
   */
  private async addAntiDetectionScripts(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Webdriver property'sini kaldır
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Rastgele Chrome property'si (daha gerçekçi)
      const chromeFeatures = [
        { runtime: {} },
        { runtime: {}, loadTimes: () => ({}) },
        { runtime: {}, csi: () => ({}) },
      ];
      const randomChrome = chromeFeatures[Math.floor(Math.random() * chromeFeatures.length)];
      (window as any).chrome = randomChrome;
      
      // Permissions API'yi mock'la
      const originalQuery = (window.navigator as any).permissions?.query;
      if (originalQuery) {
        (window.navigator as any).permissions.query = (parameters: any) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission } as PermissionStatus) :
            originalQuery(parameters)
        );
      }
      
      // Rastgele plugins array'i (her seferinde farklı)
      const pluginNames = [
        'Chrome PDF Plugin',
        'Chrome PDF Viewer',
        'Native Client',
        'WebKit built-in PDF',
        'Microsoft Edge PDF Viewer',
      ];
      const pluginCount = Math.floor(Math.random() * 3) + 3; // 3-5 arası plugin
      const selectedPlugins = pluginNames
        .sort(() => Math.random() - 0.5)
        .slice(0, pluginCount)
        .map((name, index) => ({
          name,
          description: `${name} ${index + 1}`,
          filename: `${name.toLowerCase().replace(/\s+/g, '-')}.dll`,
        }));
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => selectedPlugins,
        configurable: true,
      });
      
      // Languages array'ini ayarla
      Object.defineProperty(navigator, 'languages', {
        get: () => ['tr-TR', 'tr', 'en-US', 'en'],
      });
    });
  }

  /**
   * Gerçekçi HTTP header'ları ayarla
   */
  private async setRealisticHeaders(page: Page): Promise<void> {
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    });
  }

  /**
   * Network isteklerini filtrele (font abort kaldırıldı - finans siteleri için kritik)
   */
  private async setupNetworkFiltering(page: Page): Promise<void> {
    await page.route('**/*', (route: any) => {
      const resourceType = route.request().resourceType();
      const url = route.request().url();
      
      // Font abort kaldırıldı - finans siteleri bunu bot sinyali olarak kullanıyor
      // Sadece media engelle (video, audio)
      if (resourceType === 'media') {
        route.abort();
      } else if (resourceType === 'image') {
        // Kritik SVG/JSON image'leri yükle (logo, icon, chart, graph vb.)
        const criticalImageKeywords = [
          'logo', 'icon', 'favicon', 'chart', 'graph', 
          'svg', 'png', 'jpg', 'jpeg', 'webp', 'data'
        ];
        if (criticalImageKeywords.some(keyword => url.toLowerCase().includes(keyword))) {
          route.continue();
        } else {
          // Diğer resimleri engelle (performans için)
          route.abort();
        }
      } else {
        // Font, stylesheet, script, document, xhr, fetch - hepsini yükle
        route.continue();
      }
    });
  }

  /**
   * Browser launch args hazırla (bot tespitini engellemek için)
   */
  private getBrowserLaunchArgs(viewport: { width: number; height: number }): string[] {
    return [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      `--window-size=${viewport.width},${viewport.height}`,
      '--disable-infobars',
      '--disable-notifications',
      '--disable-popup-blocking',
      '--lang=tr-TR',
    ];
  }

  /**
   * Cookie'leri yükle (persistence için)
   */
  private async loadCookies(context: BrowserContext, serviceName?: string): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const cookieFile = path.join(this.cookieStoragePath, `${serviceName || 'default'}-cookies.json`);
      
      if (fs.existsSync(cookieFile)) {
        const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf-8'));
        if (Array.isArray(cookies) && cookies.length > 0) {
          await context.addCookies(cookies);
          this.logger.debug(`Cookie'ler yüklendi: ${cookies.length} adet (${serviceName || 'default'})`);
        }
      }
    } catch (error) {
      this.logger.warn(`Cookie yükleme hatası: ${error.message}`);
    }
  }

  /**
   * Cookie'leri kaydet (persistence için)
   */
  private async saveCookies(context: BrowserContext, serviceName?: string): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const cookieFile = path.join(this.cookieStoragePath, `${serviceName || 'default'}-cookies.json`);
      
      const cookies = await context.cookies();
      if (cookies.length > 0) {
        fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2));
        this.logger.debug(`Cookie'ler kaydedildi: ${cookies.length} adet (${serviceName || 'default'})`);
      }
    } catch (error) {
      this.logger.warn(`Cookie kaydetme hatası: ${error.message}`);
    }
  }

  /**
   * Gerçekçi browser context oluştur
   */
  private async createRealisticContext(
    browser: Browser,
    viewport: { width: number; height: number },
    userAgent: string,
    serviceName?: string
  ): Promise<BrowserContext> {
    const context = await browser.newContext({
      viewport: viewport,
      userAgent: userAgent,
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
      permissions: ['geolocation'],
      geolocation: { latitude: 41.0082, longitude: 28.9784 }, // İstanbul koordinatları
      colorScheme: 'light' as const,
    });

    // Cookie'leri yükle (persistence)
    await this.loadCookies(context, serviceName);

    return context;
  }

  /**
   * Gerçekçi bir browser ve page oluştur (bot tespitinden kaçınmak için)
   * @param serviceName Proxy servis adı (opsiyonel)
   * @returns { browser, context, page }
   */
  async createStealthBrowser(serviceName?: string): Promise<{
    browser: Browser;
    context: BrowserContext;
    page: Page;
  }> {
    // Rastgele viewport ve user agent seç
    const viewport = this.getRandomViewport();
    const userAgent = this.getRandomUserAgent();

    // Browser launch args hazırla
    const launchArgs = this.getBrowserLaunchArgs(viewport);
    
    // Proxy varsa ekle
    this.proxyService.addProxyToLaunchArgs(launchArgs, serviceName);

    // Browser başlat (headless: true - Playwright versiyonu 'new' string'i desteklemiyor)
    // Not: headless: 'new' sadece Playwright 1.39+ versiyonlarında destekleniyor
    // Eğer 'new' modu desteklenmiyorsa, normal headless kullanıyoruz
    const browser = await chromium.launch({
      headless: true, // Boolean olarak kullanıyoruz (Playwright versiyonu uyumluluğu için)
      args: launchArgs,
    });

    // Gerçekçi context oluştur (cookie persistence ile)
    const context = await this.createRealisticContext(browser, viewport, userAgent, serviceName);
    
    // Page oluştur
    const page = await context.newPage();
    
    // Bot tespit script'lerini ekle
    await this.addAntiDetectionScripts(page);
    
    // Network filtreleme
    await this.setupNetworkFiltering(page);
    
    // Gerçekçi header'ları ayarla
    await this.setRealisticHeaders(page);

    // Not: Cookie kaydetme işlemi manuel olarak yapılacak (context kapanmadan önce)
    // Event listener kullanmıyoruz çünkü context kapanırken çalışıyor ve hata veriyor

    return { browser, context, page };
  }

  /**
   * Sayfaya gerçekçi bir şekilde git (referer ile)
   */
  async navigateWithStealth(
    page: Page,
    url: string,
    options?: {
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
      timeout?: number;
    }
  ): Promise<void> {
    await page.goto(url, {
      waitUntil: options?.waitUntil || 'load',
      timeout: options?.timeout || 60000,
      referer: 'https://www.google.com/', // Google'dan geldiğini göster
    });

    // İnsan benzeri rastgele bekleme (1-2 saniye - finans siteleri için)
    await this.humanLikeDelay(1000, 2000);
    
    // İnsan benzeri davranış simülasyonu
    await this.simulateHumanBehavior(page);
  }

  /**
   * Cookie'leri manuel olarak kaydet (context kapanmadan önce)
   * Bu metod context kapanmadan ÖNCE çağrılmalı
   */
  async saveCookiesManually(context: BrowserContext, serviceName?: string): Promise<void> {
    try {
      // Context'in hala açık olduğundan emin ol
      if (!context || context.browser() === null) {
        this.logger.debug(`Context zaten kapanmış, cookie kaydedilemedi (${serviceName || 'default'})`);
        return;
      }

      await this.saveCookies(context, serviceName);
    } catch (error: any) {
      // Hata durumunda sessizce devam et (cookie kaydetme kritik değil)
      this.logger.debug(`Cookie manuel kaydetme hatası: ${error.message}`);
    }
  }

  /**
   * Element'e scroll yap ve bekle (insan benzeri)
   */
  async scrollToElement(page: Page, selector: string): Promise<void> {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.scrollIntoViewIfNeeded();
        await this.humanLikeDelay(300, 800);
      }
    } catch (error) {
      // Hata olursa devam et
    }
  }
}

