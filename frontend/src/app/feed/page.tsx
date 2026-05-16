'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { FeedCard } from '@/components/feed/FeedCard';
import { CategoryBar } from '@/components/feed/CategoryBar';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/auth';

export default function FeedPage() {
  const user = useAuthStore((s) => s.user);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'following'>('all');
  const [sort, setSort] = useState<'new' | 'hot'>('new');

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const url = tab === 'following' && user ? '/feeds/following' : '/feeds';
      const res = await apiGet<any>(url, { sort });
      setFeeds(res.data.data || []);
    } catch { setFeeds([]); }
    setLoading(false);
  };

  useEffect(() => { fetchFeeds(); }, [tab, sort, user]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-1"><CategoryBar /></div>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button onClick={() => setTab('all')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            全部
          </button>
          {user && (
            <button onClick={() => setTab('following')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === 'following' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              关注
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setSort('new')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${sort === 'new' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            最新
          </button>
          <button onClick={() => setSort('hot')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${sort === 'hot' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            最热
          </button>
          {user && <Link href="/feed/new"><Button size="sm">+ 发帖</Button></Link>}
        </div>
      </div>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}

      {!loading && feeds.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">{tab === 'following' ? '关注更多用户，查看他们的帖子' : '还没有帖子'}</p>
          {tab === 'all' && !user && <div className="mt-4"><Link href="/register"><Button>注册后发帖</Button></Link></div>}
          {tab === 'all' && user && <Link href="/feed/new"><Button className="mt-4">发布第一个帖子</Button></Link>}
        </div>
      )}

      <div className="space-y-4">
        {feeds.map((feed: any) => <FeedCard key={feed.id} feed={feed} />)}
      </div>

      {!user && feeds.length > 0 && (
        <div className="mt-8 text-center rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 p-6">
          <p className="text-gray-700">加入 PetHub 宠物论坛，和万千宠友交流</p>
          <Link href="/register"><Button className="mt-3">免费注册</Button></Link>
        </div>
      )}
    </div>
  );
}
