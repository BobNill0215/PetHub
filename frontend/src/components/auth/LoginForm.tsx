'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/stores/auth';

export function LoginForm() {
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(phone, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="phone"
        label="手机号"
        placeholder="请输入手机号"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <Input
        id="password"
        label="密码"
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        登录
      </Button>
    </form>
  );
}
