'use client';

import React, { useEffect } from 'react';
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

interface NavItem {
  name: string;
  href: string;
  icon: any;
  exact?: boolean;
  matchPrefixes?: string[];
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

  // Exactly 7 items matching Stitch design:
  // web application/stitch/projects/8397081928159982642/screens/874208b2b0b041cc8603cdd3542cc66f
  const navItems: NavItem[] = [
    {
      name: 'Tổng quan',
      href: '/admin',
      icon: LayoutGrid,
      exact: true,
    },
    {
      name: 'Sản phẩm',
      href: '/admin/products',
      icon: Package,
      matchPrefixes: ['/admin/products', '/admin/categories', '/admin/brands'],
    },
    {
      name: 'Đơn hàng',
      href: '/admin/orders',
      icon: ShoppingCart,
      matchPrefixes: ['/admin/orders', '/admin/quotes'],
    },
    {
      name: 'Khách hàng',
      href: '/admin/customers',
      icon: Users,
      matchPrefixes: ['/admin/customers', '/admin/reviews', '/admin/contacts'],
    },
    {
      name: 'Marketing',
      href: '/admin/flash-sales',
      icon: Megaphone,
      matchPrefixes: ['/admin/flash-sales', '/admin/coupons'],
    },
    {
      name: 'Nội dung',
      href: '/admin/posts',
      icon: FileText,
      matchPrefixes: ['/admin/posts', '/admin/ai-advisor', '/admin/compat-rules'],
    },
    {
      name: 'Hệ thống',
      href: '/admin/settings',
      icon: Settings,
      matchPrefixes: ['/admin/settings', '/admin/shipping', '/admin/audit-logs'],
    },
  ];

  const displayName = userProfile?.full_name || 'Lê Văn Chương';
  const displayRole =
    userProfile?.role === 'manager'
      ? 'Quản lý cửa hàng'
      : userProfile?.role === 'support'
      ? 'Nhân viên hỗ trợ'
      : 'Super Admin';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] border-r border-slate-800 text-slate-300 select-none admin-sidebar">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-base tracking-tight truncate">
              PCHub Admin
            </span>
          )}
        </Link>
        <button
          onClick={() => handleToggleCollapse(!collapsed)}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu nhỏ thanh điều hướng'}
          aria-label={collapsed ? 'Mở rộng' : 'Thu nhỏ'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List - Stitch Clean 7 Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : item.matchPrefixes
            ? item.matchPrefixes.some((prefix) => pathname.startsWith(prefix))
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center h-10 px-3.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <span className="ml-3 truncate flex-1">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Admin User Footer Card - Matches Stitch Mockup */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-slate-600 flex items-center justify-center">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {displayRole}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-300 z-30 shrink-0 ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        <div
          className={`fixed top-0 bottom-0 left-0 transition-all duration-300 z-30 ${
            collapsed ? 'w-[72px]' : 'w-[240px]'
          }`}
        >
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 bottom-0 left-0 w-[260px] transition-transform duration-300 transform ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
