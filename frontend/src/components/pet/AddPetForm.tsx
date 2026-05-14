'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { apiPost } from '@/lib/api';

export function AddPetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'CAT',
    breed: '',
    gender: 0,
    birthDate: '',
    weight: '',
    isNeutered: false,
    color: '',
    personalityTags: '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiPost('/pets', {
        ...form,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        birthDate: form.birthDate || undefined,
        personalityTags: form.personalityTags ? form.personalityTags.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [],
      });
      router.push('/pets');
    } catch (err: any) {
      setError(err.response?.data?.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <Input id="name" label="宠物名字" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">种类</label>
        <select
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="CAT">猫</option>
          <option value="DOG">狗</option>
          <option value="OTHER">其他</option>
        </select>
      </div>

      <Input id="breed" label="品种" placeholder="如：英短蓝猫" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
        <select
          value={form.gender}
          onChange={e => setForm({ ...form, gender: parseInt(e.target.value) })}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value={0}>未知</option>
          <option value={1}>男孩</option>
          <option value={2}>女孩</option>
        </select>
      </div>

      <Input id="birthDate" label="出生日期" type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
      <Input id="weight" label="体重(kg)" type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
      <Input id="color" label="毛色" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isNeutered"
          checked={form.isNeutered}
          onChange={e => setForm({ ...form, isNeutered: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="isNeutered" className="text-sm text-gray-700">已绝育</label>
      </div>

      <Input
        id="personalityTags"
        label="性格标签（逗号分隔）"
        placeholder="粘人, 爱睡觉, 活泼"
        value={form.personalityTags}
        onChange={e => setForm({ ...form, personalityTags: e.target.value })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
        <textarea
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading}>添加宠物</Button>
    </form>
  );
}
