'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminQuickSearch } from './AdminQuickSearch';
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex antialiased">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        userProfile={userProfile}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        <AdminHeader
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          userProfile={userProfile}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl w-full mx-auto relative z-0">
          {children}
        </main>

        {/* Footer matching screenshot */}
        <footer className="px-4 py-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            © 2024 PCHub Admin Panel - System Version 2.4.0
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/settings" className="hover:text-slate-600 transition-colors">
              Documentation
            </Link>
            <span>•</span>
            <Link href="/admin/contacts" className="hover:text-slate-600 transition-colors">
              Support
            </Link>
          </div>
        </footer>
      </div>

      {/* Quick Search Dialog */}
      <AdminQuickSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Live Realtime Notification Pop */}
      {liveNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl bg-white border border-blue-500/40 shadow-2xl backdrop-blur-md max-w-sm animate-in slide-in-from-bottom-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            {liveNotice.type === 'order' ? (
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            ) : (
              <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900">{liveNotice.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5 truncate">{liveNotice.description}</p>
          </div>
          <button
            onClick={() => setLiveNotice(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
