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
  }, [isLoginPage]);

  // Auto hide live notice after 7s
  useEffect(() => {
    if (liveNotice) {
      const timer = setTimeout(() => setLiveNotice(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [liveNotice]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const currentYear = new Date().getFullYear();

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex antialiased admin-shell overflow-x-clip">
        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          userProfile={userProfile}
        />

        {/* Main Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-x-clip">
          <AdminHeader
            onOpenMobileSidebar={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            userProfile={userProfile}
          />

          {/* Main Content Area (Max width 1440px, padding 24px desktop / 16px mobile) */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto min-w-0 relative z-0 overflow-x-clip">
            {children}
          </main>

          {/* Global Admin Footer */}
          <footer className="px-4 py-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hệ thống: Trực tuyến
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">© {currentYear} PCHub Enterprise v2.4.0</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <Link href="/admin/settings" className="hover:text-blue-600 transition-colors">
                Cài đặt & Tài liệu
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/admin/contacts" className="hover:text-blue-600 transition-colors">
                Hỗ trợ kỹ thuật
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/" target="_blank" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                Xem Cửa hàng ↗
              </Link>
            </div>
          </footer>
        </div>

        {/* Quick Search Dialog (⌘K) */}
        <AdminQuickSearch
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        {/* Live Realtime Notification Pop */}
        {liveNotice && (
          <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3.5 p-4 rounded-2xl bg-white/95 border border-blue-500/30 shadow-2xl backdrop-blur-md max-w-sm animate-in slide-in-from-bottom-5 duration-300 ring-4 ring-blue-500/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
              {liveNotice.type === 'order' ? (
                <ShoppingCart className="w-5 h-5 text-white" />
              ) : (
                <FileSpreadsheet className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <h4 className="text-xs font-bold text-slate-900">{liveNotice.title}</h4>
              </div>
              <p className="text-xs text-slate-600 mt-1 truncate font-medium">{liveNotice.description}</p>
            </div>
            <button
              onClick={() => setLiveNotice(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AdminToastProvider>
  );
}
