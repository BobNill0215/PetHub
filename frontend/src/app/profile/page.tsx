'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { apiGet, apiPut, apiPost } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FeedCard } from '@/components/feed/FeedCard';
import { getUserLevel } from '@/lib/levels';
import type { Pet, Feed } from '@/types';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { fetchProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nickname: '', bio: '', city: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [stats, setStats] = useState<any>({});
  const [checkin, setCheckin] = useState<any>({});
  const [tab, setTab] = useState<'feeds' | 'pets'>('feeds');

  useEffect(() => {
    if (!user) return;
    setForm({ nickname: user.nickname, bio: user.bio || '', city: user.city || '', avatar: user.avatar || '' });
    apiGet<Pet[]>('/pets').then(r => setPets(r.data)).catch(() => {});
    apiGet<{ data: Feed[] }>('/feeds').then(r => setFeeds(r.data.data)).catch(() => {});
    apiGet<any>(`/users/${user.id}`).then(r => { setFollowerCount(r.data.followerCount || 0); setFollowingCount(r.data.followingCount || 0); setPoints(r.data.points || 0); }).catch(() => {});
    apiGet<any>(`/users/${user.id}/stats`).then(r => setStats(r.data)).catch(() => {});
    apiGet<any>('/checkin').then(r => setCheckin(r.data)).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/users/me/profile', form);
      await fetchProfile();
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (!user) return (
    <div className="mx-auto max-w-sm px-4 py-20 text-center">
      <div className="text-6xl mb-6">🐾</div>
      <h1 className="text-2xl font-bold text-gray-900">创建你的个人主页</h1>
      <p className="mt-3 text-gray-500">展示你的宠物、分享动态、管理商品</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/register"><Button>免费注册</Button></Link>
        <Link href="/login"><Button variant="secondary">登录</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Avatar name={user.nickname} src={user.avatar} size="lg" />
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <Input label="昵称" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
                <Input label="简介" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                <Input label="城市" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                <Input label="头像 URL" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} />
                <div className="flex gap-2">
                  <Button size="sm" loading={saving} onClick={handleSave}>保存</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>取消</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{user.nickname}</h1>
                  {(() => { const lv = getUserLevel(user.feedCount || 0, 0); return <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{lv.icon} {lv.title}</span> })()}
                </div>
                {user.bio && <p className="text-sm text-gray-500">{user.bio}</p>}
                {user.city && <p className="text-xs text-gray-400">📍 {user.city}</p>}
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => setEditing(true)}>
                  编辑资料
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <span><strong className="text-gray-900">{feeds.length}</strong> 帖子</span>
          <span><strong className="text-gray-900">{pets.length}</strong> 宠物</span>
          <Link href={`/user/${user.id}/following`} className="hover:text-blue-600"><strong className="text-gray-900">{followingCount}</strong> 关注</Link>
          <Link href={`/user/${user.id}/followers`} className="hover:text-blue-600"><strong className="text-gray-900">{followerCount}</strong> 粉丝</Link>
          <Link href="/settings" className="text-blue-600 hover:underline ml-auto">设置</Link>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gray-400 items-center">
          <button onClick={async () => {
            try { const r = await apiPost<any>('/checkin'); setCheckin(r.data || { checkedIn: true }); } catch {}
          }} className={`px-3 py-1 rounded-full ${checkin.checkedIn ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
            {checkin.checkedIn ? `✅ 已签到 ${checkin.streak}天` : '📅 签到'}
          </button>
          <span>⭐ {points} 积分</span>
          <span>❤️ 获赞 {stats.totalLikes || 0}</span>
          <span>💬 评论 {stats.commentCount || 0}</span>
          <span>👀 浏览 {(stats.totalLikes || 0) * 3 + (stats.feedCount || 0) * 10}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b">
        {(['feeds', 'pets'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'feeds' ? '动态' : '宠物'}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'feeds' ? (
          feeds.length === 0 ? <p className="text-gray-400 text-sm py-4">暂无动态</p>
            : <div className="space-y-4">{feeds.map(f => <FeedCard key={f.id} feed={f} />)}</div>
        ) : (
          pets.length === 0 ? <p className="text-gray-400 text-sm py-4">暂无宠物</p>
            : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pets.map(pet => (
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
        )}
      </div>
    </div>
  );
}
