'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { FeedCard } from '@/components/feed/FeedCard';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/auth';

interface FeedItem {
  id: number;
  uuid: string;
  user: { id: number; nickname: string; avatar?: string; city?: string };
  content: string;
  images: string[];
  topics: string[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  createdAt: string;
  isLiked?: boolean;
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: FeedItem[] }>('/feeds')
      .then(r => setFeeds(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Quick Actions */}
      {user && (
        <div className="mb-6 flex gap-3">
          <Link href="/feed/new"><Button size="sm">📝 发动态</Button></Link>
          <Link href="/marketplace/new"><Button size="sm" variant="secondary">🏪 发商品</Button></Link>
          <Link href="/pets/add"><Button size="sm" variant="secondary">🐾 加宠物</Button></Link>
        </div>
      )}

      {/* Hot Topics */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['猫咪日常', '狗狗', '萌宠', '宠物用品', '领养'].map(t => (
          <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600 hover:bg-blue-100">
            #{t}
          </Link>
        ))}
      </div>

      {/* Feed */}
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 py-8">加载中...</p>
          ) : feeds.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">还没有动态</p>
              {user ? (
                <Link href="/feed/new"><Button className="mt-4">发布第一条动态</Button></Link>
              ) : (
                <Link href="/register"><Button className="mt-4">加入 PetHub</Button></Link>
              )}
            </div>
          ) : (
            feeds.map(feed => <FeedCard key={feed.id} feed={feed} />)
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900">热门话题</h3>
            <div className="mt-3 space-y-2">
              {['猫咪日常', '狗狗', '萌宠', '宠物用品', '领养'].map(t => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
                  className="block text-sm text-blue-600 hover:text-blue-800">
                  # {t}
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-xs text-gray-400">加入万千宠物爱好者</p>
              {!user && (
                <Link href="/register"><Button size="sm" className="mt-2 w-full">免费注册</Button></Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
