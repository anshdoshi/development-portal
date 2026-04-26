import api from './api';
import type { Notification, PaginatedResponse } from '@/types';

export const notificationService = {
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Notification>>('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
};
