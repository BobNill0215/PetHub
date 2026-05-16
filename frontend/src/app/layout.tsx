import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PetHub - 宠物社区',
  description: '宠物爱好者交流社区 · 分享萌宠日常 · 交流养宠经验',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: { capable: true, title: 'PetHub', statusBarStyle: 'default' },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className={`${inter.className} pb-16 md:pb-0 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
