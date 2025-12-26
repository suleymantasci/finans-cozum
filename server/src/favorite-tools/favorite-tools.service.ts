import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteToolsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Kullanıcının favori araçlarını getir
   */
  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favoriteTool.findMany({
      where: {
        userId,
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((fav) => ({
      id: fav.id,
      toolId: fav.toolId,
      createdAt: fav.createdAt,
      tool: fav.tool,
    }));
  }

  /**
   * Aracı favorilere ekle
   */
  async addFavorite(userId: string, toolId: string) {
    // Tool'un var olup olmadığını kontrol et
    const tool = await this.prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      throw new NotFoundException('Araç bulunamadı');
    }

    // Zaten favorilerde mi kontrol et
    const existing = await this.prisma.favoriteTool.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
    });

    if (existing) {
      return existing; // Zaten favorilerde, mevcut kaydı döndür
    }

    // Favorilere ekle
    return this.prisma.favoriteTool.create({
      data: {
        userId,
        toolId,
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  /**
   * Aracı favorilerden kaldır
   */
  async removeFavorite(userId: string, toolId: string) {
    const favorite = await this.prisma.favoriteTool.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favori bulunamadı');
    }

    await this.prisma.favoriteTool.delete({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Aracın favori olup olmadığını kontrol et
   */
  async isFavorite(userId: string, toolId: string): Promise<boolean> {
    const favorite = await this.prisma.favoriteTool.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
    });

    return !!favorite;
  }
}

