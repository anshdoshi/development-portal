import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ToastProvider } from '@/components/Toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import ClientManagement from '@/pages/admin/ClientManagement';
import ProjectsPage from '@/pages/admin/ProjectsPage';
import ReportsPage from '@/pages/admin/ReportsPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import ClientDashboard from '@/pages/client/ClientDashboard';
import ClientProjects from '@/pages/client/ClientProjects';
import UserDashboard from '@/pages/user/UserDashboard';
import ProfilePage from '@/pages/ProfilePage';
import AppLayout from '@/components/layout/AppLayout';

function AppRoutes() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Redirect from root to appropriate dashboard
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'client': return '/client';
      case 'user': return '/user';
      default: return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={getDefaultRoute()} />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to={getDefaultRoute()} replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Admin routes */}
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/clients" element={<ClientManagement />} />
            <Route path="/admin/projects" element={<ProjectsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* Client routes */}
          <Route element={<RoleRoute roles={['client']} />}>
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/projects" element={<ClientProjects />} />
            <Route path="/client/profile" element={<ProfilePage />} />
          </Route>

          {/* User routes */}
          <Route element={<RoleRoute roles={['user']} />}>
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user/profile" element={<ProfilePage />} />
          </Route>

          {/* Shared routes */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
}

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const fetchPublicSettings = useSettingsStore((s) => s.fetchPublicSettings);
  const siteName = useSettingsStore((s) => s.settings.site_name);

  useEffect(() => {
    checkAuth();
    fetchPublicSettings();
  }, [checkAuth, fetchPublicSettings]);

  // Update browser tab title when site name changes
  useEffect(() => {
    document.title = siteName || 'Project Portal';
  }, [siteName]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
