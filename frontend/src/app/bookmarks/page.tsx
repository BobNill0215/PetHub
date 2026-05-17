'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/auth';

export default function BookmarksPage() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { if (user) apiGet<any>('/bookmarks').then(r => setItems(r.data.data || [])).catch(() => {}); }, [user]);

  if (!user) return <div className="text-center py-20 text-gray-500">请先登录</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">⭐ 我的收藏</h1>
      {items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center">
          <p className="text-gray-500">还没有收藏的帖子</p>
          <Link href="/feed" className="mt-4 inline-block text-blue-600 text-sm">去发现内容</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="rounded-xl border bg-white p-4 shadow-sm flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <Link href={`/post/${item.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                  {item.content}
                </Link>
                <p className="text-xs text-gray-400 mt-1">{item.user?.nickname}</p>
              </div>
              <button onClick={async () => {
                try { await apiDelete(`/feeds/${item.id}/bookmark`); setItems(items.filter(i => i.id !== item.id)); } catch {}
              }} className="text-xs text-red-400 hover:text-red-600 shrink-0">取消收藏</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
