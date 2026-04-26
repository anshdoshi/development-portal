import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, X, AlertTriangle, Loader2, Ban, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { userService } from '@/services/user.service';
import { useToast } from '@/components/Toast';
import type { User } from '@/types';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'client', 'user']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-indigo-50 text-indigo-700',
  client: 'bg-emerald-50 text-emerald-700',
  user: 'bg-amber-50 text-amber-700',
};

const STATUS_BADGE = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
};

const PAGE_LIMIT = 10;

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm transition-all focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10';
const selectClass = `${inputClass} appearance-none`;

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteAction, setDeleteAction] = useState<'activate' | 'deactivate' | 'delete'>('deactivate');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getUsers({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const startItem = (page - 1) * PAGE_LIMIT + 1;
  const endItem = Math.min(page * PAGE_LIMIT, total);

  const openCreate = () => {
    setEditingUser(null);
    setShowPassword(false);
    reset({ firstName: '', lastName: '', email: '', role: 'user', password: '' });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    reset({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      password: undefined,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
        });
        toast('User details have been updated.');
      } else {
        await userService.createUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          password: data.password!,
        });
        toast('User has been created successfully.');
      }
      closeModal();
      fetchUsers();
    } catch {
      toast('Something went wrong. Please try again.', 'error');
      setError(editingUser ? 'Failed to update user.' : 'Failed to create user.');
    }
  };

  const confirmActivate = (user: User) => {
    setDeletingUser(user);
    setDeleteAction('activate');
    setShowDeleteDialog(true);
  };

  const confirmDeactivate = (user: User) => {
    setDeletingUser(user);
    setDeleteAction('deactivate');
    setShowDeleteDialog(true);
  };

  const confirmDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteAction('delete');
    setShowDeleteDialog(true);
  };

  const handleDeleteAction = async () => {
    if (!deletingUser) return;
    try {
      if (deleteAction === 'delete') {
        await userService.deleteUser(deletingUser.id);
        toast('User has been permanently deleted.');
      } else if (deleteAction === 'deactivate') {
        await userService.deactivateUser(deletingUser.id);
        toast('User has been deactivated.');
      } else {
        await userService.updateUser(deletingUser.id, { isActive: true });
        toast(`${deletingUser.first_name} ${deletingUser.last_name} has been activated.`);
      }
      setShowDeleteDialog(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage user accounts and roles</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className={`${selectClass} w-auto min-w-[140px]`}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
            <option value="user">User</option>
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
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="h-10 w-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No users found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {getInitials(user.first_name, user.last_name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[user.role] ?? ''}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${user.is_active ? STATUS_BADGE.active : STATUS_BADGE.inactive}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => openEdit(user)}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {user.is_active ? (
                            <button
                              onClick={() => confirmDeactivate(user)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Deactivate"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => confirmActivate(user)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Activate"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => confirmDelete(user)}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete permanently"
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
                {editingUser ? 'Edit User' : 'Create User'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input {...register('firstName')} className={inputClass} />
                  {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                  <input {...register('lastName')} className={inputClass} />
                  {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" {...register('email')} className={inputClass} />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                <select {...register('role')} className={selectClass}>
                  <option value="user">User</option>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} {...register('password')} className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                </div>
              )}

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
                  {isSubmitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirm Dialog */}
      {showDeleteDialog && deletingUser && (
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
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {deleteAction === 'delete' ? 'Delete User' : deleteAction === 'deactivate' ? 'Deactivate User' : 'Activate User'}
                </h2>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              {deleteAction === 'delete' ? (
                <>Are you sure you want to permanently delete <span className="font-medium text-gray-900">{deletingUser.first_name} {deletingUser.last_name}</span>? This will remove all their data and cannot be undone.</>
              ) : deleteAction === 'deactivate' ? (
                <>Are you sure you want to deactivate <span className="font-medium text-gray-900">{deletingUser.first_name} {deletingUser.last_name}</span>? They will no longer be able to log in.</>
              ) : (
                <>Are you sure you want to activate <span className="font-medium text-gray-900">{deletingUser.first_name} {deletingUser.last_name}</span>? They will be able to log in again.</>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAction}
                className={`text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
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
