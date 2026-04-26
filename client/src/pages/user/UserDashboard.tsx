import { useEffect, useState } from 'react';
import { FolderKanban, CheckCircle2, Calendar, Inbox } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { useAuthStore } from '@/stores/authStore';
import type { DashboardStats } from '@/types';

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

export default function UserDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    dashboardService
      .getUserDashboard()
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

  const assignedCount = stats.assignedProjects ?? stats.totalProjects ?? 0;
  const completedCount = stats.projectsByStatus?.completed ?? 0;

  const statCards = [
    {
      label: 'Assigned Projects',
      value: assignedCount,
      icon: FolderKanban,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      borderColor: 'border-violet-500',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-500',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
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

      {/* Assigned Projects */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My Assigned Projects
        </h2>
        {stats.recentProjects && stats.recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.recentProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
                      STATUS_BADGE_CLASSES[project.status] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {formatStatus(project.status)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {formatDate(project.start_date)} &mdash; {formatDate(project.end_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No projects assigned yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Projects assigned to you will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
