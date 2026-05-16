'use client';

import { Suspense } from 'react';
import { SearchContent } from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">加载中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
