'use client';

'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { FeedCard } from '@/components/feed/FeedCard';

function TopicContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) return;
    apiGet<any>('/feeds')
      .then(r => setFeeds((r.data.data || []).filter((f: any) => f.topics?.includes(name))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [name]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/feed" className="mb-4 block text-sm text-blue-600 hover:underline">← 返回动态</Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">#{name}</h1>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}
      {!loading && feeds.length === 0 && <p className="text-center text-gray-400 py-8">该话题暂无动态</p>}

      <div className="space-y-4">
        {feeds.map((f: any) => <FeedCard key={f.id} feed={f} />)}
      </div>
    </div>
  );
}

export default function TopicPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">加载中...</div>}>
      <TopicContent />
    </Suspense>
  );
}
