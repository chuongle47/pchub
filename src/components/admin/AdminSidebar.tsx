'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
  Megaphone,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Store,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
  badgeCounts?: {
    orders?: number;
    quotes?: number;
    reviews?: number;
  };
  userProfile?: {
    full_name?: string | null;
    email?: string | null;
    role?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  badgeCounts = {},
  userProfile,
}: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutGrid, exact: true },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart, badge: badgeCounts.orders },
    { name: 'Khách hàng', href: '/admin/customers', icon: Users },
    { name: 'Marketing', href: '/admin/flash-sales', icon: Megaphone },
    { name: 'Nội dung', href: '/admin/posts', icon: FileText },
    { name: 'Hệ thống', href: '/admin/settings', icon: Settings },
  ];

  const userName = userProfile?.full_name || 'Lê Văn Chương';
  const userRole = userProfile?.role === 'admin' ? 'Super Admin' : userProfile?.role || 'Super Admin';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d1527] border-r border-slate-800/80 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/60">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-500/25">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1.5 font-bold text-white text-base tracking-tight whitespace-nowrap">
              <span>PCHub Admin</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                isActive
                  ? 'bg-slate-800/90 text-white shadow-sm shadow-black/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && <span className="truncate flex-1">{item.name}</span>}
              {Boolean(item.badge && item.badge > 0) && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Storefront Link */}
      <div className="px-3 py-2 border-t border-slate-800/60">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <Store className="w-4 h-4 flex-shrink-0 text-blue-400" />
          {!collapsed && (
            <>
              <span className="truncate flex-1">Xem Website Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </>
          )}
        </Link>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090f1d]/60">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-blue-500/30">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>LC</span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold text-white truncate">{userName}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{userRole}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      <aside
        className={`hidden md:block flex-shrink-0 transition-all duration-300 sticky top-0 h-screen ${
          collapsed ? 'w-20' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
