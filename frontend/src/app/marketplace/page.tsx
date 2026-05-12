import { ProductGrid } from '@/components/marketplace/ProductGrid';

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">宠物商城</h1>
        <p className="mt-1 text-sm text-gray-500">宠物活体 · 宠物用品 · 二手闲置</p>
      </div>
      <ProductGrid />
    </div>
  );
}
