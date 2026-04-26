import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/components/Toast';
import { UserPlus, Eye, EyeOff, ShieldOff, AlertCircle, FolderKanban, BarChart3, Users, Shield } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const { allow_registration, site_name } = useSettingsStore((s) => s.settings);
  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast('Account created successfully. Welcome aboard!');
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400';

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-12 w-64 h-64 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FolderKanban size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">{site_name || 'Project Portal'}</span>
          </div>

          {/* Hero content */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Start managing your projects today
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed mb-10">
              Join your team and get instant access to project tracking, reporting, and collaboration tools.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                { icon: BarChart3, text: 'Track progress with visual dashboards' },
                { icon: Users, text: 'Collaborate with your entire team' },
                { icon: Shield, text: 'Enterprise-grade security built in' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-indigo-200 text-xs">&copy; {new Date().getFullYear()} {site_name || 'Project Portal'}. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <FolderKanban size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">{site_name || 'Project Portal'}</span>
          </div>

          {/* Loading settings */}
          {!settingsLoaded ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-3" />
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : !allow_registration ? (
            <div className="text-center py-16">
              <div className="inline-flex h-14 w-14 rounded-2xl bg-red-50 items-center justify-center mb-4">
                <ShieldOff size={24} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Disabled</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">New account registration is currently not available. Please contact your administrator for access.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                &larr; Back to Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                <p className="text-gray-500 mt-1.5 text-[15px]">Fill in your details to get started</p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
                    <input {...register('firstName')} className={inputClass} placeholder="John" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1.5">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                    <input {...register('lastName')} className={inputClass} placeholder="Doe" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1.5">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                  <input {...register('email')} type="email" className={inputClass} placeholder="name@company.com" autoComplete="email" />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input {...register('password')} type={showPw ? 'text' : 'password'} className={`${inputClass} pr-11`} placeholder="Min. 6 characters" autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                  <div className="relative">
                    <input {...register('confirmPassword')} type={showConfirmPw ? 'text' : 'password'} className={`${inputClass} pr-11`} placeholder="Re-enter your password" autoComplete="new-password" />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-700 hover:to-violet-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none mt-6">
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <UserPlus size={17} />
                  )}
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-8">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
