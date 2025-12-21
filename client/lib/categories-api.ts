import { api } from './api';
import { authApi } from './auth-api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    news: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryListResponse {
  items: Category[];
  total: number;
}

export const categoriesApi = {
  // Public: Tüm aktif kategorileri listele
  getPublic: async (): Promise<Category[]> => {
    return api.get<Category[]>('/categories/public');
  },

  // Public: Tüm aktif kategorileri getir (alternatif)
  getAll: async (includeInactive = false): Promise<Category[]> => {
    const query = includeInactive ? '?includeInactive=true' : '';
    return api.get<Category[]>(`/categories${query}`);
  },

  // Public: Slug ile kategori getir
  getBySlug: async (slug: string): Promise<Category> => {
    return api.get<Category>(`/categories/slug/${slug}`);
  },

  // Public: ID ile kategori getir
  getOne: async (id: string): Promise<Category> => {
    return api.get<Category>(`/categories/${id}`);
  },

  // Admin: Yeni kategori oluştur
  create: async (data: CreateCategoryDto): Promise<Category> => {
    return authApi.post<Category>('/categories', data);
  },

  // Admin: Kategori güncelle
  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    return authApi.patch<Category>(`/categories/${id}`, data);
  },

  // Admin: Kategori sil
  delete: async (id: string): Promise<void> => {
    return authApi.delete(`/categories/${id}`);
  },
};

