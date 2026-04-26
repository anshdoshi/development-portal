import api from './api';
import type { Project, PaginatedResponse } from '@/types';

export const projectService = {
  getProjects: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<PaginatedResponse<Project>>('/projects', { params }),
  getProjectById: (id: string) => api.get<{ data: Project }>(`/projects/${id}`),
  createProject: (data: { title: string; description?: string; status?: string; clientId?: string; startDate?: string; endDate?: string }) =>
    api.post<{ data: Project }>('/projects', data),
  updateProject: (id: string, data: Partial<{ title: string; description: string; status: string; clientId: string; startDate: string; endDate: string }>) =>
    api.put<{ data: Project }>(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  assignUser: (projectId: string, userId: string) =>
    api.post(`/projects/${projectId}/assign`, { userId }),
  unassignUser: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/assign/${userId}`),
};
