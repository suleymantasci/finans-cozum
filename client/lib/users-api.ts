import { authApi } from './auth-api';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  items: User[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpdateUserDto {
  isActive?: boolean;
  role?: 'USER' | 'ADMIN';
}

export interface UserStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  change: number;
}

export const usersApi = {
  // Admin: Tüm kullanıcıları listele (pagination ve arama ile)
  getAll: async (search?: string, limit?: number, offset?: number): Promise<UsersListResponse> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return authApi.get<UsersListResponse>(`/users${query ? `?${query}` : ''}`);
  },

  // Admin: Kullanıcı güncelle (pasife alma, rol değiştirme)
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    return authApi.patch<User>(`/users/${id}`, data);
  },

  // Admin: Kullanıcı sil
  delete: async (id: string): Promise<void> => {
    return authApi.delete<void>(`/users/${id}`);
  },

  // Admin: Kullanıcı istatistikleri
  getStats: async (): Promise<UserStats> => {
    return authApi.get<UserStats>('/users/stats');
  },
};

