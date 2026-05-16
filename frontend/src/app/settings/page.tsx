'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { apiPut } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="text-center py-20 text-gray-500">请先登录</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword !== form.confirmPassword) { setError('两次密码不一致'); return; }
    if (form.newPassword.length < 6) { setError('密码至少6位'); return; }
    setLoading(true);
    try {
      await apiPut('/users/me/password', { oldPassword: form.oldPassword, newPassword: form.newPassword });
      setSuccess('密码修改成功');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { setError(err.response?.data?.message || '修改失败'); }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">账号设置</h1>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">修改密码</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="oldPassword" label="当前密码" type="password" value={form.oldPassword} onChange={e => setForm({ ...form, oldPassword: e.target.value })} required />
          <Input id="newPassword" label="新密码" type="password" placeholder="至少6位" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required minLength={6} />
          <Input id="confirmPassword" label="确认新密码" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
          <Button type="submit" loading={loading} className="w-full">保存修改</Button>
        </form>
      </div>
    </div>
  );
}
