import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? '';
      // Only force logout for expired/invalid token on protected routes
      // Skip auth endpoints and password change — those handle 401 in their own catch blocks
      const isAuthRoute = url.includes('/auth/');
      const isPasswordChange = url.includes('/profile/password');
      if (!isAuthRoute && !isPasswordChange && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
