import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/components/Toast';
import { LogIn, Eye, EyeOff, AlertCircle, ShieldOff, FolderKanban, BarChart3, Users, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { allow_registration, site_name } = useSettingsStore((s) => s.settings);
  const [error, setError] = useState('');
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setIsDeactivated(false);
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast('Welcome back! You have been signed in successfully.');
      navigate('/');
    } catch (err: any) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.message || 'Invalid credentials. Please try again.';
      if (status === 403) setIsDeactivated(true);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400';

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
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
              Manage your projects with clarity
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed mb-10">
              A powerful platform to track projects, manage teams, and deliver results on time.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                { icon: BarChart3, text: 'Real-time dashboards & analytics' },
                { icon: Users, text: 'Role-based team collaboration' },
                { icon: Shield, text: 'Secure access with JWT authentication' },
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
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <FolderKanban size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">{site_name || 'Project Portal'}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1.5 text-[15px]">Enter your credentials to access your account</p>
          </div>

          {/* Error states */}
          {error && (
            isDeactivated ? (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <ShieldOff size={20} className="mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-semibold text-amber-800">Account Deactivated</p>
                <p className="text-xs text-amber-600 mt-1">Please contact your administrator to reactivate your account.</p>
              </div>
            ) : (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input {...register('email')} type="email" className={inputClass} placeholder="name@company.com" autoComplete="email" />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} className={`${inputClass} pr-11`} placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-700 hover:to-violet-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none">
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={17} />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {allow_registration && (
            <p className="text-center text-sm text-gray-500 mt-8">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Create one</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
