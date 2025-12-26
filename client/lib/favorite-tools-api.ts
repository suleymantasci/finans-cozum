import { authApi } from './auth-api';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

export interface FavoriteTool {
  id: string;
  toolId: string;
  createdAt: string;
  tool: Tool;
}

export const favoriteToolsApi = {
  /**
   * Kullanıcının favori araçlarını getir
   */
  getFavorites: async (): Promise<FavoriteTool[]> => {
    return authApi.get<FavoriteTool[]>('/favorite-tools');
  },

  /**
   * Aracı favorilere ekle
   */
  addFavorite: async (toolId: string): Promise<FavoriteTool> => {
    return authApi.post<FavoriteTool>(`/favorite-tools/${toolId}`);
  },

  /**
   * Aracı favorilerden kaldır
   */
  removeFavorite: async (toolId: string): Promise<void> => {
    return authApi.delete(`/favorite-tools/${toolId}`);
  },

  /**
   * Aracın favori olup olmadığını kontrol et
   */
  checkFavorite: async (toolId: string): Promise<{ isFavorite: boolean }> => {
    return authApi.get<{ isFavorite: boolean }>(`/favorite-tools/${toolId}/check`);
  },
};

