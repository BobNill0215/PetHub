import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="mt-2 text-sm text-gray-500">登录你的 PetHub 账号</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          还没有账号？{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
