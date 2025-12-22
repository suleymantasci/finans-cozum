import { authApi } from './auth-api';
import { api } from './api';

export enum NewsAdSlotPosition {
  TOP = 'TOP',
  BETWEEN_NEWS = 'BETWEEN_NEWS',
  SIDEBAR_LEFT = 'SIDEBAR_LEFT',
  SIDEBAR_RIGHT = 'SIDEBAR_RIGHT',
  AFTER_IMAGE = 'AFTER_IMAGE',
  IN_CONTENT = 'IN_CONTENT',
  BOTTOM = 'BOTTOM',
}

export interface NewsAdSlot {
  id: string;
  position: NewsAdSlotPosition;
  isActive: boolean;
  order: number;
  content?: string;
  scriptUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsAdSlotDto {
  position: NewsAdSlotPosition;
  isActive?: boolean;
  order?: number;
  content?: string;
  scriptUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  showOnMobile?: boolean;
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateNewsAdSlotDto extends Partial<CreateNewsAdSlotDto> {}

export const newsAdsApi = {
  // Public: Aktif reklam alanlarını getir
  getActive: async (): Promise<NewsAdSlot[]> => {
    return api.get<NewsAdSlot[]>('/news-ad-slots/active');
  },

  // Admin: Tüm reklam alanlarını getir
  getAll: async (includeInactive = false): Promise<NewsAdSlot[]> => {
    const query = includeInactive ? '?includeInactive=true' : '';
    return authApi.get<NewsAdSlot[]>(`/news-ad-slots${query}`);
  },

  // Admin: Tek bir reklam alanını getir
  getOne: async (id: string): Promise<NewsAdSlot> => {
    return authApi.get<NewsAdSlot>(`/news-ad-slots/${id}`);
  },

  // Admin: Yeni reklam alanı oluştur
  create: async (data: CreateNewsAdSlotDto): Promise<NewsAdSlot> => {
    return authApi.post<NewsAdSlot>('/news-ad-slots', data);
  },

  // Admin: Reklam alanını güncelle
  update: async (id: string, data: UpdateNewsAdSlotDto): Promise<NewsAdSlot> => {
    return authApi.patch<NewsAdSlot>(`/news-ad-slots/${id}`, data);
  },

  // Admin: Reklam alanını sil
  delete: async (id: string): Promise<void> => {
    return authApi.delete(`/news-ad-slots/${id}`);
  },
};

