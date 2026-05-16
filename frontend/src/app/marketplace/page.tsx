'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/auth';

interface LinkItem { title: string; url: string }
interface FeedWithLinks {
  id: number;
  content: string;
  links: LinkItem[];
  images: string[];
  user: { nickname: string; avatar?: string };
  createdAt: string;
}

export default function MarketplacePage() {
  const user = useAuthStore((s) => s.user);
  const [feeds, setFeeds] = useState<FeedWithLinks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>('/feeds')
      .then(r => {
        const all = r.data.data || [];
        setFeeds(all.filter((f: any) => f.links && f.links.length > 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🛒 好物推荐</h1>
        <p className="mt-1 text-sm text-gray-500">宠友们推荐的好用商品，附购物链接</p>
      </div>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}

      {!loading && feeds.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">还没有好物推荐</p>
          {user ? (
            <Link href="/feed/new" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
              发帖推荐商品
            </Link>
          ) : (
            <Link href="/register" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
              注册后推荐商品
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {feeds.map(f => (
          <div key={f.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Avatar name={f.user.nickname} src={f.user.avatar} size="sm" />
              <span className="text-sm font-medium text-gray-900">{f.user.nickname}</span>
            </div>
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{f.content}</p>
            <div className="space-y-2">
              {f.links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 hover:bg-orange-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-orange-800 truncate">{link.title}</p>
                    <p className="text-xs text-orange-500 truncate">{link.url}</p>
                  </div>
                  <span className="text-sm text-orange-600 shrink-0">去购买 →</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
