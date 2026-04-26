import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, X, AlertTriangle, Loader2 } from 'lucide-react';
import { projectService } from '@/services/project.service';
import { clientService } from '@/services/client.service';
import { useToast } from '@/components/Toast';
import type { Project, User } from '@/types';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const STATUS_BADGE: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-600',
  on_hold: 'bg-amber-50 text-amber-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

const PAGE_LIMIT = 10;

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm transition-all focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10';
const selectClass = `${inputClass} appearance-none`;

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await projectService.getProjects({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setProjects(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await clientService.getClients({ limit: 200 });
      setClients(res.data.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const startItem = (page - 1) * PAGE_LIMIT + 1;
  const endItem = Math.min(page * PAGE_LIMIT, total);

  const openCreate = () => {
    setEditingProject(null);
    reset({ title: '', description: '', status: 'not_started', clientId: '', startDate: '', endDate: '' });
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      title: project.title,
      description: project.description ?? '',
      status: project.status,
      clientId: project.client_id ?? '',
      startDate: project.start_date ?? '',
      endDate: project.end_date ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const payload = {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        clientId: data.clientId || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      };

      if (editingProject) {
        await projectService.updateProject(editingProject.id, payload);
        toast('Project has been updated.');
      } else {
        await projectService.createProject(payload);
        toast('Project has been created successfully.');
      }
      closeModal();
      fetchProjects();
    } catch {
      const errorMessage = editingProject ? 'Failed to update project.' : 'Failed to create project.';
      toast(errorMessage, 'error');
      setError(errorMessage);
    }
  };

  const confirmDelete = (project: Project) => {
    setDeletingProject(project);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    try {
      await projectService.deleteProject(deletingProject.id);
      setShowDeleteDialog(false);
      setDeletingProject(null);
      fetchProjects();
      toast('Project has been deleted.');
    } catch {
      toast('Failed to delete project.', 'error');
      setError('Failed to delete project.');
    }
  };

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : '-';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all projects</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={`${selectClass} w-auto min-w-[160px]`}
          >
            <option value="">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="h-10 w-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No projects found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{project.title}</p>
                          {project.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-500">
                        {project.client
                          ? `${project.client.first_name} ${project.client.last_name}`
                          : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[project.status] ?? ''}`}>
                          {formatStatus(project.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-500">
                        {formatDate(project.start_date)} &ndash; {formatDate(project.end_date)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => openEdit(project)}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(project)}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{total}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input {...register('title')} className={inputClass} />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status <span className="text-red-500">*</span></label>
                <select {...register('status')} className={selectClass}>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client</label>
                <select {...register('clientId')} className={selectClass}>
                  <option value="">No client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input type="date" {...register('startDate')} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                  <input type="date" {...register('endDate')} className={inputClass} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-sm px-4 py-2.5 text-sm font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {showDeleteDialog && deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteDialog(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Project</h2>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">{deletingProject.title}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
