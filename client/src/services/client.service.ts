import api from './api';
import type { User, PaginatedResponse } from '@/types';

export const clientService = {
  getClients: (params?: { page?: number; limit?: number; search?: string; isActive?: string }) =>
    api.get<PaginatedResponse<User>>('/clients', { params }),
  getClientById: (id: string) => api.get<{ data: User }>(`/clients/${id}`),
  createClient: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<{ data: User }>('/clients', data),
  updateClient: (id: string, data: Partial<{ email: string; firstName: string; lastName: string; isActive: boolean }>) =>
    api.put<{ data: User }>(`/clients/${id}`, data),
  deactivateClient: (id: string) => api.patch(`/clients/${id}/deactivate`),
  deleteClient: (id: string) => api.delete(`/clients/${id}`),
};
