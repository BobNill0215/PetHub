'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/auth';

export function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, loading } = useAuthStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('缺少验证令牌');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('邮箱验证成功！');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.message || '验证失败');
      });
  }, [searchParams, verifyEmail]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {status === 'verifying' && (
          <div>
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-500">正在验证邮箱...</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900">{message}</h1>
            <p className="mt-2 text-sm text-gray-500">即将跳转至首页...</p>
            <Button className="mt-6" onClick={() => router.push('/')}>
              返回首页
            </Button>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-900">验证失败</h1>
            <p className="mt-2 text-sm text-red-500">{message}</p>
            <Button className="mt-6" variant="secondary" onClick={() => router.push('/login')}>
              去登录
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
