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
  isLiked?: boolean;
}

export default function FeedPage() {
  const user = useAuthStore((s) => s.user);
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'following'>('all');

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const url = tab === 'following' && user ? '/feeds/following' : '/feeds';
      const res = await apiGet<{ data: FeedItem[] }>(url);
      setFeeds(res.data.data);
    } catch { setFeeds([]); }
    setLoading(false);
  };

  useEffect(() => { fetchFeeds(); }, [tab, user]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button onClick={() => setTab('all')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            全部
          </button>
          <button onClick={() => setTab('following')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === 'following' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            关注
          </button>
        </div>
        {user && <Link href="/feed/new"><Button size="sm">+ 发布</Button></Link>}
      </div>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}

      {!loading && feeds.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            {tab === 'following' ? '关注更多用户，查看他们的动态' : '还没有动态'}
          </p>
          {tab === 'following' && !user && <Link href="/login"><Button className="mt-4">登录后查看</Button></Link>}
          {tab === 'all' && user && <Link href="/feed/new"><Button className="mt-4">发布第一条动态</Button></Link>}
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
