'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FeedCard } from '@/components/feed/FeedCard';
import { useAuthStore } from '@/stores/auth';
import { timeAgo } from '@/lib/utils';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [feed, setFeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>(`/feeds/${id}`)
      .then(r => setFeed(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!feed) return <div className="text-center py-20 text-gray-500">帖子不存在</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-4 text-sm text-blue-600 hover:underline">← 返回</button>

      <FeedCard feed={feed} />

      {user && Number(feed.userId) === user.id && (
        <div className="mt-4 flex gap-2">
          <Button variant="danger" size="sm" onClick={async () => {
            if (!confirm('确定删除？')) return;
            try { await apiDelete(`/feeds/${id}`); router.push('/feed'); } catch { /* ignore */ }
          }}>删除帖子</Button>
        </div>
      )}
    </div>
  );
}
