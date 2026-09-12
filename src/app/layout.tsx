import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from './providers';
import { Suspense } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL('https://pchub-iota.vercel.app'),
  title: 'PCHub — Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
  description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
  keywords: ['so sanh linh kien', 'pc builder', 'xay dung cau hinh', 'cpu', 'gpu', 'pchub'],
  authors: [{ name: 'PCHub Technology' }],
  creator: 'PCHub Team',
  publisher: 'PCHub',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://pchub-iota.vercel.app',
    siteName: 'PCHub',
    title: 'PCHub — Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
    description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'PCHub — Linh kiện PC và PC Builder AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PCHub — Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
    description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
    images: ['/images/hero-bg.jpg'],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PCHub Technology',
  url: 'https://pchub-iota.vercel.app',
  logo: 'https://pchub-iota.vercel.app/images/logo.png',
  description: 'Hệ thống phân phối linh kiện máy tính và giải pháp build PC thông minh tích hợp AI hàng đầu Việt Nam.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+84-1900-8888',
    contactType: 'customer service',
    areaServed: 'VN',
    availableLanguage: ['Vietnamese', 'English'],
  },
  sameAs: [
    'https://facebook.com/pchub',
    'https://youtube.com/pchub',
    'https://instagram.com/pchub',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
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
