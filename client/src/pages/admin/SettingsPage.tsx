import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings, Loader2, Save, Lock, Eye, EyeOff, Globe, UserCog,
  ShieldCheck, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { settingsService } from '@/services/settings.service';
import { profileService } from '@/services/profile.service';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/components/Toast';
import type { Setting } from '@/types';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface SettingsForm {
  site_name: string;
  allow_registration: boolean;
  default_role: 'user' | 'client';
}

const DEFAULT_FORM: SettingsForm = {
  site_name: '',
  allow_registration: true,
  default_role: 'user',
};

export default function SettingsPage() {
  const { toast } = useToast();
  const fetchPublicSettings = useSettingsStore((s) => s.fetchPublicSettings);
  const [form, setForm] = useState<SettingsForm>(DEFAULT_FORM);
  const [initialForm, setInitialForm] = useState<SettingsForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register: regPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const onPasswordChange = async (values: PasswordFormValues) => {
    setPwSaving(true);
    try {
      await profileService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast('Password changed successfully.');
      resetPw();
    } catch {
      toast('Failed to change password. Check your current password.', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  useEffect(() => {
    settingsService
      .getSettings()
      .then((res) => {
        const settings: Setting[] = res.data.settings;
        const mapped: Partial<SettingsForm> = {};
        for (const s of settings) {
          if (s.key === 'site_name') mapped.site_name = s.value as string;
          if (s.key === 'allow_registration') mapped.allow_registration = s.value as boolean;
          if (s.key === 'default_role') mapped.default_role = s.value as 'user' | 'client';
        }
        const loaded = { ...DEFAULT_FORM, ...mapped };
        setForm(loaded);
        setInitialForm(loaded);
      })
      .catch(() => setError('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const hasChanges =
    form.site_name !== initialForm.site_name ||
    form.allow_registration !== initialForm.allow_registration ||
    form.default_role !== initialForm.default_role;

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await settingsService.updateSettings([
        { key: 'site_name', value: form.site_name },
        { key: 'allow_registration', value: form.allow_registration },
        { key: 'default_role', value: form.default_role },
      ]);
      setInitialForm(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast('Settings saved successfully.');
      // Refresh global settings store so topbar/sidebar/register page update immediately
      await fetchPublicSettings();
    } catch {
      toast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading settings...</p>
      </div>
    );
  }

  if (error && !form.site_name) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all duration-200';

  return (
    <div className="animate-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your application preferences and security</p>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 animate-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium text-emerald-700">Settings saved and applied across the application.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — App Settings */}
        <div className="space-y-6">
          {/* General Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Globe className="h-4.5 w-4.5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">General</h2>
                <p className="text-xs text-gray-400">Site identity and branding</p>
              </div>
            </div>

            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.site_name}
                  onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                  className={inputClass}
                  placeholder="My Development Portal"
                />
                <p className="text-xs text-gray-400 mt-1.5">Displayed in the sidebar, topbar, and login pages</p>
              </div>
            </div>
          </div>

          {/* Access Control Card */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Access Control</h2>
                <p className="text-xs text-gray-400">Registration and role settings</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Allow Registration Toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Allow Registration</label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {form.allow_registration
                      ? 'New users can sign up via the registration page'
                      : 'Registration is disabled — only admins can create accounts'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.allow_registration}
                  onClick={() => setForm({ ...form, allow_registration: !form.allow_registration })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0 mt-0.5 ${
                    form.allow_registration ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      form.allow_registration ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Status indicator */}
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                form.allow_registration
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {form.allow_registration
                  ? <><CheckCircle2 className="h-3.5 w-3.5" /> Registration page is active</>
                  : <><AlertCircle className="h-3.5 w-3.5" /> Registration page shows disabled message</>
                }
              </div>

              <div className="border-t border-gray-100 pt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Default Role
                </label>
                <select
                  value={form.default_role}
                  onChange={(e) => setForm({ ...form, default_role: e.target.value as 'user' | 'client' })}
                  className={inputClass}
                >
                  <option value="user">User</option>
                  <option value="client">Client</option>
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  Role assigned to newly registered accounts
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200 shadow-sm ${
                hasChanges
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {hasChanges && (
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* Right Column — Security */}
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Lock className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Security</h2>
                <p className="text-xs text-gray-400">Update your admin password</p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handlePwSubmit(onPasswordChange)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input {...regPw('currentPassword')} type={showCurrent ? 'text' : 'password'} className={inputClass + ' pr-10'} />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input {...regPw('newPassword')} type={showNew ? 'text' : 'password'} className={inputClass + ' pr-10'} />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input {...regPw('confirmPassword')} type={showConfirm ? 'text' : 'password'} className={inputClass + ' pr-10'} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.confirmPassword.message}</p>}
                </div>

                <div className="pt-3">
                  <button type="submit" disabled={pwSaving}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md">
                    {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <UserCog className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">How Settings Work</h2>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span><strong className="text-gray-900">Site Name</strong> updates the branding in the header, sidebar, and auth pages instantly after saving.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span><strong className="text-gray-900">Allow Registration</strong> controls whether the public sign-up page is accessible.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span><strong className="text-gray-900">Default Role</strong> sets which role new accounts receive upon registration.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
