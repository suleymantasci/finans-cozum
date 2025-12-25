import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NewsAdSlotsService } from './news-ad-slots.service';
import { CreateNewsAdSlotDto } from './dto/create-news-ad-slot.dto';
import { UpdateNewsAdSlotDto } from './dto/update-news-ad-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('news-ad-slots')
export class NewsAdSlotsController {
  constructor(private readonly newsAdSlotsService: NewsAdSlotsService) {}

  // Public: Aktif reklam alanlarını getir
  @Get('active')
  async findActive() {
    return this.newsAdSlotsService.findActive();
  }

  // Admin: Tüm reklam alanlarını getir
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.newsAdSlotsService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.newsAdSlotsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createDto: CreateNewsAdSlotDto) {
    return this.newsAdSlotsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateNewsAdSlotDto) {
    return this.newsAdSlotsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.newsAdSlotsService.remove(id);
  }
}


