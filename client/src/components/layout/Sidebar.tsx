import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  LayoutDashboard, Users, Building2, FolderKanban,
  BarChart3, Settings, X, UserCircle
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/clients', icon: Building2, label: 'Clients' },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const clientNav = [
  { to: '/client', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/client/projects', icon: FolderKanban, label: 'My Projects' },
  { to: '/client/profile', icon: UserCircle, label: 'Profile' },
];

const userNav = [
  { to: '/user', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/user/profile', icon: UserCircle, label: 'Profile' },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const siteName = useSettingsStore((s) => s.settings.site_name);
  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'client' ? clientNav : userNav;

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Logo — only visible on mobile (desktop shows it in topbar) */}
      {onClose && (
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/60 shrink-0 lg:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <FolderKanban size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900 truncate">{siteName || 'Project Portal'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length <= 2}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
