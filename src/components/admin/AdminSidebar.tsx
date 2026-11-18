'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Layers,
  Building2,
  ShoppingCart,
  FileSpreadsheet,
  Zap,
  Ticket,
  Users,
  MessageSquare,
  Mail,
  Newspaper,
  Sliders,
  Bot,
  Truck,
  ShieldAlert,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Store,
  ExternalLink,
  PlusCircle,
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

interface NavSubItem {
  name: string;
  href: string;
  icon?: any;
  badge?: number;
}

interface NavGroup {
  id: string;
  name: string;
  icon: any;
  href?: string;
  exact?: boolean;
  badge?: number;
  children?: NavSubItem[];
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

  const navGroups: NavGroup[] = [
    {
      id: 'dashboard',
      name: 'Tổng quan',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      id: 'products',
      name: 'Sản phẩm & Kho',
      icon: Cpu,
      children: [
        { name: 'Tất cả sản phẩm', href: '/admin/products', icon: Cpu },
        { name: 'Thêm sản phẩm mới', href: '/admin/products/new', icon: PlusCircle },
        { name: 'Danh mục linh kiện', href: '/admin/categories', icon: Layers },
        { name: 'Hãng sản xuất', href: '/admin/brands', icon: Building2 },
      ],
    },
    {
      id: 'orders',
      name: 'Đơn hàng & Báo giá',
      icon: ShoppingCart,
      badge: (badgeCounts.orders || 0) + (badgeCounts.quotes || 0),
      children: [
        { name: 'Quản lý đơn hàng', href: '/admin/orders', icon: ShoppingCart, badge: badgeCounts.orders },
        { name: 'Báo giá & Cấu hình', href: '/admin/quotes', icon: FileSpreadsheet, badge: badgeCounts.quotes },
      ],
    },
    {
      id: 'customers',
      name: 'Khách hàng & Tương tác',
      icon: Users,
      badge: badgeCounts.reviews,
      children: [
        { name: 'Danh sách khách hàng', href: '/admin/customers', icon: Users },
        { name: 'Đánh giá & Review', href: '/admin/reviews', icon: MessageSquare, badge: badgeCounts.reviews },
        { name: 'Hộp thư liên hệ', href: '/admin/contacts', icon: Mail },
      ],
    },
    {
      id: 'marketing',
      name: 'Marketing & Khuyến mãi',
      icon: Zap,
      children: [
        { name: 'Chiến dịch Flash Sale', href: '/admin/flash-sales', icon: Zap },
        { name: 'Mã giảm giá (Coupon)', href: '/admin/coupons', icon: Ticket },
      ],
    },
    {
      id: 'content-ai',
      name: 'Nội dung & Công cụ AI',
      icon: Bot,
      children: [
        { name: 'Bài viết & Cẩm nang', href: '/admin/posts', icon: Newspaper },
        { name: 'Tư vấn AI Advisor', href: '/admin/ai-advisor', icon: Bot },
        { name: 'Luật tương thích PC', href: '/admin/compat-rules', icon: Sliders },
      ],
    },
    {
      id: 'system',
      name: 'Hệ thống & Cài đặt',
      icon: Settings,
      children: [
        { name: 'Vận chuyển & Thuế', href: '/admin/shipping', icon: Truck },
        { name: 'Nhật ký Audit Log', href: '/admin/audit-logs', icon: ShieldAlert },
        { name: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Auto expand group containing current route
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = { products: true, orders: true };
    navGroups.forEach((g) => {
      if (g.children?.some((c) => pathname.startsWith(c.href))) {
        init[g.id] = true;
      }
    });
    return init;
  });

  useEffect(() => {
    navGroups.forEach((g) => {
      if (g.children?.some((c) => pathname.startsWith(c.href))) {
        setOpenGroups((prev) => ({ ...prev, [g.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const displayName = userProfile?.full_name || 'Quản Trị Viên';
  const initialLetter = displayName.trim().charAt(0).toUpperCase() || 'A';
  const displayRole =
    userProfile?.role === 'admin'
      ? 'Quản trị viên cấp cao'
      : userProfile?.role === 'manager'
      ? 'Quản lý cửa hàng'
      : userProfile?.role === 'support'
      ? 'Nhân viên hỗ trợ'
      : 'Quản trị viên cấp cao';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d1527] border-r border-slate-800 text-slate-300 select-none admin-sidebar">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/25">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-sm tracking-tight truncate">
                PCHub Admin
              </span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                Hệ thống quản trị
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => handleToggleCollapse(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu nhỏ thanh điều hướng'}
          aria-label={collapsed ? 'Mở rộng' : 'Thu nhỏ'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group) => {
          const Icon = group.icon;
          const isDirect = Boolean(group.href);
          const isActiveDirect = isDirect && (group.exact ? pathname === group.href : pathname.startsWith(group.href!));
          const hasChildren = Boolean(group.children && group.children.length > 0);
          const isOpen = Boolean(openGroups[group.id]);
          const isChildActive = hasChildren && group.children!.some((c) => pathname.startsWith(c.href));

          if (isDirect) {
            return (
              <Link
                key={group.id}
                href={group.href!}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center h-10 px-3 rounded-xl text-xs font-medium transition-all group relative ${
                  isActiveDirect
                    ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-[3px] border-blue-500'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={collapsed ? group.name : undefined}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActiveDirect ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <span className="ml-3 truncate flex-1">{group.name}</span>
                )}
                {!collapsed && group.badge && group.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                    {group.badge}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <div key={group.id} className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (collapsed) {
                    handleToggleCollapse(false);
                    setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
                  } else {
                    toggleGroup(group.id);
                  }
                }}
                className={`w-full flex items-center h-10 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                  isChildActive
                    ? 'text-slate-100 bg-slate-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={collapsed ? group.name : undefined}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isChildActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="ml-3 truncate flex-1 text-left">{group.name}</span>
                    {group.badge && group.badge > 0 && (
                      <span className="mr-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                        {group.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-slate-300' : ''
                      }`}
                    />
                  </>
                )}
              </button>

              {!collapsed && isOpen && group.children && (
                <div className="pl-7 pr-1 py-0.5 space-y-1 border-l border-slate-800/80 ml-5">
                  {group.children.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center h-8 px-2.5 rounded-lg text-xs transition-all ${
                          isSubActive
                            ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        {SubIcon && (
                          <SubIcon
                            className={`w-3.5 h-3.5 mr-2 shrink-0 ${
                              isSubActive ? 'text-blue-400' : 'text-slate-500'
                            }`}
                          />
                        )}
                        <span className="truncate flex-1">{sub.name}</span>
                        {sub.badge && sub.badge > 0 && (
                          <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Storefront Link */}
      <div className="p-3 border-t border-slate-800/80">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors group"
        >
          <Store className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate flex-1">Xem Cửa hàng PCHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </>
          )}
        </Link>
      </div>

      {/* Admin User Footer Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
            {initialLetter}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Vai trò: {displayRole}
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
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        <div className={`fixed top-0 bottom-0 left-0 transition-all duration-300 z-30 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer (Left Slide-in) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer Panel */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-[280px] transition-transform duration-300 transform ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
