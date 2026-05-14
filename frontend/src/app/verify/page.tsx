'use client';

import { Suspense } from 'react';
import { VerifyContent } from './VerifyContent';

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
