import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { NewsModule } from './news/news.module';
import { FilesModule } from './files/files.module';
import { CategoriesModule } from './categories/categories.module';
import { ToolCategoriesModule } from './tool-categories/tool-categories.module';
import { ToolsModule } from './tools/tools.module';
import { ToolAdSlotsModule } from './tool-ad-slots/tool-ad-slots.module';
import { AdSlotTemplatesModule } from './ad-slot-templates/ad-slot-templates.module';
import { ToolDataSyncModule } from './tool-data-sync/tool-data-sync.module';
import { NewsAdSlotsModule } from './news-ad-slots/news-ad-slots.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
})
export class AppModule {}
