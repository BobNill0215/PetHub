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
  videoUrl?: string;
  topics: string[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  createdAt: string;
}

export default function FeedPage() {
  const user = useAuthStore((s) => s.user);
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    try {
      const res = await apiGet<{ data: FeedItem[]; total: number }>('/feeds');
      setFeeds(res.data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeeds(); }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">萌宠动态</h1>
        {user && (
          <Link href="/feed/new">
            <Button size="sm">+ 发布</Button>
          </Link>
        )}
      </div>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}

      {!loading && feeds.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">还没有动态</p>
          {user ? (
            <Link href="/feed/new"><Button className="mt-4">发布第一条动态</Button></Link>
          ) : (
            <Link href="/login"><Button className="mt-4">登录后发布</Button></Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {feeds.map((feed) => (
          <FeedCard key={feed.id} feed={feed} />
        ))}
      </div>
    </div>
  );
}
