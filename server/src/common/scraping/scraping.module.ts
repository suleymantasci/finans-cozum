import { Module, Global } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { ProxyModule } from '../proxy/proxy.module';

@Global() // Global module - tüm modüllerde kullanılabilir
@Module({
  imports: [ProxyModule],
  providers: [ScrapingService],
  exports: [ScrapingService],
})
export class ScrapingModule {}

