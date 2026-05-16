'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { FeedCard } from '@/components/feed/FeedCard';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/auth';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    apiGet<any>('/feeds').then(r => setFeeds(r.data.data || [])).catch(() => {});
    apiGet<any>('/products').then(r => setProducts(r.data.data || [])).catch(() => {});
  }, []);

  // ───── Logged-in view ─────
  if (user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex gap-3">
          <Link href="/feed/new"><Button size="sm">📝 发动态</Button></Link>
          <Link href="/marketplace/new"><Button size="sm" variant="secondary">🏪 发商品</Button></Link>
          <Link href="/pets/add"><Button size="sm" variant="secondary">🐾 加宠物</Button></Link>
        </div>
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            {feeds.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <p className="text-gray-500">还没有动态</p>
                <Link href="/feed/new"><Button className="mt-4">发布第一条动态</Button></Link>
              </div>
            ) : feeds.map((f: any) => <FeedCard key={f.id} feed={f} />)}
          </div>
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-400 mt-4">{feeds.length} 条动态 · {products.length} 件商品</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───── Landing page for non-logged-in ─────
  const stats = [
    { label: '活跃用户', value: '10,000+' },
    { label: '宠物动态', value: '50,000+' },
    { label: '成功交易', value: '5,000+' },
    { label: '宠物品种', value: '200+' },
  ];

  const steps = [
    { icon: '📝', title: '注册账号', desc: '一分钟完成注册，开启你的宠物社交之旅' },
    { icon: '🐾', title: '添加宠物', desc: '为你的毛孩子创建专属档案，记录成长点滴' },
    { icon: '📸', title: '分享日常', desc: '发布照片和视频，和万千宠友交流养宠心得' },
    { icon: '🏪', title: '交易交流', desc: '买宠物用品、找服务、结识同城宠友' },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            记录宠物点滴
            <span className="block text-blue-600 mt-2">分享有宠生活</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            PetHub 是宠物爱好者的专属社区。发布萌宠照片视频、交流养宠经验，还能购买心仪的宠物和用品。
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register"><Button size="lg">免费加入 →</Button></Link>
            <Link href="#features"><Button variant="secondary" size="lg">了解更多</Button></Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl bg-white/60 p-4 backdrop-blur">
                <p className="text-2xl font-bold text-blue-600">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">四步开始</h2>
          <p className="mt-4 text-center text-gray-500">从注册到分享，只需几分钟</p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  {step.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent activity (always visible) ── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">最新萌宠动态</h2>
          <p className="mt-4 text-center text-gray-500">看看其他宠友在分享什么</p>
          <div className="mt-10 space-y-4">
            {feeds.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <p className="text-gray-400">加载中...</p>
              </div>
            ) : feeds.slice(0, 3).map((f: any) => <FeedCard key={f.id} feed={f} />)}
          </div>
          <div className="mt-8 text-center">
            <Link href="/feed"><Button variant="secondary">查看更多 →</Button></Link>
          </div>
        </div>
      </section>

      {/* ── Products preview (always visible) ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">热门商品</h2>
          <p className="mt-4 text-center text-gray-500">发现宠友推荐的好物</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-white p-3 shadow-sm">
                  <div className="aspect-square rounded-lg bg-gray-100" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />
                  <div className="mt-1 h-5 w-1/3 rounded bg-gray-100" />
                </div>
              ))
            ) : products.slice(0, 4).map((p: any) => (
              <div key={p.id} className="rounded-xl border bg-white p-3 shadow-sm">
                {p.images[0] ? (
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 text-sm">
                    暂无图片
                  </div>
                )}
                <p className="mt-2 text-sm font-medium text-gray-900">{p.title}</p>
                <p className="text-lg font-bold text-red-500">¥{(p.price / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/marketplace"><Button variant="secondary">逛逛商城 →</Button></Link>
          </div>
        </div>
      </section> 

      {/* ── Features grid ── */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">准备好加入 PetHub 了吗？</h2>
          <p className="mt-4 text-lg text-blue-100">加入万千宠物爱好者，一起分享、交流、交易</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register"><Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-blue-50">免费注册</Button></Link>
            <Link href="/login"><Button size="lg" className="border border-white/30 text-white hover:bg-white/10">登录</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
