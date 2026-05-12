'use client';

import { ProductCard } from './ProductCard';

const mockProducts = [
  { id: 1, title: '皇家猫粮 K36 2kg', price: 12800, image: 'https://picsum.photos/seed/petfood/400/400', city: '北京' },
  { id: 2, title: '英短蓝猫 3个月 已打疫苗', price: 250000, image: 'https://picsum.photos/seed/cat2/400/400', city: '上海' },
  { id: 3, title: '宠物自动喂食器 9成新', price: 8900, image: 'https://picsum.photos/seed/feeder/400/400', city: '深圳' },
  { id: 4, title: '狗笼 大型犬 全新', price: 35900, image: 'https://picsum.photos/seed/cage/400/400', city: '广州' },
  { id: 5, title: '渴望六种鱼狗粮 6kg', price: 38900, image: 'https://picsum.photos/seed/dogfood/400/400', city: '杭州' },
  { id: 6, title: '金毛幼犬 双血统', price: 350000, image: 'https://picsum.photos/seed/golden/400/400', city: '成都' },
];

export function ProductGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {mockProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
