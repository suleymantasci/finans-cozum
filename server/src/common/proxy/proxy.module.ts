import { Module, Global } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Ipv6UtilService } from './ipv6-util.service';
import { ConfigModule } from '@nestjs/config';

@Global() // Global module - tüm modüllerde kullanılabilir
@Module({
  imports: [ConfigModule],
  providers: [ProxyService, Ipv6UtilService],
  exports: [ProxyService, Ipv6UtilService],
})
export class ProxyModule {}

