import api from './api';
import type { DashboardStats } from '@/types';

export const dashboardService = {
  getAdminDashboard: () => api.get<{ data: DashboardStats }>('/dashboard/admin'),
  getClientDashboard: () => api.get<{ data: DashboardStats }>('/dashboard/client'),
  getUserDashboard: () => api.get<{ data: DashboardStats }>('/dashboard/user'),
};
