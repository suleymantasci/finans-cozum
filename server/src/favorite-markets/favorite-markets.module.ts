import { Module } from '@nestjs/common';
import { FavoriteMarketsService } from './favorite-markets.service';
import { FavoriteMarketsController } from './favorite-markets.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FavoriteMarketsController],
  providers: [FavoriteMarketsService],
  exports: [FavoriteMarketsService],
})
export class FavoriteMarketsModule {}


