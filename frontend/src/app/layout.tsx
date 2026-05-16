import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PetHub - 宠物社区',
  description: '宠物爱好者交流社区 · 宠物照片视频分享 · 宠物和宠物用品交易平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} pb-16 md:pb-0`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50 dark:bg-gray-950">{children}</main>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
