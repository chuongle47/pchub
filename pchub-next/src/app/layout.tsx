import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PCHub — Linh kiện PC chính hãng',
  description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
