'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { apiGet, apiDelete } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import type { Pet } from '@/types';

export default function PetsPage() {
  const user = useAuthStore((s) => s.user);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPets = async () => {
    if (!user) return;
    try {
      const res = await apiGet<Pet[]>('/pets');
      setPets(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPets(); }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    try {
      await apiDelete(`/pets/${id}`);
      setPets(pets.filter(p => p.id !== id));
    } catch {
      // ignore
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-gray-500">请先登录</p>
        <Link href="/login"><Button className="mt-4">去登录</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">我的宠物</h1>
        <Link href="/pets/add"><Button size="sm">+ 添加宠物</Button></Link>
      </div>

      {loading && <p className="text-gray-400">加载中...</p>}

      {!loading && pets.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">还没有添加宠物</p>
          <Link href="/pets/add"><Button className="mt-4">添加第一只宠物</Button></Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <div key={pet.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name={pet.name} size="md" />
              <div>
                <p className="font-medium text-gray-900">{pet.name}</p>
                <p className="text-xs text-gray-400">
                  {pet.type === 'CAT' ? '猫' : pet.type === 'DOG' ? '狗' : '其他'}
                  {pet.breed && ` · ${pet.breed}`}
                </p>
              </div>
            </div>
            {pet.personalityTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {pet.personalityTags.map(tag => (
                  <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {pet.bio && <p className="mt-2 text-xs text-gray-500">{pet.bio}</p>}
            <button
              onClick={() => handleDelete(pet.id)}
              className="mt-3 text-xs text-red-400 hover:text-red-600"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
