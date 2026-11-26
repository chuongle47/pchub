'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminQuickSearch } from './AdminQuickSearch';
import { AdminToastProvider } from './AdminToast';
import { createClient } from '@/lib/supabase/client';
import { ShoppingCart, FileSpreadsheet, X } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
  userProfile: any;
}

export function AdminShell({ children, userProfile }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [liveNotice, setLiveNotice] = useState<{
    id: string;
    type: 'order' | 'quote';
    title: string;
    description: string;
  } | null>(null);

  const supabase = createClient();

  // If on /admin/login, render without sidebar & header
  const isLoginPage = pathname === '/admin/login';

  // Ensure .dark class from storefront does not leak into Admin Dashboard
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Listen to Supabase Realtime channel for new Orders and Quotes
  useEffect(() => {
    if (isLoginPage) return;

    const channel = supabase
      .channel('admin-realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as any;
          setLiveNotice({
            id: newOrder.id,
            type: 'order',
            title: '🎉 Có đơn hàng mới!',
            description: `Mã: ${newOrder.code} - ${Number(newOrder.total).toLocaleString('vi-VN')} ₫`,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quotes' },
        (payload) => {
          const newQuote = payload.new as any;
          setLiveNotice({
            id: newQuote.id,
            type: 'quote',
            title: '📋 Có yêu cầu báo giá mới!',
            description: `Khách hàng: ${newQuote.customer_name} (${newQuote.phone})`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoginPage, supabase]);

  useEffect(() => {
    if (liveNotice) {
      const timer = setTimeout(() => setLiveNotice(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [liveNotice]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex antialiased admin-shell overflow-x-clip">
        {/* Sidebar matching Stitch */}
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          userProfile={userProfile}
        />

        {/* Main Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] overflow-x-clip">
          <AdminHeader
            onOpenMobileSidebar={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            userProfile={userProfile}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-6 sm:p-8 max-w-[1400px] w-full mx-auto min-w-0 relative z-0 overflow-x-clip">
            {children}
          </main>

          {/* Footer matching Stitch design */}
          <footer className="px-6 sm:px-8 py-5 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © 2024 PCHub Admin Panel - System Version 2.4.0
            </div>
            <div className="flex items-center gap-6 text-slate-500">
              <Link href="/admin/settings" className="hover:text-slate-900 transition-colors">
                Documentation
              </Link>
              <Link href="/admin/contacts" className="hover:text-slate-900 transition-colors">
                Support
              </Link>
            </div>
          </footer>
        </div>

        {/* Quick Search Modal */}
        <AdminQuickSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Live Floating Notification */}
        {liveNotice && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-xl border border-slate-200/90 text-slate-900 max-w-sm">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  liveNotice.type === 'order'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {liveNotice.type === 'order' ? (
                  <ShoppingCart className="w-5 h-5" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900">{liveNotice.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {liveNotice.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href={liveNotice.type === 'order' ? '/admin/orders' : '/admin/quotes'}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    onClick={() => setLiveNotice(null)}
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setLiveNotice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminToastProvider>
  );
}
