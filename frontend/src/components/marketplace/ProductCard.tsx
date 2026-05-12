'use client';

import { MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    image: string;
    city?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group cursor-pointer rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-gray-900">{product.title}</h3>
        <p className="mt-1 text-lg font-bold text-red-500">{formatPrice(product.price)}</p>
        {product.city && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3" />
            {product.city}
          </p>
        )}
      </div>
    </div>
  );
}
