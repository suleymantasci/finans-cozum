import { Module } from '@nestjs/common';
import { FavoriteToolsService } from './favorite-tools.service';
import { FavoriteToolsController } from './favorite-tools.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FavoriteToolsController],
  providers: [FavoriteToolsService],
  exports: [FavoriteToolsService],
})
export class FavoriteToolsModule {}

