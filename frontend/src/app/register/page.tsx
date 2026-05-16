import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="flex w-full max-w-4xl gap-12 items-center">
        <div className="hidden md:block flex-1">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-3xl font-bold text-gray-900">加入 PetHub</h1>
          <p className="mt-4 text-gray-500 leading-relaxed">
            为你的毛孩子创建专属主页<br />
            记录成长点滴，认识更多宠友
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex gap-3">
              <span className="text-xl">📸</span>
              <div>
                <p className="text-sm font-medium text-gray-900">分享萌宠日常</p>
                <p className="text-xs text-gray-400">照片、视频、故事，记录每个可爱瞬间</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">👥</span>
              <div>
                <p className="text-sm font-medium text-gray-900">认识宠友</p>
                <p className="text-xs text-gray-400">点赞、评论、私信，和同好交流</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🏪</span>
              <div>
                <p className="text-sm font-medium text-gray-900">交易无忧</p>
                <p className="text-xs text-gray-400">买宠物用品、找服务，安全有保障</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-sm mx-auto">
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
    </div>
  );
}
