import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdSlotTemplatesService } from './ad-slot-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('ad-slot-templates')
export class AdSlotTemplatesController {
  constructor(private readonly adSlotTemplatesService: AdSlotTemplatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.adSlotTemplatesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.adSlotTemplatesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.adSlotTemplatesService.create(createTemplateDto);
  }

  @Post(':id/apply-to-tools')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async applyToTools(@Param('id') id: string, @Body() body: { toolIds: string[] }) {
    return this.adSlotTemplatesService.applyToTools(id, body.toolIds);
  }

  @Post(':id/remove-from-tools')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeFromTools(@Param('id') id: string, @Body() body: { toolIds: string[] }) {
    return this.adSlotTemplatesService.removeFromTools(id, body.toolIds);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.adSlotTemplatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.adSlotTemplatesService.remove(id);
  }
}

