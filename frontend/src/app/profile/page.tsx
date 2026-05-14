'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { apiGet } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { FeedCard } from '@/components/feed/FeedCard';
import type { Pet, Feed } from '@/types';

interface ProfileData {
  id: number;
  nickname: string;
  avatar?: string;
  bio?: string;
  city?: string;
  pets: Pet[];
  feedCount: number;
  followerCount: number;
  followingCount: number;
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    if (!user) return;
    apiGet<ProfileData>(`/users/${user.id}`).then(r => setProfile(r.data));
    apiGet<{ data: Feed[] }>(`/users/${user.id}/feeds`).then(r => setFeeds(r.data.data));
  }, [user]);

  if (!user) return <div className="text-center py-20 text-gray-500">请先登录</div>;
  if (!profile) return <div className="text-center py-20 text-gray-400">加载中...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar name={profile.nickname} src={profile.avatar} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile.nickname}</h1>
            {profile.bio && <p className="text-sm text-gray-500">{profile.bio}</p>}
            {profile.city && <p className="text-xs text-gray-400">📍 {profile.city}</p>}
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <span><strong className="text-gray-900">{profile.feedCount}</strong> 动态</span>
          <span><strong className="text-gray-900">{profile.followerCount}</strong> 粉丝</span>
          <span><strong className="text-gray-900">{profile.followingCount}</strong> 关注</span>
        </div>
      </div>

      {profile.pets.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">我的宠物</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profile.pets.map(pet => (
              <div key={pet.id} className="rounded-lg border bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Avatar name={pet.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{pet.name}</p>
                    <p className="text-xs text-gray-400">{pet.breed || pet.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">动态</h2>
        {feeds.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无动态</p>
        ) : (
          <div className="space-y-4">
            {feeds.map(feed => <FeedCard key={feed.id} feed={feed} />)}
          </div>
        )}
      </div>
    </div>
  );
}
