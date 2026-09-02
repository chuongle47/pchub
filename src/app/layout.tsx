import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from './providers';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'PCHub — Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
  description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
  keywords: ['so sanh linh kien', 'pc builder', 'xay dung cau hinh', 'cpu', 'gpu', 'pchub'],
  authors: [{ name: 'Lê Văn Chương' }],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <Providers>
          <Suspense fallback={<div style={{ height: '88px', background: '#0f172a' }} />}>
            <Header />
          </Suspense>
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
