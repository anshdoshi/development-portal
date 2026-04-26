import api from './api';
import type { Setting } from '@/types';

export const settingsService = {
  getSettings: () => api.get<{ settings: Setting[] }>('/settings'),
  getPublicSettings: () => api.get<{ settings: Setting[] }>('/settings/public'),
  updateSettings: (settings: { key: string; value: unknown }[]) =>
    api.put('/settings', { settings }),
};
