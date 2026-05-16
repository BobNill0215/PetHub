'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { ThemeProvider } from '@/lib/darkmode';

export function Providers({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
