'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { FeedCard } from '@/components/feed/FeedCard';
import { useAuthStore } from '@/stores/auth';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [feed, setFeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFeed = () => {
    apiGet<any>(`/feeds/${id}`)
      .then(r => setFeed(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeed(); }, [id]);

  const togglePin = async () => {
    try { await apiPost(`/feeds/${id}/pin`); fetchFeed(); } catch { /* ignore */ }
  };

  const toggleFeatured = async () => {
    try { await apiPost(`/feeds/${id}/featured`); fetchFeed(); } catch { /* ignore */ }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!feed) return <div className="text-center py-20 text-gray-500">帖子不存在</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-4 text-sm text-blue-600 hover:underline">← 返回</button>

      <FeedCard feed={feed} />

      <div className="mt-4 flex flex-wrap gap-2">
        {user && Number(feed.userId) === user.id && (
          <Button variant="danger" size="sm" onClick={async () => {
            if (!confirm('确定删除？')) return;
            try { await apiDelete(`/feeds/${id}`); router.push('/feed'); } catch { /* ignore */ }
          }}>删除帖子</Button>
        )}
        <Button variant="ghost" size="sm" onClick={togglePin}>
          {feed.isPinned ? '取消置顶' : '置顶'}
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleFeatured}>
          {feed.isFeatured ? '取消精华' : '设为精华'}
        </Button>
      </div>
    </div>
  );
}
