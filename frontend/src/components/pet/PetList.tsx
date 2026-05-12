'use client';

import { useAuthStore } from '@/stores/auth';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';

export function PetList() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <p className="text-sm text-gray-500">请先登录</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">还没有添加宠物</p>
        <Button className="mt-4">添加宠物</Button>
      </div>
    </div>
  );
}
