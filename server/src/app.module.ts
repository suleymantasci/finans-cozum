import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { NewsModule } from './news/news.module';
import { FavoriteNewsModule } from './favorite-news/favorite-news.module';
import { FavoriteMarketsModule } from './favorite-markets/favorite-markets.module';
import { FavoriteToolsModule } from './favorite-tools/favorite-tools.module';
import { FilesModule } from './files/files.module';
import { CategoriesModule } from './categories/categories.module';
import { ToolCategoriesModule } from './tool-categories/tool-categories.module';
import { ToolsModule } from './tools/tools.module';
import { ToolAdSlotsModule } from './tool-ad-slots/tool-ad-slots.module';
import { AdSlotTemplatesModule } from './ad-slot-templates/ad-slot-templates.module';
import { ToolDataSyncModule } from './tool-data-sync/tool-data-sync.module';
import { NewsAdSlotsModule } from './news-ad-slots/news-ad-slots.module';
import { CacheModule } from './cache/cache.module';
import { MarketDataModule } from './market-data/market-data.module';
import { EconomicCalendarModule } from './economic-calendar/economic-calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    AdminModule,
    NewsModule,
    FilesModule,
    CategoriesModule,
    ToolCategoriesModule,
    ToolsModule,
    ToolAdSlotsModule,
    AdSlotTemplatesModule,
    ToolDataSyncModule,
    NewsAdSlotsModule,
    CacheModule,
    MarketDataModule,
    EconomicCalendarModule,
    FavoriteNewsModule,
    FavoriteMarketsModule,
    FavoriteToolsModule,
  ],
})
export class AppModule {}
