import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FavoriteToolsService } from './favorite-tools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorite-tools')
@UseGuards(JwtAuthGuard)
export class FavoriteToolsController {
  constructor(private readonly favoriteToolsService: FavoriteToolsService) {}

  /**
   * Kullanıcının favori araçlarını getir
   */
  @Get()
  async getUserFavorites(@Request() req: any) {
    return this.favoriteToolsService.getUserFavorites(req.user.id);
  }

  /**
   * Aracı favorilere ekle
   */
  @Post(':toolId')
  async addFavorite(@Request() req: any, @Param('toolId') toolId: string) {
    return this.favoriteToolsService.addFavorite(req.user.id, toolId);
  }

  /**
   * Aracı favorilerden kaldır
   */
  @Delete(':toolId')
  async removeFavorite(@Request() req: any, @Param('toolId') toolId: string) {
    return this.favoriteToolsService.removeFavorite(req.user.id, toolId);
  }

  /**
   * Aracın favori olup olmadığını kontrol et
   */
  @Get(':toolId/check')
  async checkFavorite(@Request() req: any, @Param('toolId') toolId: string) {
    const isFavorite = await this.favoriteToolsService.isFavorite(req.user.id, toolId);
    return { isFavorite };
  }
}

