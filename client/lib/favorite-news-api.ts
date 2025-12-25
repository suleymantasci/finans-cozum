import { authApi } from './auth-api';
import { News } from './news-api';

export interface FavoriteNewsResponse {
  items: News[];
}

export const favoriteNewsApi = {
  /**
   * Kullanıcının favori haberlerini getir
   */
  getFavorites: async (): Promise<News[]> => {
    return authApi.get<News[]>('/favorite-news');
  },

  /**
   * Haberi favorilere ekle
   */
  addFavorite: async (newsId: string): Promise<News> => {
    return authApi.post<News>(`/favorite-news/${newsId}`);
  },

  /**
   * Haberi favorilerden kaldır
   */
  removeFavorite: async (newsId: string): Promise<void> => {
    return authApi.delete(`/favorite-news/${newsId}`);
  },

  /**
   * Haberin favori olup olmadığını kontrol et
   */
  checkFavorite: async (newsId: string): Promise<{ isFavorite: boolean }> => {
    return authApi.get<{ isFavorite: boolean }>(`/favorite-news/${newsId}/check`);
  },
};

