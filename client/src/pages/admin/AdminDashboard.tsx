import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Building2, FolderKanban, Activity } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { useAuthStore } from '@/stores/authStore';
import type { DashboardStats } from '@/types';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

const STATUS_BADGE_CLASSES: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-600',
  on_hold: 'bg-amber-50 text-amber-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    dashboardService
      .getAdminDashboard()
      .then((res) => setStats(res.data.data))
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

  const pieData = Object.entries(stats.projectsByStatus).map(([name, value]) => ({
    name: formatStatus(name),
    value,
    key: name,
  }));

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers ?? 0,
      icon: Users,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-500',
    },
    {
      label: 'Total Clients',
      value: stats.totalClients ?? 0,
      icon: Building2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-500',
    },
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      borderColor: 'border-violet-500',
    },
    {
      label: 'Activity',
      value: stats.recentActivity?.length ?? 0,
      icon: Activity,
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
          Welcome back, {user?.first_name ?? 'Admin'} &mdash; {today}
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

      {/* Charts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <ul className="space-y-3 max-h-[340px] overflow-y-auto">
              {stats.recentActivity.slice(0, 10).map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-start gap-3 rounded-xl p-3 hover:bg-gray-50 transition"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center mt-0.5 shrink-0">
                    <Activity className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                      {activity.metadata && (activity.metadata as Record<string, string>).title && (
                        <span className="text-gray-500"> &mdash; {(activity.metadata as Record<string, string>).title}</span>
                      )}
                      {activity.metadata && (activity.metadata as Record<string, string>).email && !(activity.metadata as Record<string, string>).title && (
                        <span className="text-gray-500"> &mdash; {(activity.metadata as Record<string, string>).email}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.user
                        ? `${activity.user.first_name} ${activity.user.last_name}`
                        : 'System'}{' '}
                      &middot; {formatDate(activity.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center py-12">No recent activity.</p>
          )}
        </div>
      </div>

      {/* Recent Projects Table */}
      {stats.recentProjects && stats.recentProjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Projects
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 font-medium text-gray-900">
                      {project.title}
                    </td>
                    <td className="py-3 text-gray-500">
                      {project.client
                        ? `${project.client.first_name} ${project.client.last_name}`
                        : '—'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          STATUS_BADGE_CLASSES[project.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {formatStatus(project.status)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-right">
                      {formatDate(project.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
