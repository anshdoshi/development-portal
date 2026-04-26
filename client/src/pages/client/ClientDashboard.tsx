import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FolderKanban, CheckCircle2, Clock, Calendar, Bell } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { notificationService } from '@/services/notification.service';
import { useAuthStore } from '@/stores/authStore';
import type { DashboardStats, Notification } from '@/types';

const PIE_COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const STATUS_BADGE_CLASSES: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-600',
  on_hold: 'bg-amber-50 text-amber-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(d: string | null) {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    Promise.all([
      dashboardService.getClientDashboard(),
      notificationService.getNotifications({ limit: 5 }),
    ])
      .then(([dashRes, notifRes]) => {
        setStats(dashRes.data.data);
        setNotifications(notifRes.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-12">
        Failed to load dashboard data.
      </div>
    );
  }

  const projectsByStatus = stats.projectsByStatus ?? {};
  const totalProjects = stats.totalProjects ?? 0;
  const completedProjects = projectsByStatus.completed ?? 0;
  const inProgressProjects = projectsByStatus.in_progress ?? 0;

  const pieData = Object.entries(projectsByStatus).map(([name, value]) => ({
    name: formatStatus(name),
    value,
    key: name,
  }));

  const unreadNotifs = stats.unreadNotifications ?? 0;

  const statCards = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: FolderKanban,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      borderColor: 'border-violet-500',
    },
    {
      label: 'Completed',
      value: completedProjects,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-500',
    },
    {
      label: 'In Progress',
      value: inProgressProjects,
      icon: Clock,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-500',
    },
    {
      label: 'Notifications',
      value: unreadNotifs,
      icon: Bell,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-500',
    },
  ];

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome, {user?.first_name ?? 'there'}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 flex items-center gap-4 relative overflow-hidden"
          >
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center ${card.iconBg}`}
            >
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 ${card.borderColor} opacity-40`}
            />
          </div>
        ))}
      </div>

      {/* Pie Chart + Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Projects by Status
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No project data yet.</p>
          )}
          {/* Legend */}
          {pieData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {pieData.map((entry, index) => (
                <div key={entry.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full inline-block"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Projects
          </h2>
          {stats.recentProjects && stats.recentProjects.length > 0 ? (
            <div className="space-y-3 max-h-[360px] overflow-y-auto">
              {stats.recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {project.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDate(project.start_date)} &mdash; {formatDate(project.end_date)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        STATUS_BADGE_CLASSES[project.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {formatStatus(project.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">No projects yet.</p>
          )}
        </div>
      </div>
      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          {unreadNotifs > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              {unreadNotifs} unread
            </span>
          )}
        </div>
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-xl border p-4 transition ${
                  notif.is_read ? 'border-gray-100 bg-white' : 'border-indigo-100 bg-indigo-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(notif.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8 text-sm">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
