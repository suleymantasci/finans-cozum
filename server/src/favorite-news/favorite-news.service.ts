import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteNewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Kullanıcının favori haberlerini getir
   */
  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favoriteNews.findMany({
      where: {
        userId,
      },
      include: {
        news: {
          include: {
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((fav) => fav.news);
  }

  /**
   * Haberi favorilere ekle
   */
  async addFavorite(userId: string, newsId: string) {
    // Haber var mı kontrol et
    const news = await this.prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!news) {
      throw new NotFoundException('Haber bulunamadı');
    }

    // Zaten favorilerde mi kontrol et
    const existing = await this.prisma.favoriteNews.findUnique({
      where: {
        userId_newsId: {
          userId,
          newsId,
        },
      },
    });

    if (existing) {
      return existing; // Zaten favorilerde, mevcut kaydı döndür
    }

    // Favorilere ekle
    return this.prisma.favoriteNews.create({
      data: {
        userId,
        newsId,
      },
      include: {
        news: {
          include: {
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Haberi favorilerden kaldır
   */
  async removeFavorite(userId: string, newsId: string) {
    const favorite = await this.prisma.favoriteNews.findUnique({
      where: {
        userId_newsId: {
          userId,
          newsId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favori bulunamadı');
    }

    await this.prisma.favoriteNews.delete({
      where: {
        userId_newsId: {
          userId,
          newsId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Haberin favori olup olmadığını kontrol et
   */
  async isFavorite(userId: string, newsId: string): Promise<boolean> {
    const favorite = await this.prisma.favoriteNews.findUnique({
      where: {
        userId_newsId: {
          userId,
          newsId,
        },
      },
    });

    return !!favorite;
  }
}


