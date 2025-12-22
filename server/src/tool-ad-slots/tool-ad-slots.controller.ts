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
import { ToolAdSlotsService } from './tool-ad-slots.service';
import { CreateAdSlotDto } from './dto/create-ad-slot.dto';
import { UpdateAdSlotDto } from './dto/update-ad-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('tool-ad-slots')
export class ToolAdSlotsController {
  constructor(private readonly toolAdSlotsService: ToolAdSlotsService) {}

  // Public: Aktif reklam alanlarını getir
  @Get('active')
  async findActive(@Query('toolId') toolId?: string) {
    return this.toolAdSlotsService.findActive(toolId);
  }

  // Public: Tüm reklam alanlarını getir
  @Get()
  async findAll(@Query('toolId') toolId?: string) {
    return this.toolAdSlotsService.findAll(toolId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.toolAdSlotsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createAdSlotDto: CreateAdSlotDto) {
    return this.toolAdSlotsService.create(createAdSlotDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async bulkCreate(@Body() body: { toolIds: string[]; templateId: string }) {
    return this.toolAdSlotsService.bulkCreate(body.toolIds, body.templateId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateAdSlotDto: UpdateAdSlotDto) {
    return this.toolAdSlotsService.update(id, updateAdSlotDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.toolAdSlotsService.remove(id);
  }
}

