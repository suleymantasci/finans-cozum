import { Module } from '@nestjs/common';
import { ToolAdSlotsService } from './tool-ad-slots.service';
import { ToolAdSlotsController } from './tool-ad-slots.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ToolAdSlotsService],
  controllers: [ToolAdSlotsController],
  exports: [ToolAdSlotsService],
})
export class ToolAdSlotsModule {}

