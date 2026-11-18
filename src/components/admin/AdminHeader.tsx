'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Shield,
  Sun,
  Moon,
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
  const [isDark, setIsDark] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const userName = userProfile?.full_name || 'Quản Trị Viên';
  const initialLetter = userName.trim().charAt(0).toUpperCase() || 'A';
  const userRole =
    userProfile?.role === 'admin'
      ? 'Quản trị viên cấp cao'
      : userProfile?.role === 'manager'
      ? 'Quản lý cửa hàng'
      : userProfile?.role === 'support'
      ? 'Nhân viên hỗ trợ'
      : 'Quản trị viên cấp cao';

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left section: mobile hamburger & search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Mở danh mục điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar - Matches Stitch Mockup */}
        <div className="w-full max-w-[340px]">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center h-9 px-3.5 bg-slate-50/80 hover:bg-slate-100 border border-slate-200/90 rounded-lg text-xs text-slate-400 text-left transition-all group cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            <span className="truncate flex-1 ml-2.5 text-slate-400 group-hover:text-slate-600">
              Tìm kiếm...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200 shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right section: theme toggle, notifications & user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          aria-label="Đổi giao diện"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
          title="Thông báo hệ thống"
          aria-label="Xem thông báo"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tài khoản cá nhân"
            aria-label="Menu tài khoản"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {initialLetter}
            </div>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-40 text-slate-700 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {userName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {userProfile?.email || 'admin@pchub.vn'}
                  </div>
                  <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {userRole}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/admin/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Cài đặt hệ thống</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Đăng xuất</span>
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
