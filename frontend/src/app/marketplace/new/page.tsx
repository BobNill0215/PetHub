'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ImageUpload } from '@/components/common/ImageUpload';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function NewProductPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: 'SUPPLIES',
    price: '',
    originalPrice: '',
    stock: '1',
    description: '',
    city: '',
    imageUrl: '',
    images: [] as string[],
  });

  if (!user) {
    return <div className="text-center py-20 text-gray-500">请先登录</div>;
  }

  const addImage = () => {
    if (form.imageUrl && form.images.length < 9) {
      setForm({ ...form, images: [...form.images, form.imageUrl], imageUrl: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiPost('/products', {
        title: form.title,
        category: form.category,
        price: Math.round(parseFloat(form.price) * 100),
        originalPrice: form.originalPrice ? Math.round(parseFloat(form.originalPrice) * 100) : undefined,
        stock: parseInt(form.stock),
        images: form.images,
        description: form.description,
        city: form.city,
      });
      router.push('/marketplace');
    } catch (err: any) {
      setError(err.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">发布商品</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <Input id="title" label="商品名称" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="PET_FOOD">宠物食品</option>
            <option value="SUPPLIES">宠物用品</option>
            <option value="PET_LIVE">活体宠物</option>
            <option value="SECONDHAND">二手闲置</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input id="price" label="价格 (元)" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
          <Input id="originalPrice" label="原价 (元)" type="number" step="0.01" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} />
        </div>

        <Input id="stock" label="库存" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
        <Input id="city" label="所在城市" placeholder="如：北京" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={4} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <ImageUpload images={form.images} onChange={v => setForm({ ...form, images: v })} />

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">发布商品</Button>
      </form>
    </div>
  );
}
