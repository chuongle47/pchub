'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Menu,
  Search,
  Bell,
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

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const userName = userProfile?.full_name || 'Lê Văn Chương';
  const userRole = userProfile?.role === 'admin' ? 'Super Admin' : userProfile?.role || 'Super Admin';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left section: mobile hamburger & search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input matching screenshot */}
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-400 text-left transition-colors shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate flex-1">Tìm kiếm...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right section: notifications & user profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tài khoản"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold overflow-hidden border border-slate-300">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-slate-600" />
              )}
            </div>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-40 text-slate-700 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {userName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {userProfile?.email || 'admin@pchub.vn'}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-600 border border-blue-200">
                    {userRole}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/admin/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cài đặt hệ thống</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
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
