'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { FeedCard } from '@/components/feed/FeedCard';
import { useAuthStore } from '@/stores/auth';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [feed, setFeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchFeed = () => {
    apiGet<any>(`/feeds/${id}`)
      .then(r => { setFeed(r.data); setEditContent(r.data.content); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeed(); }, [id]);

  const handleEdit = async () => {
    setSaving(true);
    try { await apiPut(`/feeds/${id}`, { content: editContent }); setEditing(false); fetchFeed(); } catch { /* ignore */ }
    setSaving(false);
  };

  const handleBookmark = async () => {
    try { await apiPost(`/feeds/${id}/bookmark`); } catch { /* ignore */ }
  };

  const handleReport = async () => {
    const reason = prompt('请描述举报原因：');
    if (!reason) return;
    try { await apiPost(`/feeds/${id}/report`, { reason }); alert('举报已提交'); } catch { /* ignore */ }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!feed) return <div className="text-center py-20 text-gray-500">帖子不存在</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-4 text-sm text-blue-600 hover:underline">← 返回</button>

      {editing ? (
        <div className="rounded-xl border bg-white p-4">
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={8}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <div className="mt-3 flex gap-2">
            <Button size="sm" loading={saving} onClick={handleEdit}>保存</Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>取消</Button>
          </div>
        </div>
      ) : (
        <FeedCard feed={feed} />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {user && Number(feed.userId) === user.id && !editing && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>编辑</Button>
            <Button variant="danger" size="sm" onClick={async () => {
              if (!confirm('确定删除？')) return;
              try { await apiDelete(`/feeds/${id}`); router.push('/feed'); } catch { /* ignore */ }
            }}>删除</Button>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={handleBookmark}>收藏</Button>
        <Button variant="ghost" size="sm" onClick={async () => {
          try { await apiPost(`/feeds/${id}/pin`); fetchFeed(); } catch { /* ignore */ }
        }}>{feed.isPinned ? '取消置顶' : '置顶'}</Button>
        <Button variant="ghost" size="sm" onClick={async () => {
          try { await apiPost(`/feeds/${id}/featured`); fetchFeed(); } catch { /* ignore */ }
        }}>{feed.isFeatured ? '取消精华' : '精华'}</Button>
        <button onClick={handleReport} className="text-xs text-gray-400 hover:text-red-500 ml-auto">举报</button>
      </div>
    </div>
  );
}
