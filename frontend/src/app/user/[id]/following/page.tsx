'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';

export default function FollowingPage() {
  const { id } = useParams();
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { apiGet<any>(`/users/${id}/following`).then(r => setUsers(r.data)).catch(() => {}); }, [id]);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href={`/user/${id}`} className="mb-4 block text-sm text-blue-600 hover:underline">← 返回主页</Link>
      <h1 className="mb-4 text-xl font-bold text-gray-900">关注</h1>
      {users.length === 0 ? <p className="text-gray-400 text-center py-8">暂未关注任何人</p> : users.map(u => (
        <Link key={u.id} href={`/user/${u.id}`} className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50">
          <Avatar name={u.nickname} src={u.avatar} size="sm" />
          <div><p className="text-sm font-medium text-gray-900">{u.nickname}</p>{u.bio && <p className="text-xs text-gray-400">{u.bio}</p>}</div>
        </Link>
      ))}
    </div>
  );
}
