import api from './api';
import type { User } from '@/types';

export const profileService = {
  getProfile: () => api.get<{ profile: User }>('/profile'),
  updateProfile: (data: { phone?: string; company?: string; jobTitle?: string; address?: string; bio?: string }) =>
    api.put('/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/profile/password', data),
};
