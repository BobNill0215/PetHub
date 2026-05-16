'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPut } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/auth';

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async (p = 1, append = false) => {
    if (p === 1) setLoading(true);
    try {
      const res = await apiGet<any>('/notifications', { page: p, pageSize: 20 });
      setNotifs(append ? [...notifs, ...res.data.data] : res.data.data);
      setUnread(res.data.unreadCount);
      setTotal(res.data.total);
      setPage(p);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchNotifs(); }, [user]);

  const markAllRead = async () => {
    await apiPut('/notifications/read-all');
    setUnread(0);
    setNotifs(notifs.map((n: any) => ({ ...n, isRead: true })));
  };

  if (!user) return <div className="text-center py-20 text-gray-500">请先登录</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">通知</h1>
        {unread > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}>全部已读</Button>}
      </div>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}

      {!loading && notifs.length === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center">
          <p className="text-gray-500">暂无通知</p>
        </div>
      )}

      <div className="space-y-1">
        {notifs.map((n: any) => (
          <div key={n.id} className={`rounded-lg px-4 py-3 text-sm ${n.isRead ? '' : 'bg-blue-50 border-l-2 border-blue-500'}`}>
            <p className="text-gray-700">{n.content}</p>
            <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('zh-CN')}</p>
          </div>
        ))}
      </div>

      {notifs.length < total && (
        <div className="mt-6 text-center">
          <Button variant="secondary" size="sm" onClick={() => fetchNotifs(page + 1, true)}>加载更多</Button>
        </div>
      )}
    </div>
  );
}
