'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/auth';
import { timeAgo } from '@/lib/utils';

interface Conversation {
  id: number;
  user1: { id: number; nickname: string; avatar?: string };
  user2: { id: number; nickname: string; avatar?: string };
  lastMsgAt: string;
  messages: { content: string; createdAt: string }[];
}

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiGet<Conversation[]>('/conversations')
      .then(r => setConvs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="text-center py-20 text-gray-500">请先登录</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">消息</h1>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}

      {!loading && convs.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">暂无消息</p>
          <p className="mt-2 text-sm text-gray-400">去用户主页点击"发消息"开始聊天</p>
        </div>
      )}

      <div className="space-y-1">
        {convs.map(c => {
          const other = Number(c.user1.id) === user.id ? c.user2 : c.user1;
          const last = c.messages[0];
          return (
            <Link key={c.id} href={`/messages/${c.id}`}
              className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-50">
              <Avatar name={other.nickname} src={other.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{other.nickname}</p>
                {last && (
                  <p className="truncate text-sm text-gray-500">{last.content}</p>
                )}
              </div>
              {c.lastMsgAt && (
                <span className="text-xs text-gray-400 shrink-0">{timeAgo(c.lastMsgAt)}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
