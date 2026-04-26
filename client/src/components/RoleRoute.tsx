import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface RoleRouteProps {
  roles: string[];
}

export default function RoleRoute({ roles }: RoleRouteProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const path = user?.role === 'admin' ? '/admin' : user?.role === 'client' ? '/client' : '/user';
    return <Navigate to={path} replace />;
  }

  return <Outlet />;
}
