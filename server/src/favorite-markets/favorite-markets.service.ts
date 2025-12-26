import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteMarketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Kullanıcının favori piyasalarını getir (sadece symbol ve category)
   */
  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favoriteMarket.findMany({
      where: {
        userId,
      },
      select: {
        symbol: true,
        category: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites;
  }

  /**
   * Piyasayı favorilere ekle
   */
  async addFavorite(userId: string, symbol: string, category: string) {
    // Geçerli kategori kontrolü
    const validCategories = ['forex', 'crypto', 'stock', 'commodity'];
    if (!validCategories.includes(category)) {
      throw new NotFoundException('Geçersiz kategori');
    }

    // Zaten favorilerde mi kontrol et
    const existing = await this.prisma.favoriteMarket.findUnique({
      where: {
        userId_symbol_category: {
          userId,
          symbol,
          category,
        },
      },
    });

    if (existing) {
      return existing; // Zaten favorilerde, mevcut kaydı döndür
    }

    // Favorilere ekle
    return this.prisma.favoriteMarket.create({
      data: {
        userId,
        symbol,
        category,
      },
    });
  }

  /**
   * Piyasayı favorilerden kaldır
   */
  async removeFavorite(userId: string, symbol: string, category: string) {
    const favorite = await this.prisma.favoriteMarket.findUnique({
      where: {
        userId_symbol_category: {
          userId,
          symbol,
          category,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favori bulunamadı');
    }

    await this.prisma.favoriteMarket.delete({
      where: {
        userId_symbol_category: {
          userId,
          symbol,
          category,
        },
      },
    });

    return { success: true };
  }

  /**
   * Piyasanın favori olup olmadığını kontrol et
   */
  async isFavorite(userId: string, symbol: string, category: string): Promise<boolean> {
    const favorite = await this.prisma.favoriteMarket.findUnique({
      where: {
        userId_symbol_category: {
          userId,
          symbol,
          category,
        },
      },
    });

    return !!favorite;
  }
}


