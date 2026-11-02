import type { Metadata } from 'next';
import './globals.css';
import StorefrontShell from '@/components/layout/StorefrontShell';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pchub-iota.vercel.app'),
  title: 'PCHub – Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
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
    title: 'PCHub – Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
    description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'PCHub – Linh kiện PC và PC Builder AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PCHub – Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
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
    <html lang="vi" suppressHydrationWarning className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap&subset=vietnamese,latin-ext"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="bg-slate-950 font-sans text-slate-100 min-h-screen">
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}
