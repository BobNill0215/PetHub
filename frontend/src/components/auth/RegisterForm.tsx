'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/stores/auth';

export function RegisterForm() {
  const router = useRouter();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', nickname: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    try {
      await register(form.email, form.password, form.nickname);
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '注册失败';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="email"
        label="邮箱"
        type="email"
        placeholder="请输入邮箱"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <Input
        id="nickname"
        label="昵称"
        placeholder="请输入昵称"
        value={form.nickname}
        onChange={(e) => setForm({ ...form, nickname: e.target.value })}
        required
      />
      <Input
        id="password"
        label="密码"
        type="password"
        placeholder="至少6位密码"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={6}
      />
      <Input
        id="confirmPassword"
        label="确认密码"
        type="password"
        placeholder="再次输入密码"
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        注册
      </Button>
    </form>
  );
}
