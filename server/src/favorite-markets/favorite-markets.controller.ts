import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { FavoriteMarketsService } from './favorite-markets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorite-markets')
@UseGuards(JwtAuthGuard)
export class FavoriteMarketsController {
  constructor(private readonly favoriteMarketsService: FavoriteMarketsService) {}

  /**
   * Kullanıcının favori piyasalarını getir
   */
  @Get()
  async getUserFavorites(@Request() req: any) {
    return this.favoriteMarketsService.getUserFavorites(req.user.id);
  }

  /**
   * Piyasayı favorilere ekle
   */
  @Post()
  async addFavorite(@Request() req: any, @Body() body: { symbol: string; category: string }) {
    return this.favoriteMarketsService.addFavorite(req.user.id, body.symbol, body.category);
  }

  /**
   * Piyasayı favorilerden kaldır
   */
  @Delete(':symbol/:category')
  async removeFavorite(
    @Request() req: any,
    @Param('symbol') symbol: string,
    @Param('category') category: string,
  ) {
    return this.favoriteMarketsService.removeFavorite(req.user.id, symbol, category);
  }

  /**
   * Piyasanın favori olup olmadığını kontrol et
   * Bu route @Get()'den önce olmalı
   */
  @Get(':symbol/:category/check')
  async checkFavorite(
    @Request() req: any,
    @Param('symbol') symbol: string,
    @Param('category') category: string,
  ) {
    const isFavorite = await this.favoriteMarketsService.isFavorite(req.user.id, symbol, category);
    return { isFavorite };
  }
}


