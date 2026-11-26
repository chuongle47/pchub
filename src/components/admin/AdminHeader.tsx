'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  userProfile?: {
    email?: string | null;
    full_name?: string | null;
    role?: string | null;
    avatar_url?: string | null;
  } | null;
  unreadCount?: number;
}

export function AdminHeader({
  onOpenMobileSidebar,
  onOpenSearch,
  userProfile,
  unreadCount = 0,
}: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profileOpen, setProfileOpen] = useState(false);

  // Global shortcut listener for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const displayName = userProfile?.full_name || 'Lê Văn Chương';
  const displayRole = userProfile?.role || 'Super Admin';
  const displayEmail = userProfile?.email || 'admin@pchub.vn';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left: Mobile hamburger & Clean Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Mở menu quản trị"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search input with proper icon padding and shortcut badge */}
        <div className="w-full relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            onClick={onOpenSearch}
            placeholder="Tìm đơn hàng, sản phẩm, khách hàng..."
            readOnly
            className="w-full h-10 pl-10 pr-16 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
            aria-label="Tìm kiếm trong hệ thống (nhấn Ctrl+K)"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 pointer-events-none shadow-2xs">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Notifications & User profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Link to live storefront */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200/90 transition-colors"
          title="Xem trang bán lẻ"
        >
          <span>Xem Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
          title="Thông báo hệ thống"
          aria-label="Thông báo hệ thống"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
          )}
        </button>

        {/* User Account Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2"
            title={displayName}
            aria-label="Tài khoản quản trị"
            aria-expanded={profileOpen}
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </button>

          {profileOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileOpen(false)}
              />

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {displayName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {displayRole}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 truncate block mt-0.5">
                    {displayEmail}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Cài đặt hệ thống & Bảo mật</span>
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Ghé thăm trang mua sắm</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Đăng xuất phiên làm việc</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
