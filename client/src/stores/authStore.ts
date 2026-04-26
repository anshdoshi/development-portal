import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  register: async (formData) => {
    const { data } = await authService.register(formData);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const { data } = await authService.getMe();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
