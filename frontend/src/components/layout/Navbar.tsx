'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { apiGet, apiPut } from '@/lib/api';
import { useTheme } from '@/lib/darkmode';
import { getUserLevel } from '@/lib/levels';

export function Navbar() {
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiGet<{ data: any[]; unreadCount: number }>('/notifications', { pageSize: 5 });
      setNotifications(res.data.data);
      setUnread(res.data.unreadCount);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const markAllRead = async () => {
    await apiPut('/notifications/read-all');
    setUnread(0);
    setNotifications(notifications.map((n: any) => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-gray-900 hidden sm:inline">PetHub</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </form>

        <div className="hidden items-center gap-5 md:flex">
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300">论坛</Link>
          <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300">好物</Link>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          {user ? (
            <>
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
                  className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b px-4 py-2.5">
                      <span className="text-sm font-medium text-gray-900">通知</span>
                      {unread > 0 && <button onClick={markAllRead} className="text-xs text-blue-600">全部已读</button>}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">暂无通知</p>
                      ) : notifications.map((n: any) => (
                        <div key={n.id} className={`flex gap-2 px-4 py-2.5 text-sm ${n.isRead ? '' : 'bg-blue-50'}`}>
                          <p className="text-gray-600">{n.content}</p>
                          <span className="text-xs text-gray-400 shrink-0">
                            {new Date(n.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user && (
                <span className="text-xs hidden sm:inline">{getUserLevel(user.feedCount || 0).icon}</span>
              )}
              <Link href="/messages" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900">消息</Link>
              <Link href="/feed/new">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">发布</Button>
              </Link>
              <Link href="/pets" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900">我的宠物</Link>
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar src={user.avatar} name={user.nickname} size="sm" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.nickname}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">退出</Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">登录</Button></Link>
              <Link href="/register"><Button size="sm">注册</Button></Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
