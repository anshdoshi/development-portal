import { create } from 'zustand';
import api from '@/services/api';

interface AppSettings {
  site_name: string;
  allow_registration: boolean;
}

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  fetchPublicSettings: () => Promise<void>;
}

const DEFAULTS: AppSettings = {
  site_name: 'Project Portal',
  allow_registration: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULTS,
  loaded: false,
  fetchPublicSettings: async () => {
    try {
      const res = await api.get('/settings/public');
      const list: { key: string; value: unknown }[] = res.data.settings ?? [];
      const mapped: Partial<AppSettings> = {};
      for (const s of list) {
        if (s.key === 'site_name') mapped.site_name = s.value as string;
        if (s.key === 'allow_registration') mapped.allow_registration = s.value as boolean;
      }
      set({ settings: { ...DEFAULTS, ...mapped }, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));
