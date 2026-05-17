'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [dashboard, setDashboard] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');

  useEffect(() => {
    apiGet<any>('/admin/dashboard').then(r => setDashboard(r.data)).catch(() => {});
    apiGet<any>('/admin/users').then(r => setUsers(r.data.data || [])).catch(() => {});
    apiGet<any>('/admin/reports').then(r => setReports(r.data || [])).catch(() => {});
  }, []);

  if (!user || user.role !== 'ADMIN') {
    return <div className="text-center py-20 text-gray-500">无权访问管理后台</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">⚙️ 管理后台</h1>

      <div className="flex gap-2 mb-6">
        {(['dashboard', 'users', 'reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-lg ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {t === 'dashboard' ? '📊 概览' : t === 'users' ? '👥 用户' : '🚨 举报'}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-white p-6"><p className="text-2xl font-bold">{dashboard.userCount || 0}</p><p className="text-sm text-gray-500">用户</p></div>
          <div className="rounded-xl border bg-white p-6"><p className="text-2xl font-bold">{dashboard.feedCount || 0}</p><p className="text-sm text-gray-500">帖子</p></div>
          <div className="rounded-xl border bg-white p-6"><p className="text-2xl font-bold text-red-500">{dashboard.reportCount || 0}</p><p className="text-sm text-gray-500">待处理举报</p></div>
          <div className="rounded-xl border bg-white p-6"><p className="text-2xl font-bold">{dashboard.commentCount || 0}</p><p className="text-sm text-gray-500">评论</p></div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="text-sm font-medium">{u.nickname}</p>
                <p className="text-xs text-gray-400">{u.email} · {u.role} · {u.feedCount} 帖子</p>
              </div>
              {u.status !== 'BANNED' && (
                <button onClick={async () => { try { await apiPost(`/admin/users/${u.id}/ban`); } catch {} }}
                  className="text-xs text-red-500 hover:text-red-700">封禁</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-2">
          {reports.length === 0 ? <p className="text-gray-400 text-center py-8">暂无举报</p> : reports.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="text-sm">{r.reason}</p>
                <p className="text-xs text-gray-400">类型: {r.targetType} · ID: {r.targetId} · 状态: {r.status}</p>
              </div>
              {r.status === 'pending' && (
                <button onClick={async () => { try { await apiPost(`/admin/reports/${r.id}/resolve`); } catch {} }}
                  className="text-xs text-green-600 hover:text-green-800">标记已处理</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
