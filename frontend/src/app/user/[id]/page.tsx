'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { FeedCard } from '@/components/feed/FeedCard';
import { useAuthStore } from '@/stores/auth';

export default function UserPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<any>(null);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>(`/users/${id}`).then(r => { setProfile(r.data); setLoading(false); }).catch(() => setLoading(false));
    apiGet<any>(`/users/${id}/feeds`).then(r => setFeeds(r.data.data || [])).catch(() => {});
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">用户不存在</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Avatar name={profile.nickname} src={profile.avatar} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{profile.nickname}</h1>
            {profile.bio && <p className="text-sm text-gray-500 mt-1">{profile.bio}</p>}
            {profile.city && <p className="text-xs text-gray-400 mt-0.5">📍 {profile.city}</p>}
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <Link href={`/user/${id}/followers`} className="hover:text-blue-600"><strong className="text-gray-900">{profile.followerCount || 0}</strong> 粉丝</Link>
          <Link href={`/user/${id}/following`} className="hover:text-blue-600"><strong className="text-gray-900">{profile.followingCount || 0}</strong> 关注</Link>
          <span><strong className="text-gray-900">{feeds.length}</strong> 帖子</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {feeds.length === 0 ? <p className="text-center text-gray-400 py-8">暂无帖子</p> : feeds.map((f: any) => <FeedCard key={f.id} feed={f} />)}
      </div>
    </div>
  );
}
