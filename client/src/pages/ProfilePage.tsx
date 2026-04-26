import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCircle, Lock, Loader2, Save, Eye, EyeOff, Camera, Mail, Phone, Briefcase, MapPin, Building2, FileText } from 'lucide-react';
import { profileService } from '@/services/profile.service';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/Toast';

/* -- Profile Form -- */

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  address: string;
  bio: string;
}

/* -- Password Schema -- */

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    watch,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      job_title: '',
      address: '',
      bio: '',
    },
  });

  const profileValues = watch();

  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    profileService
      .getProfile()
      .then((res) => {
        const u = res.data.profile;
        resetProfile({
          first_name: u.first_name ?? '',
          last_name: u.last_name ?? '',
          email: u.email ?? '',
          phone: u.profiles?.phone ?? '',
          company: u.profiles?.company ?? '',
          job_title: u.profiles?.job_title ?? '',
          address: u.profiles?.address ?? '',
          bio: u.profiles?.bio ?? '',
        });
      })
      .catch(() => setProfileError('Failed to load profile.'))
      .finally(() => setProfileLoading(false));
  }, [resetProfile]);

  const onProfileSave = async (values: ProfileFormValues) => {
    setProfileSaving(true);
    try {
      await profileService.updateProfile({
        phone: values.phone || undefined,
        company: values.company || undefined,
        jobTitle: values.job_title || undefined,
        address: values.address || undefined,
        bio: values.bio || undefined,
      });
      toast('Profile updated successfully.');
    } catch {
      toast('Failed to update profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const onPasswordChange = async (values: PasswordFormValues) => {
    setPasswordSaving(true);
    try {
      await profileService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast('Password has been changed.');
      resetPassword();
    } catch {
      toast('Failed to change password.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      toast('Profile image updated.');
    };
    reader.readAsDataURL(file);
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (profileError) {
    return <div className="text-center text-red-500 py-12">{profileError}</div>;
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all duration-200';
  const readOnlyClass =
    'w-full border border-gray-100 rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed';

  const roleBadgeColor = user?.role === 'admin'
    ? 'bg-red-50 text-red-700 border-red-200'
    : user?.role === 'client'
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-green-50 text-green-700 border-green-200';

  return (
    <div className="animate-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account information and password
        </p>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden mb-6">
        {/* Gradient Banner */}
        <div className="h-32 sm:h-36 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6TTM2IDI0djJIMnYtMmgzNHpNMzYgMTR2Mkgydi0yaDM0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>

        {/* Avatar + Info */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            {/* Avatar */}
            <div className="relative group shrink-0">
              {avatarPreview || user?.avatar_url ? (
                <img
                  src={avatarPreview || user?.avatar_url || ''}
                  alt="Avatar"
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white shadow-lg">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1.5 -right-1.5 h-9 w-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm group-hover:scale-110"
              >
                <Camera className="h-4 w-4 text-gray-500" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name + Meta */}
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize w-fit ${roleBadgeColor}`}>
                  {user?.role}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5" /> {user?.email}
                </span>
                {profileValues.company && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Building2 className="h-3.5 w-3.5" /> {profileValues.company}
                  </span>
                )}
                {profileValues.job_title && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Briefcase className="h-3.5 w-3.5" /> {profileValues.job_title}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <p className="text-xs text-gray-400">Update your personal details</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <input {...regProfile('first_name')} readOnly className={readOnlyClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input {...regProfile('last_name')} readOnly className={readOnlyClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input {...regProfile('email')} readOnly className={readOnlyClass + ' pl-10'} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input {...regProfile('phone')} type="tel" className={inputClass + ' pl-10'} placeholder="(555) 123-4567" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input {...regProfile('company')} className={inputClass + ' pl-10'} placeholder="Acme Inc." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input {...regProfile('job_title')} className={inputClass + ' pl-10'} placeholder="Software Engineer" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input {...regProfile('address')} className={inputClass + ' pl-10'} placeholder="123 Main St, City" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <textarea {...regProfile('bio')} rows={4} className={inputClass + ' pl-10'} placeholder="Tell us about yourself..." />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column — Password */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Password</h2>
                <p className="text-xs text-gray-400">Update your password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    {...regPassword('currentPassword')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={inputClass + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    {...regPassword('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    className={inputClass + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    {...regPassword('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={inputClass + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Role</dt>
                <dd className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleBadgeColor}`}>
                  {user?.role}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user?.is_active ? 'Active' : 'Inactive'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Joined</dt>
                <dd className="text-gray-900 font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
