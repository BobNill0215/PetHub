'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

const NAV_ITEMS = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/feed', label: '论坛', icon: '📝' },
  { href: '/marketplace', label: '好物', icon: '🛒' },
  { href: '/topics', label: '话题', icon: '🏷️' },
  { href: '/profile', label: '我的', icon: '👤' },
];

export function MobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white dark:bg-gray-900 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const isProfile = item.href === '/profile';
          const href = isProfile && !user ? '/login' : item.href;
          return (
            <Link key={item.href} href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
