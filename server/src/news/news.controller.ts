import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { NewsStatus } from '../common/enums/news-status.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Public: Yayınlanmış haberleri listele
  @Get('published')
  async findPublished(
      @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.newsService.findPublished(
      categoryId,
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined,
    );
  }

  // Public: Tek bir haber detayı (slug veya id ile)
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const news = await this.newsService.findOne(slug);
    
    // Görüntülenme sayısını artır (async, await etmeden)
    this.newsService.incrementViews(news.id).catch(() => {
      // Hata olsa bile devam et
    });
    
    return news;
  }

  // Admin: Tüm haberleri listele (filtreleme ile)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(
      @Query('categoryId') categoryId?: string,
    @Query('status') status?: NewsStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
        return this.newsService.findAll(
          categoryId,
          status,
          limit ? parseInt(limit) : undefined,
          offset ? parseInt(offset) : undefined,
        );
  }

  // Admin: İstatistikler
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    return this.newsService.getStats();
  }

  // Admin: Yeni haber oluştur
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: any, @Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(user.id, createNewsDto);
  }

  // Admin: Haber güncelle
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    return this.newsService.update(id, user.id, updateNewsDto);
  }

  // Admin: Haber sil
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.newsService.remove(id, user.id);
  }
}

