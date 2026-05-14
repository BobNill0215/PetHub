'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { ProductCard } from '@/components/marketplace/ProductCard';

interface ProductItem {
  id: number;
  title: string;
  price: number;
  images: string[];
  city?: string;
  category: string;
  seller: { id: number; nickname: string };
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: ProductItem[] }>('/products')
      .then(r => setProducts(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">宠物商城</h1>
          <p className="mt-1 text-sm text-gray-500">宠物活体 · 宠物用品 · 二手闲置</p>
        </div>
        <Link href="/marketplace/new">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            + 发布商品
          </button>
        </Link>
      </div>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}

      {!loading && products.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">暂无商品</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map(p => (
          <Link key={p.id} href={`/marketplace/${p.id}`}>
            <ProductCard product={{
              id: p.id,
              title: p.title,
              price: p.price,
              image: p.images[0] || '',
              city: p.city,
            }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
