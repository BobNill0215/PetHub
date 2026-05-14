'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-gray-900">PetHub</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            首页
          </Link>
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            动态
          </Link>
          <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            商城
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/feed/new" className="text-sm text-gray-600 hover:text-gray-900">
                发布
              </Link>
              <Link href="/pets" className="text-sm text-gray-600 hover:text-gray-900">
                我的宠物
              </Link>
              <div className="flex items-center gap-2">
                <Avatar src={user.avatar} name={user.nickname} size="sm" />
                <span className="text-sm font-medium text-gray-700">{user.nickname}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                退出
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
