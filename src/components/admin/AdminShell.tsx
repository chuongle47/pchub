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
  const currentYear = new Date().getFullYear();

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
      <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex antialiased admin-shell overflow-x-hidden">
        {/* Sidebar matching Stitch */}
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          userProfile={userProfile}
        />

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] overflow-x-hidden">
          <AdminHeader
            onOpenMobileSidebar={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            userProfile={userProfile}
          />

          {/* Main Content Area - Guaranteed 24-32px padding (16px on mobile) from sidebar and right edge */}
          <main
            style={{ padding: '28px 32px' }}
            className="flex-1 w-full min-w-0 relative z-0 admin-main-content"
          >
            {children}
          </main>

          {/* Footer - Dynamic Year & Responsive */}
          <footer className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © {currentYear} PCHub Admin Panel — Hệ thống Quản trị v2.4.0
            </div>
            <div className="flex items-center gap-6 text-slate-500">
              <Link href="/admin/settings" className="hover:text-blue-600 transition-colors">
                Tài liệu hướng dẫn
              </Link>
              <Link href="/admin/contacts" className="hover:text-blue-600 transition-colors">
                Hỗ trợ kỹ thuật
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
                type="button"
                onClick={() => setLiveNotice(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Đóng thông báo"
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
