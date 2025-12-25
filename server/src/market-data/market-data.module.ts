import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '../cache/cache.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';
import { CoinGeckoProvider } from './providers/coingecko.provider';
import { BinanceProvider } from './providers/binance.provider';
import { TcmbProvider } from './providers/tcmb.provider';
import { HaremAltinProvider } from './providers/haremaltin.provider';
import { BistProvider } from './providers/bist.provider';

@Module({
  imports: [
    HttpModule,
    CacheModule,
    PrismaModule,
    ScheduleModule,
  ],
  controllers: [MarketDataController],
  providers: [
    MarketDataService,
    CoinGeckoProvider,
    BinanceProvider,
    TcmbProvider,
    HaremAltinProvider,
    BistProvider,
  ],
  exports: [MarketDataService],
})
export class MarketDataModule {}

