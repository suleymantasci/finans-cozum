import { authApi } from './auth-api';

export interface FavoriteMarket {
  symbol: string;
  category: 'forex' | 'crypto' | 'stock' | 'commodity';
  createdAt: string;
}

export const favoriteMarketsApi = {
  /**
   * Kullanıcının favori piyasalarını getir
   */
  getFavorites: async (): Promise<FavoriteMarket[]> => {
    return authApi.get<FavoriteMarket[]>('/favorite-markets');
  },

  /**
   * Piyasayı favorilere ekle
   */
  addFavorite: async (symbol: string, category: 'forex' | 'crypto' | 'stock' | 'commodity'): Promise<FavoriteMarket> => {
    return authApi.post<FavoriteMarket>('/favorite-markets', { symbol, category });
  },

  /**
   * Piyasayı favorilerden kaldır
   */
  removeFavorite: async (symbol: string, category: 'forex' | 'crypto' | 'stock' | 'commodity'): Promise<void> => {
    // URL encoding için symbol'i encode et
    const encodedSymbol = encodeURIComponent(symbol);
    return authApi.delete(`/favorite-markets/${encodedSymbol}/${category}`);
  },

  /**
   * Piyasanın favori olup olmadığını kontrol et
   */
  checkFavorite: async (
    symbol: string,
    category: 'forex' | 'crypto' | 'stock' | 'commodity',
  ): Promise<{ isFavorite: boolean }> => {
    const encodedSymbol = encodeURIComponent(symbol);
    return authApi.get<{ isFavorite: boolean }>(`/favorite-markets/${encodedSymbol}/${category}/check`);
  },
};


