import { Module } from '@nestjs/common';
import { AdSlotTemplatesService } from './ad-slot-templates.service';
import { AdSlotTemplatesController } from './ad-slot-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [AdSlotTemplatesService],
  controllers: [AdSlotTemplatesController],
  exports: [AdSlotTemplatesService],
})
export class AdSlotTemplatesModule {}

