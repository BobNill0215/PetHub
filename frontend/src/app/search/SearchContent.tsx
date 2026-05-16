'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { FeedCard } from '@/components/feed/FeedCard';
import { formatPrice } from '@/lib/utils';

interface SearchResult {
  feeds: any[];
  products: any[];
  users: any[];
  query: string;
}

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(q);
  const [tab, setTab] = useState<'all' | 'feeds' | 'products' | 'users'>('all');

  const doSearch = async (query: string, type: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await apiGet<SearchResult>('/search', { q: query, type });
      setResult(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    if (q) { setInput(q); doSearch(q, tab); }
  }, [q, tab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="搜索宠物、商品、用户..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm text-white hover:bg-blue-700">搜索</button>
        </div>
      </form>

      {loading && <p className="text-center text-gray-400 py-8">搜索中...</p>}

      {result && (
        <>
          {(['all', 'feeds', 'products', 'users'] as const).map(t => null)}
          <div className="mb-4 flex gap-2 text-sm">
            {(['all', 'feeds', 'products', 'users'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t === 'all' ? '全部' : t === 'feeds' ? '动态' : t === 'products' ? '商品' : '用户'}
              </button>
            ))}
          </div>

          {tab !== 'products' && result.users.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">用户</h2>
              <div className="space-y-2">
                {result.users.map((u: any) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-lg border bg-white p-3">
                    <Avatar name={u.nickname} src={u.avatar} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.nickname}</p>
                      {u.bio && <p className="text-xs text-gray-400">{u.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab !== 'users' && result.feeds.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">动态</h2>
              <div className="space-y-4">{result.feeds.map((f: any) => <FeedCard key={f.id} feed={f} />)}</div>
            </section>
          )}

          {tab !== 'feeds' && result.products.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">商品</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.products.map((p: any) => (
                  <div key={p.id} className="rounded-xl border bg-white p-3 shadow-sm">
                    <p className="text-sm font-medium text-gray-900">{p.title}</p>
                    <p className="text-lg font-bold text-red-500">{formatPrice(p.price)}</p>
                    {p.seller && <p className="text-xs text-gray-400">{p.seller.nickname}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!result.feeds.length && !result.products.length && !result.users.length && (
            <p className="text-center text-gray-400 py-8">未找到 "{result.query}" 相关的内容</p>
          )}
        </>
      )}
    </div>
  );
}
