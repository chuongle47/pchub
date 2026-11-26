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
  ChevronDown,
  Tag,
  Zap,
  Ticket,
  X,
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
  const [marketingOpen, setMarketingOpen] = useState(
    pathname.startsWith('/admin/promotions') ||
    pathname.startsWith('/admin/flash-sales') ||
    pathname.startsWith('/admin/coupons')
  );

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
      subItems: [
        { name: 'Khuyến mãi & Banner', href: '/admin/promotions', icon: Tag },
        { name: 'Flash Sale giờ vàng', href: '/admin/flash-sales', icon: Zap },
        { name: 'Mã giảm giá (Coupon)', href: '/admin/coupons', icon: Ticket },
      ],
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
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-300 select-none admin-sidebar border-r border-slate-800/80">
      {/* Brand Header with standard left padding */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
            PC
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-white text-base tracking-tight leading-none">
                PCHub Admin
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider mt-0.5 uppercase">
                Management Pro
              </span>
            </div>
          )}
        </Link>
        
        {/* Toggle Collapse on Desktop */}
        <button
          type="button"
          onClick={() => handleToggleCollapse(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Mở rộng thanh bên' : 'Thu nhỏ thanh bên'}
          aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu nhỏ thanh bên'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Close Button on Mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Đóng thanh bên"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu with uniform left alignment for ALL items */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isItemActive = item.exact
            ? pathname === item.href
            : pathname === item.href || (pathname.startsWith(item.href + '/') && !hasSubItems);
          const isChildActive = hasSubItems && item.subItems?.some((sub) => pathname.startsWith(sub.href));

          if (hasSubItems && !collapsed) {
            return (
              <div key={item.name} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setMarketingOpen(!marketingOpen)}
                  className={`w-full flex items-center justify-between h-11 px-3.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                    isItemActive || isChildActive
                      ? 'bg-slate-800/90 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isItemActive || isChildActive
                          ? 'text-blue-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      marketingOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Sub-items sharing the EXACT SAME LEFT ALIGNMENT */}
                {marketingOpen && (
                  <div className="space-y-1.5 pt-0.5">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 h-10 px-3.5 rounded-xl text-xs font-medium transition-all group ${
                            isSubActive
                              ? 'bg-blue-600 text-white font-semibold shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center h-11 px-3.5 rounded-xl text-sm font-medium transition-all group ${
                isItemActive
                  ? 'bg-slate-800/90 text-white font-semibold shadow-2xs border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isItemActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-700/80"
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
        className={`fixed inset-y-0 left-0 z-50 w-[260px] max-w-[85vw] transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
}
