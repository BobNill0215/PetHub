'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { FeedCard } from '@/components/feed/FeedCard';
import { CategoryBar } from '@/components/feed/CategoryBar';

const CATEGORY_NAMES: Record<string, string> = {
  cat: '猫咪', dog: '狗狗', smallpet: '小宠', aquatic: '水族', reptile: '爬虫', insect: '昆虫', general: '综合讨论',
};

export default function CategoryPage() {
  const { id } = useParams();
  const catId = String(id);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>('/feeds', { category: catId })
      .then(r => setFeeds(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{CATEGORY_NAMES[catId] || catId} 板块</h1>
      </div>
      <CategoryBar current={catId} />
      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}
      {!loading && feeds.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center mt-4">
          <p className="text-gray-500">该板块暂无帖子</p>
          <Link href="/feed/new"><button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">发帖</button></Link>
        </div>
      )}
      <div className="mt-4 space-y-4">
        {feeds.map((f: any) => <FeedCard key={f.id} feed={f} />)}
      </div>
    </div>
  );
}
