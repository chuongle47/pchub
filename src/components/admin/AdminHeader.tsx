'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Shield,
  Sun,
  Moon,
  ExternalLink,
  ChevronDown,
  Sparkles,
  UserCheck,
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
    <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors">
      {/* Left section: mobile hamburger & search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Mở danh mục điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Min-width 360px on desktop) */}
        <div className="w-full max-w-[360px] sm:max-w-[440px]">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center h-10 px-3.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-400/60 rounded-xl text-xs text-slate-400 text-left transition-all shadow-2xs group cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            <span className="truncate flex-1 ml-2.5 text-slate-400 group-hover:text-slate-700 font-normal">
              Tìm nhanh đơn hàng, sản phẩm, báo giá...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white rounded-md border border-slate-200 shadow-2xs shrink-0 group-hover:border-slate-300">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right section: Storefront button, theme toggle, notifications & user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick link to Storefront */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-medium text-slate-700 shadow-2xs transition-all group"
          title="Mở giao diện khách hàng ngoài trang chủ"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
          <span>Xem Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          aria-label="Đổi giao diện"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
          title="Thông báo hệ thống"
          aria-label="Xem thông báo"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
          ) : (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
            title="Tài khoản cá nhân"
            aria-label="Menu tài khoản"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {initialLetter}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {userProfile?.role === 'admin' ? 'Super Admin' : userRole}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block group-hover:text-slate-600 transition-transform" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-40 text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {initialLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {userName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {userProfile?.email || 'admin@pchub.vn'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                      <UserCheck className="w-3 h-3 text-blue-600" />
                      {userRole}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                      Online
                    </span>
                  </div>
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
                    <span>Cài đặt hệ thống & Phân quyền</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/admin/ai-advisor');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Cấu hình AI Advisor</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Đăng xuất hệ thống</span>
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
