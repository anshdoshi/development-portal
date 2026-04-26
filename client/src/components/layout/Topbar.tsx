import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User, ChevronDown, FolderKanban, Check, CheckCheck, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/types';

interface TopbarProps {
  onMenuClick: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const NOTIF_LIMIT = 15;

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const siteName = useSettingsStore((s) => s.settings.site_name);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    notificationService.getUnreadCount()
      .then((res) => setUnreadCount(res.data.count ?? 0))
      .catch(() => {});
  }, []);

  const fetchNotifications = useCallback(async (page: number, append = false) => {
    if (page === 1) setNotifLoading(true);
    else setLoadingMore(true);
    try {
      const res = await notificationService.getNotifications({ page, limit: NOTIF_LIMIT });
      const items = res.data.data ?? [];
      const total = res.data.total ?? 0;
      if (append) {
        setNotifications((prev) => [...prev, ...items]);
      } else {
        setNotifications(items);
      }
      setHasMore(page * NOTIF_LIMIT < total);
      setNotifPage(page);
    } catch {
      if (!append) setNotifications([]);
    } finally {
      setNotifLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const toggleNotifications = useCallback(() => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      fetchNotifications(1);
    }
  }, [showNotifications, fetchNotifications]);

  const handleLoadMore = () => {
    fetchNotifications(notifPage + 1, true);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      try {
        await notificationService.markAsRead(n.id);
        setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {}
    }
    setShowNotifications(false);
    const dest = n.link || (user?.role === 'admin' ? '/admin' : user?.role === 'client' ? '/client' : '/user');
    navigate(dest);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200/60">
      <div className="flex items-center h-16">
        {/* Left: Logo (desktop) / Hamburger (mobile) */}
        <div className="flex items-center shrink-0 px-4 sm:px-6 lg:px-0">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <Menu size={20} />
          </button>
          <div className="hidden lg:flex items-center gap-2.5 w-64 h-16 px-5 border-r border-gray-200/60">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <FolderKanban size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900 truncate">{siteName || 'Project Portal'}</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-2 px-4 sm:px-6">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] bg-white rounded-xl shadow-xl border border-gray-200/80 animate-in flex flex-col"
                style={{ maxHeight: 'min(70vh, 520px)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-100 text-red-600 text-[11px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <CheckCheck size={13} />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Body */}
                {notifLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={22} className="animate-spin text-indigo-400" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <Bell size={22} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No notifications yet</p>
                    <p className="text-xs text-gray-300 mt-1">We'll notify you when something happens</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 overscroll-contain">
                    <ul className="divide-y divide-gray-100">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors duration-150 hover:bg-gray-50 ${
                            !n.is_read ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          {/* Unread dot */}
                          {!n.is_read && (
                            <span className="absolute top-4 left-1.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                          )}

                          {/* Icon */}
                          <div className={`mt-0.5 shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${
                            !n.is_read ? 'bg-indigo-100' : 'bg-gray-100'
                          }`}>
                            <Bell size={14} className={!n.is_read ? 'text-indigo-600' : 'text-gray-400'} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                            <p className={`text-[11px] mt-1 ${!n.is_read ? 'text-indigo-400 font-medium' : 'text-gray-400'}`}>
                              {timeAgo(n.created_at)}
                            </p>
                          </div>

                          {/* Read indicator */}
                          {n.is_read && (
                            <Check size={14} className="shrink-0 mt-1 text-gray-300" />
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Load More */}
                    {hasMore && (
                      <div className="px-4 py-3 border-t border-gray-100">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                        >
                          {loadingMore ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : null}
                          {loadingMore ? 'Loading...' : 'Load more notifications'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 leading-tight">{user?.first_name} {user?.last_name}</p>
                <p className="text-[11px] text-gray-400 capitalize">{user?.role}</p>
              </div>
              <ChevronDown size={14} className="hidden sm:block text-gray-400" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200/80 py-1.5 animate-in">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <User size={15} /> Profile
                  </button>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutDialog(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sign Out</h2>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
