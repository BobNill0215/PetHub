'use client';

import Link from 'next/link';
import { Button } from '@/components/common/Button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            记录宠物点滴
            <span className="block text-blue-600">分享有宠生活</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-600">
            PetHub 是宠物爱好者的专属社区。发布萌宠照片视频、交流养宠经验，还能购买心仪的宠物和用品。
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link href="/register">
              <Button size="lg">免费加入</Button>
            </Link>
            <Link href="#features">
              <Button variant="secondary" size="lg">
                了解更多
              </Button>
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">10万+</p>
              <p className="mt-1 text-sm text-gray-500">活跃用户</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">50万+</p>
              <p className="mt-1 text-sm text-gray-500">宠物动态</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">5万+</p>
              <p className="mt-1 text-sm text-gray-500">成功交易</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
