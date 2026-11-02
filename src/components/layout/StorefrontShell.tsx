'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import { Providers } from '@/app/providers';

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // If inside Admin portal, render clean dark shell without storefront chrome
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </div>
    );
  }

  // Otherwise render storefront chrome with Header, Footer, and floating widgets
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Providers>
        <Suspense fallback={<div style={{ height: '88px', background: '#0f172a' }} />}>
          <Header />
        </Suspense>
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        <BottomNav />
      </Providers>
    </div>
  );
}
