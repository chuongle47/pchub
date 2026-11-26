'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  ShoppingCart,
  Users,
  Megaphone,
  FileText,
  Settings,
  ChevronRight,
  ChevronLeft,
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
  userProfile,
}: SidebarProps) {
  const pathname = usePathname();

  // Remember collapsed state in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pchub_admin_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    } catch {}
  }, [setCollapsed]);

  const handleToggleCollapse = (val: boolean) => {
    setCollapsed(val);
    try {
      localStorage.setItem('pchub_admin_sidebar_collapsed', String(val));
    } catch {}
  };

  const navItems = [
    {
      name: 'Tổng quan',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Sản phẩm',
      href: '/admin/products',
      icon: Cpu,
    },
    {
      name: 'Đơn hàng',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Khách hàng',
      href: '/admin/customers',
      icon: Users,
    },
    {
      name: 'Marketing',
      href: '/admin/flash-sales',
      icon: Megaphone,
    },
    {
      name: 'Nội dung',
      href: '/admin/posts',
      icon: FileText,
    },
    {
      name: 'Hệ thống',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const displayName = userProfile?.full_name || 'Lê Văn Chương';
  const displayRole = userProfile?.role || 'Super Admin';
  const avatarUrl =
    userProfile?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

  const content = (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-300 select-none admin-sidebar">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <span className="font-bold text-white text-xl tracking-tight">
            {collapsed ? 'PC' : 'PCHub Admin'}
          </span>
        </Link>
        <button
          onClick={() => handleToggleCollapse(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Mở rộng' : 'Thu nhỏ'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu (Single column matching Stitch design) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center h-11 px-3.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-slate-800/90 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && <span className="ml-3.5 truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* User Profile at Bottom (Matching Stitch design) */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-700"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">{displayName}</span>
              <span className="text-xs text-slate-400 truncate">{displayRole}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed width 240px or collapsed 72px) */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out sticky top-0 h-screen z-30 ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[250px] max-w-[85vw] transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
}
