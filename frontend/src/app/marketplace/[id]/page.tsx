'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { formatPrice } from '@/lib/utils';

interface ProductDetail {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description?: string;
  category: string;
  city?: string;
  stock: number;
  seller: { id: number; nickname: string; avatar?: string; city?: string };
  createdAt: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ProductDetail>(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!product) return <div className="text-center py-20 text-gray-500">商品不存在</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-4 text-sm text-blue-600 hover:underline">← 返回</button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
          {product.images[0] ? (
            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">暂无图片</div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          <p className="mt-2 text-3xl font-bold text-red-500">{formatPrice(product.price)}</p>
          {product.originalPrice && (
            <p className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Avatar name={product.seller.nickname} src={product.seller.avatar} size="sm" />
            <span className="text-sm text-gray-600">{product.seller.nickname}</span>
            {product.city && <span className="text-xs text-gray-400">📍 {product.city}</span>}
          </div>

          <div className="mt-4 flex gap-2 text-xs">
            <span className="rounded bg-blue-50 px-2 py-1 text-blue-600">
              {product.category === 'PET_FOOD' ? '宠物食品' : product.category === 'SUPPLIES' ? '宠物用品' : product.category === 'PET_LIVE' ? '活体宠物' : '二手闲置'}
            </span>
            {product.stock > 0 && <span className="rounded bg-green-50 px-2 py-1 text-green-600">库存 {product.stock}</span>}
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">商品描述</h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          <Button className="mt-8 w-full" size="lg">联系卖家</Button>
        </div>
      </div>
    </div>
  );
}
