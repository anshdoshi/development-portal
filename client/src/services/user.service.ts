import api from './api';
import type { User, PaginatedResponse } from '@/types';

export const userService = {
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string; isActive?: string }) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  getUserById: (id: string) => api.get<{ data: User }>(`/users/${id}`),
  createUser: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) =>
    api.post<{ data: User }>('/users', data),
  updateUser: (id: string, data: Partial<{ email: string; firstName: string; lastName: string; role: string; isActive: boolean }>) =>
    api.put<{ data: User }>(`/users/${id}`, data),
  deactivateUser: (id: string) => api.patch(`/users/${id}/deactivate`),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};
