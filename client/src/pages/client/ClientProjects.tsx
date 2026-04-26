import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Calendar, FolderKanban, Users } from 'lucide-react';
import { projectService } from '@/services/project.service';
import { useToast } from '@/components/Toast';
import type { Project } from '@/types';

const STATUS_BADGE_CLASSES: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-600',
  on_hold: 'bg-amber-50 text-amber-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ClientProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const limit = 12;

  const handleStatusUpdate = async (projectId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await projectService.updateProject(projectId, { status: newStatus });
      // Refresh the project list
      await fetchProjects();
      // Update the selected project locally
      setSelectedProject((prev) => prev ? { ...prev, status: newStatus as Project['status'] } : null);
      toast('Project status updated successfully.');
    } catch (err) {
      console.error('Failed to update status:', err);
      toast('Failed to update project status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setProjects(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-sm text-gray-500 mt-1">
          View your projects and update their status
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition bg-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-12 text-center">
          <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No projects found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition truncate">
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
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {formatDate(project.start_date)} &mdash; {formatDate(project.end_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-gray-200/60 shadow-sm px-5 py-3">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * limit + 1}&ndash;{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-700 px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Project Details
              </h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Title</label>
                <p className="text-gray-900 font-semibold mt-1">{selectedProject.title}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Update Status</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <select
                    value={selectedProject.status}
                    onChange={(e) => handleStatusUpdate(selectedProject.id, e.target.value)}
                    disabled={updatingStatus}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition bg-white disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {updatingStatus && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</label>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  {selectedProject.description || 'No description provided.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Start Date</label>
                  <p className="text-gray-700 text-sm mt-1">{formatDate(selectedProject.start_date)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">End Date</label>
                  <p className="text-gray-700 text-sm mt-1">{formatDate(selectedProject.end_date)}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Created</label>
                <p className="text-gray-700 text-sm mt-1">{formatDate(selectedProject.created_at)}</p>
              </div>
              {selectedProject.assignments && selectedProject.assignments.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Assigned Team Members
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedProject.assignments.map((a) => (
                      <div key={a.id} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-50 flex items-center justify-center">
                          <Users className="h-3.5 w-3.5 text-indigo-500" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {a.user
                            ? `${a.user.first_name} ${a.user.last_name}`
                            : a.user_id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
