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
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  // Public: Tüm yayınlanmış araçları listele
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.toolsService.findAll(status, categoryId, includeInactive === 'true');
  }

  // Public: Slug ile araç getir
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.toolsService.findBySlug(slug);
  }

  // Public: Araç verisi getir (DATABASE/EXTERNAL_API tipi için)
  @Get(':id/data')
  async getToolData(@Param('id') id: string) {
    const data = await this.toolsService.getToolData(id);
    return { data };
  }

  // Public: ID ile araç getir
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.toolsService.findOne(id);
  }

  // Admin: Yeni araç oluştur
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createToolDto: CreateToolDto) {
    return this.toolsService.create(createToolDto);
  }

  // Admin: Araç güncelle
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return this.toolsService.update(id, updateToolDto);
  }

  // Admin: Araç sil
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.toolsService.remove(id);
  }
}

