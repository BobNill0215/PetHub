'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { FeedCard } from '@/components/feed/FeedCard';
import { CategoryBar } from '@/components/feed/CategoryBar';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/auth';

function TrendingSidebar() {
  const [trending, setTrending] = useState<any>(null);
  useEffect(() => {
    apiGet<any>('/feeds/trending').then(r => setTrending(r.data)).catch(() => {});
  }, []);
  if (!trending) return null;
  return (
    <div className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">🔥 热门推荐</h3>
          <div className="space-y-2">
            {trending.byViews?.slice(0, 5).map((f: any, i: number) => (
              <Link key={f.id} href={`/post/${f.id}`} className="flex gap-2 items-start text-sm hover:text-blue-600">
                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                <span className="truncate">{f.content}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">💬 最多评论</h3>
          <div className="space-y-2">
            {trending.byComments?.slice(0, 5).map((f: any, i: number) => (
              <Link key={f.id} href={`/post/${f.id}`} className="flex gap-2 items-start text-sm hover:text-blue-600">
                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                <span className="truncate">{f.content}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const user = useAuthStore((s) => s.user);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<'all' | 'following'>('all');
  const [sort, setSort] = useState<'new' | 'hot'>('new');

  const fetchFeeds = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const url = tab === 'following' && user ? '/feeds/following' : '/feeds';
      const res = await apiGet<any>(url, { sort, page: pageNum, pageSize: 10 });
      const newData = res.data.data || [];
      setFeeds(append ? [...feeds, ...newData] : newData);
      setTotal(res.data.total || 0);
      setPage(pageNum);
    } catch { setFeeds([]); }
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => { fetchFeeds(1); }, [tab, sort, user]);

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

      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {feeds.map((feed: any) => <FeedCard key={feed.id} feed={feed} />)}
        </div>
        <TrendingSidebar />
      </div>

      {!loading && feeds.length < total && (
        <div className="mt-6 text-center">
          <Button variant="secondary" loading={loadingMore} onClick={() => fetchFeeds(page + 1, true)}>
            加载更多
          </Button>
          <p className="mt-2 text-xs text-gray-400">{feeds.length} / {total} 条</p>
        </div>
      )}

      {!user && feeds.length > 0 && (
        <div className="mt-8 text-center rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 p-6">
          <p className="text-gray-700">加入 PetHub 宠物论坛，和万千宠友交流</p>
          <Link href="/register"><Button className="mt-3">免费注册</Button></Link>
        </div>
      )}
    </div>
  );
}
