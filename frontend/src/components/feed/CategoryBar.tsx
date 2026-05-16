'use client';

import Link from 'next/link';

const CATEGORIES = [
  { id: '', name: '全部', icon: '🌐' },
  { id: 'cat', name: '猫咪', icon: '🐱' },
  { id: 'dog', name: '狗狗', icon: '🐶' },
  { id: 'smallpet', name: '小宠', icon: '🐰' },
  { id: 'aquatic', name: '水族', icon: '🐟' },
  { id: 'reptile', name: '爬虫', icon: '🦎' },
  { id: 'insect', name: '昆虫', icon: '🐜' },
  { id: 'general', name: '综合', icon: '💬' },
];

export function CategoryBar({ current }: { current?: string }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map(c => {
        const active = !current ? c.id === '' : c.id === current;
        const href = c.id ? `/category/${c.id}` : '/feed';
        return (
          <Link key={c.id} href={href}
            className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${
              active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <span>{c.icon}</span>
            <span>{c.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
