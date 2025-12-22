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
import { ToolCategoriesService } from './tool-categories.service';
import { CreateToolCategoryDto } from './dto/create-tool-category.dto';
import { UpdateToolCategoryDto } from './dto/update-tool-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('tool-categories')
export class ToolCategoriesController {
  constructor(private readonly toolCategoriesService: ToolCategoriesService) {}

  @Get('public')
  async findActive() {
    return this.toolCategoriesService.findAll(false);
  }

  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.toolCategoriesService.findAll(includeInactive === 'true');
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.toolCategoriesService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.toolCategoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createCategoryDto: CreateToolCategoryDto) {
    return this.toolCategoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateToolCategoryDto) {
    return this.toolCategoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.toolCategoriesService.remove(id);
  }
}

