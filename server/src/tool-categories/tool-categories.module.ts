import { Module } from '@nestjs/common';
import { ToolCategoriesService } from './tool-categories.service';
import { ToolCategoriesController } from './tool-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ToolCategoriesService],
  controllers: [ToolCategoriesController],
  exports: [ToolCategoriesService],
})
export class ToolCategoriesModule {}


