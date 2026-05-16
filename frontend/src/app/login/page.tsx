import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="flex w-full max-w-4xl gap-12 items-center">
        <div className="hidden md:block flex-1">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-3xl font-bold text-gray-900">欢迎回到 PetHub</h1>
          <p className="mt-4 text-gray-500 leading-relaxed">
            和万千宠物爱好者一起<br />
            分享萌宠日常 · 交流养宠经验 · 交易宠物用品
          </p>
          <div className="mt-8 space-y-3 text-sm text-gray-400">
            <p>✅ 10,000+ 活跃宠物主人</p>
            <p>✅ 50,000+ 萌宠动态</p>
            <p>✅ 5,000+ 成功交易</p>
          </div>
        </div>
        <div className="flex-1 max-w-sm mx-auto">
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
    </div>
  );
}
