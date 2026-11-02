'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  userProfile?: {
    email?: string | null;
    full_name?: string | null;
    role?: string | null;
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
  const [isDark, setIsDark] = useState(true);

  const handleSignOut = async () => {
    try { await fetch("/api/admin/logout", { method: "POST" }); } catch {} await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const roleBadgeColor: Record<string, string> = {
    admin: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    manager: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    editor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    support: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const userRole = userProfile?.role || 'staff';

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: mobile hamburger & search shortcut */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-sm transition-all shadow-sm"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Tìm nhanh đơn, sản phẩm...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-900 rounded border border-slate-700">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right section: theme toggle, notification bell, profile menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Chuyển đổi giao diện Sáng / Tối"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Realtime Notification bell */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-600/20">
              {userProfile?.full_name ? userProfile.full_name[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">
                {userProfile?.full_name || 'Quản trị viên'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                <span>{userRole}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-40 text-slate-300 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-800">
                  <div className="text-xs font-medium text-white truncate">
                    {userProfile?.full_name || 'Quản trị viên'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {userProfile?.email || 'admin@pchub.vn'}
                  </div>
                  <span
                    className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-md border capitalize ${
                      roleBadgeColor[userRole] || 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Role: {userRole}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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