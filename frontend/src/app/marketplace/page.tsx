'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/auth';

export default function MarketplacePage() {
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>('/products')
      .then(r => setProducts(r.data.data || []))
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
        {user && (
          <Link href="/marketplace/new"><Button size="sm">+ 发布商品</Button></Link>
        )}
      </div>

      {loading && <p className="text-center text-gray-400 py-8">加载中...</p>}

      {!loading && products.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">暂无商品</p>
          {!user && (
            <div className="mt-4">
              <Link href="/register"><Button>注册后发布商品</Button></Link>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p: any) => (
          <Link key={p.id} href={`/marketplace/${p.id}`}>
            <ProductCard product={{ id: p.id, title: p.title, price: p.price, image: p.images?.[0] || '', city: p.city }} />
          </Link>
        ))}
      </div>

      {!user && products.length > 0 && (
        <div className="mt-8 text-center rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 p-6">
          <p className="text-gray-700">登录后即可发布商品、联系卖家</p>
          <Link href="/register"><Button className="mt-3">免费注册</Button></Link>
        </div>
      )}
    </div>
  );
}
