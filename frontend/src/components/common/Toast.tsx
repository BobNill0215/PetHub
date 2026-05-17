'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast { id: number; message: string; type: ToastType; }

const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void }>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let id = 0;

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const tid = ++id;
    setToasts(prev => [...prev, { id: tid, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== tid)), 2500);
  }, []);

  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={cn('text-white px-4 py-2.5 rounded-lg shadow-lg text-sm animate-[fadeIn_0.2s] transition-all', colors[t.type])}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
