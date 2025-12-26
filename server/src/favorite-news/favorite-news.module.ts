import { Module } from '@nestjs/common';
import { FavoriteNewsService } from './favorite-news.service';
import { FavoriteNewsController } from './favorite-news.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FavoriteNewsController],
  providers: [FavoriteNewsService],
  exports: [FavoriteNewsService],
})
export class FavoriteNewsModule {}


