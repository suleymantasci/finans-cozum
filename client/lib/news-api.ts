import { api } from './api';
import { authApi } from './auth-api';

export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  categoryId: string;
  category: Category;
  status: NewsStatus;
  featuredImage?: string;
  author: {
    id: string;
    name?: string;
    email: string;
  };
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  views: number;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsDto {
  title: string;
  excerpt?: string;
  content: string;
  categoryId: string;
  status?: NewsStatus;
  featuredImage?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  scheduledAt?: string;
}

export interface UpdateNewsDto extends Partial<CreateNewsDto> {}

export interface NewsListResponse {
  items: News[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface NewsStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  thisMonth: number;
}

export const newsApi = {
  // Public: Tüm yayınlanmış haberleri getir
  getPublished: async (categoryId?: string, limit?: number, offset?: number): Promise<NewsListResponse> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return api.get<NewsListResponse>(`/news/published${query ? `?${query}` : ''}`);
  },

  // Public: Tek bir haber detayı (slug veya id ile)
  getOne: async (slugOrId: string): Promise<News> => {
    return api.get<News>(`/news/${slugOrId}`);
  },

  // Admin: Tüm haberleri listele
  getAll: async (categoryId?: string, status?: NewsStatus, limit?: number, offset?: number): Promise<NewsListResponse> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return authApi.get<NewsListResponse>(`/news${query ? `?${query}` : ''}`);
  },

  // Admin: İstatistikler
  getStats: async (): Promise<NewsStats> => {
    return authApi.get<NewsStats>('/news/admin/stats');
  },

  // Admin: Yeni haber oluştur
  create: async (data: CreateNewsDto): Promise<News> => {
    return authApi.post<News>('/news', data);
  },

  // Admin: Haber güncelle
  update: async (id: string, data: UpdateNewsDto): Promise<News> => {
    return authApi.patch<News>(`/news/${id}`, data);
  },

  // Admin: Haber sil
  delete: async (id: string): Promise<void> => {
    return authApi.delete(`/news/${id}`);
  },

  // Admin: Görsel yükle
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return authApi.post<{ url: string }>('/files/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Admin: Video yükle
  uploadVideo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return authApi.post<{ url: string }>('/files/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
