import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">创建账号</h1>
          <p className="mt-2 text-sm text-gray-500">加入 PetHub 宠物社区</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          已有账号？{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
