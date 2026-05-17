'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';

export default function TopicsPage() {
  const [topics, setTopics] = useState<{ name: string; count: number }[]>([]);
  useEffect(() => { apiGet<{ name: string; count: number }[]>('/topics').then(r => setTopics(r.data)).catch(() => {}); }, []);

  const maxCount = Math.max(...topics.map(t => t.count), 1);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🏷️ 热门话题</h1>
      <div className="flex flex-wrap gap-3 justify-center">
        {topics.map(t => {
          const size = 0.7 + (t.count / maxCount) * 0.8;
          return (
            <Link key={t.name} href={`/topic?name=${encodeURIComponent(t.name)}`}
              className="rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 transition-all"
              style={{ fontSize: `${size * 0.875}rem` }}>
              #{t.name}
              <span className="ml-1 text-xs opacity-60">({t.count})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
