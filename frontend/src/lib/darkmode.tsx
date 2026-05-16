'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'blue' | 'purple';

const THEMES: Theme[] = ['light', 'dark', 'blue', 'purple'];
const THEME_LABELS: Record<Theme, string> = { light: '☀️ 亮色', dark: '🌙 暗色', blue: '🔵 蓝色', purple: '🟣 紫色' };

const ThemeContext = createContext<{ theme: Theme; themes: typeof THEMES; labels: typeof THEME_LABELS; setTheme: (t: Theme) => void }>({
  theme: 'light', themes: THEMES, labels: THEME_LABELS, setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const t = stored || 'light';
    setThemeState(t);
    applyTheme(t);
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    root.className = root.className.replace(/dark|theme-blue|theme-purple/g, '').trim();
    if (t === 'dark') root.classList.add('dark');
    if (t === 'blue') root.classList.add('theme-blue');
    if (t === 'purple') root.classList.add('theme-purple');
    localStorage.setItem('theme', t);
  };

  const setTheme = (t: Theme) => { setThemeState(t); applyTheme(t); };

  if (!mounted) return <>{children}</>;

  return <ThemeContext.Provider value={{ theme, themes: THEMES, labels: THEME_LABELS, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
