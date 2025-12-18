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

