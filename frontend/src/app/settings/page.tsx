'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { apiGet, apiPut } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [notif, setNotif] = useState({ onLike: true, onComment: true, onFollow: true, onMessage: true });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiGet<any>('/settings/notifications').then(r => {
      if (r.data) setNotif({ onLike: r.data.onLike, onComment: r.data.onComment, onFollow: r.data.onFollow, onMessage: r.data.onMessage });
    }).catch(() => {});
  }, [user]);

  if (!user) return <div className="text-center py-20 text-gray-500">请先登录</div>;

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (passForm.newPassword !== passForm.confirmPassword) { setError('两次密码不一致'); return; }
    setLoading(true);
    try {
      await apiPut('/users/me/password', { oldPassword: passForm.oldPassword, newPassword: passForm.newPassword });
      setSuccess('密码修改成功'); setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { setError(err.response?.data?.message || '修改失败'); }
    setLoading(false);
  };

  const saveNotif = async () => {
    setSavingNotif(true);
    try { await apiPut('/settings/notifications', notif); setSuccess('通知设置已保存'); } catch { setError('保存失败'); }
    setSavingNotif(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">账号设置</h1>

      {/* Notification Settings */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">🔔 通知设置</h2>
        <div className="space-y-3">
          {[
            { key: 'onLike', label: '有人点赞我的帖子' },
            { key: 'onComment', label: '有人评论我的帖子' },
            { key: 'onFollow', label: '有人关注我' },
            { key: 'onMessage', label: '收到新消息' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <input type="checkbox" checked={(notif as any)[item.key]}
                onChange={e => setNotif({ ...notif, [item.key]: e.target.checked })}
                className="rounded border-gray-300 text-blue-600" />
            </label>
          ))}
        </div>
        <Button size="sm" className="mt-4" loading={savingNotif} onClick={saveNotif}>保存通知设置</Button>
      </div>

      {/* Password Change */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">🔑 修改密码</h2>
        <form onSubmit={handlePassword} className="space-y-3">
          <input type="password" placeholder="当前密码" value={passForm.oldPassword}
            onChange={e => setPassForm({ ...passForm, oldPassword: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
          <input type="password" placeholder="新密码（至少6位）" value={passForm.newPassword}
            onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required minLength={6} />
          <input type="password" placeholder="确认新密码" value={passForm.confirmPassword}
            onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
          <Button type="submit" loading={loading} className="w-full">保存修改</Button>
        </form>
      </div>
    </div>
  );
}
