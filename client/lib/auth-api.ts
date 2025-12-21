import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role: 'USER' | 'ADMIN';
  };
}

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

export const authApi = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    api.get<T>(endpoint, options),

  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    api.post<T>(endpoint, data, options),

  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    api.put<T>(endpoint, data, options),

  patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    api.patch<T>(endpoint, data, options),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    api.delete<T>(endpoint, options),

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', data);
  },

  getMe: async (): Promise<User> => {
    return api.get<User>('/users/me');
  },
};

