import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, X, AlertTriangle, Loader2, Ban, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { clientService } from '@/services/client.service';
import { useToast } from '@/components/Toast';
import type { User } from '@/types';

const createSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const editSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

const STATUS_BADGE = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
};

const PAGE_LIMIT = 10;

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm transition-all focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10';

export default function ClientManagement() {
  const { toast } = useToast();
  const [clients, setClients] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<User | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingClient, setDeletingClient] = useState<User | null>(null);
  const [deleteAction, setDeleteAction] = useState<'activate' | 'deactivate' | 'delete'>('deactivate');

  const createForm = useForm<CreateFormData>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditFormData>({ resolver: zodResolver(editSchema) });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clientService.getClients({ page, limit: PAGE_LIMIT, search: search || undefined });
      setClients(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load clients.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const openCreate = () => {
    setEditingClient(null);
    setShowPassword(false);
    createForm.reset({ firstName: '', lastName: '', email: '', password: '' });
    setShowModal(true);
  };

  const openEdit = (client: User) => {
    setEditingClient(client);
    editForm.reset({ firstName: client.first_name, lastName: client.last_name, email: client.email });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingClient(null); };

  const onCreateSubmit = async (data: CreateFormData) => {
    try {
      await clientService.createClient({ email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName });
      closeModal();
      fetchClients();
      toast('Client account has been created.');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Operation failed. Please try again.', 'error');
      setError(err.response?.data?.message || 'Failed to create client.');
    }
  };

  const onEditSubmit = async (data: EditFormData) => {
    if (!editingClient) return;
    try {
      await clientService.updateClient(editingClient.id, { firstName: data.firstName, lastName: data.lastName, email: data.email });
      closeModal();
      fetchClients();
      toast('Client details have been updated.');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Operation failed. Please try again.', 'error');
      setError(err.response?.data?.message || 'Failed to update client.');
    }
  };

  const confirmActivate = (client: User) => { setDeletingClient(client); setDeleteAction('activate'); setShowDeleteDialog(true); };
  const confirmDeactivate = (client: User) => { setDeletingClient(client); setDeleteAction('deactivate'); setShowDeleteDialog(true); };
  const confirmDelete = (client: User) => { setDeletingClient(client); setDeleteAction('delete'); setShowDeleteDialog(true); };

  const handleDeleteAction = async () => {
    if (!deletingClient) return;
    try {
      if (deleteAction === 'delete') {
        await clientService.deleteClient(deletingClient.id);
        toast('Client has been permanently deleted.');
      } else if (deleteAction === 'deactivate') {
        await clientService.deactivateClient(deletingClient.id);
        toast('Client has been deactivated.');
      } else {
        await clientService.updateClient(deletingClient.id, { isActive: true });
        toast(`${deletingClient.first_name} ${deletingClient.last_name} has been activated.`);
      }
      setShowDeleteDialog(false);
      setDeletingClient(null);
      fetchClients();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast(msg, 'error');
    }
  };

  const getInitials = (u: User) => `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase();
  const getFullName = (u: User) => `${u.first_name} ${u.last_name}`;

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage client accounts</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 transition-all">
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200/60 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search clients..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`${inputClass} pl-10`} />
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {/* Table */}
      <div className="rounded-xl border border-gray-200/60 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="h-10 w-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No clients found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                            {getInitials(client)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getFullName(client)}</p>
                            <p className="text-xs text-gray-500">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${client.is_active ? STATUS_BADGE.active : STATUS_BADGE.inactive}`}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-500">
                        {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => openEdit(client)} className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {client.is_active ? (
                            <button onClick={() => confirmDeactivate(client)} className="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Deactivate">
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button onClick={() => confirmActivate(client)} className="rounded-lg p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Activate">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => confirmDelete(client)} className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete permanently">
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
                Showing <span className="font-medium">{(page - 1) * PAGE_LIMIT + 1}</span> to <span className="font-medium">{Math.min(page * PAGE_LIMIT, total)}</span> of <span className="font-medium">{total}</span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition">
                  Next <ChevronRight className="h-4 w-4" />
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
              <h2 className="text-lg font-semibold text-gray-900">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={closeModal} className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {editingClient ? (
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                    <input {...editForm.register('firstName')} className={inputClass} />
                    {editForm.formState.errors.firstName && <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                    <input {...editForm.register('lastName')} className={inputClass} />
                    {editForm.formState.errors.lastName && <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" {...editForm.register('email')} className={inputClass} />
                  {editForm.formState.errors.email && <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.email.message}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={closeModal} className="border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" disabled={editForm.formState.isSubmitting} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-sm px-4 py-2.5 text-sm font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all">
                    {editForm.formState.isSubmitting ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                    <input {...createForm.register('firstName')} className={inputClass} />
                    {createForm.formState.errors.firstName && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                    <input {...createForm.register('lastName')} className={inputClass} />
                    {createForm.formState.errors.lastName && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" {...createForm.register('email')} className={inputClass} />
                  {createForm.formState.errors.email && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} {...createForm.register('password')} className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {createForm.formState.errors.password && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.password.message}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={closeModal} className="border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" disabled={createForm.formState.isSubmitting} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-sm px-4 py-2.5 text-sm font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all">
                    {createForm.formState.isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete / Deactivate Dialog */}
      {showDeleteDialog && deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteDialog(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                deleteAction === 'delete' ? 'bg-red-100' : deleteAction === 'deactivate' ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                {deleteAction === 'delete'
                  ? <AlertTriangle className="h-5 w-5 text-red-600" />
                  : deleteAction === 'deactivate'
                  ? <Ban className="h-5 w-5 text-amber-600" />
                  : <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                }
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {deleteAction === 'delete' ? 'Delete Client' : deleteAction === 'deactivate' ? 'Deactivate Client' : 'Activate Client'}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              {deleteAction === 'delete' ? (
                <>Are you sure you want to permanently delete <span className="font-medium text-gray-900">{getFullName(deletingClient)}</span>? This will remove all their data and cannot be undone.</>
              ) : deleteAction === 'deactivate' ? (
                <>Are you sure you want to deactivate <span className="font-medium text-gray-900">{getFullName(deletingClient)}</span>? They will no longer be able to log in.</>
              ) : (
                <>Are you sure you want to activate <span className="font-medium text-gray-900">{getFullName(deletingClient)}</span>? They will be able to log in again.</>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteDialog(false)} className="border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
              <button
                onClick={handleDeleteAction}
                className={`text-white rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  deleteAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : deleteAction === 'deactivate' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {deleteAction === 'delete' ? 'Delete Permanently' : deleteAction === 'deactivate' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
