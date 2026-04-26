import api from './api';
import type { User } from '../types';

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', data),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<{ user: User; token: string }>('/auth/register', data),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};
