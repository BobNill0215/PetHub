'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { apiGet, apiPut } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FeedCard } from '@/components/feed/FeedCard';
import type { Pet, Feed } from '@/types';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { fetchProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nickname: '', bio: '', city: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [tab, setTab] = useState<'feeds' | 'pets'>('feeds');

  useEffect(() => {
    if (!user) return;
    setForm({ nickname: user.nickname, bio: user.bio || '', city: user.city || '', avatar: user.avatar || '' });
    apiGet<Pet[]>('/pets').then(r => setPets(r.data)).catch(() => {});
    apiGet<{ data: Feed[] }>('/feeds').then(r => setFeeds(r.data.data)).catch(() => {});
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
                <h1 className="text-xl font-bold text-gray-900">{user.nickname}</h1>
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
          <Link href="/settings" className="text-blue-600 hover:underline ml-auto">设置</Link>
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
