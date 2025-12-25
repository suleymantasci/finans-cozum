import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FavoriteNewsService } from './favorite-news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorite-news')
@UseGuards(JwtAuthGuard)
export class FavoriteNewsController {
  constructor(private readonly favoriteNewsService: FavoriteNewsService) {}

  /**
   * Haberin favori olup olmadığını kontrol et
   * Bu route @Get()'den önce olmalı, aksi halde :newsId parametresi "check" olarak algılanır
   */
  @Get(':newsId/check')
  async checkFavorite(@Request() req: any, @Param('newsId') newsId: string) {
    const isFavorite = await this.favoriteNewsService.isFavorite(req.user.id, newsId);
    return { isFavorite };
  }

  /**
   * Kullanıcının favori haberlerini getir
   */
  @Get()
  async getUserFavorites(@Request() req: any) {
    return this.favoriteNewsService.getUserFavorites(req.user.id);
  }

  /**
   * Haberi favorilere ekle
   */
  @Post(':newsId')
  async addFavorite(@Request() req: any, @Param('newsId') newsId: string) {
    return this.favoriteNewsService.addFavorite(req.user.id, newsId);
  }

  /**
   * Haberi favorilerden kaldır
   */
  @Delete(':newsId')
  async removeFavorite(@Request() req: any, @Param('newsId') newsId: string) {
    return this.favoriteNewsService.removeFavorite(req.user.id, newsId);
  }
}

