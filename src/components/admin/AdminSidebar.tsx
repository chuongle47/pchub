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
      name: 'Marketing & Sale',
      icon: Zap,
      children: [
        { name: 'Chiến dịch Flash Sale', href: '/admin/flash-sales', icon: Zap },
        { name: 'Mã giảm giá (Coupon)', href: '/admin/coupons', icon: Ticket },
      ],
    },
    {
      id: 'content-ai',
      name: 'Nội dung & AI Tool',
      icon: Bot,
      children: [
        { name: 'Bài viết & Cẩm nang', href: '/admin/posts', icon: Newspaper },
        { name: 'Tư vấn AI Advisor', href: '/admin/ai-advisor', icon: Bot },
        { name: 'Luật tương thích PC', href: '/admin/compat-rules', icon: Sliders },
      ],
    },
    {
      id: 'system',
      name: 'Hệ thống & Cấu hình',
      icon: Settings,
      children: [
        { name: 'Vận chuyển & Thuế', href: '/admin/shipping', icon: Truck },
        { name: 'Nhật ký Audit Log', href: '/admin/audit-logs', icon: ShieldAlert },
        { name: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Auto expand group that contains current pathname
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

  const userName = userProfile?.full_name || 'Lê Văn Chương';
  const userRole = userProfile?.role === 'admin' ? 'Super Admin' : userProfile?.role || 'Super Admin';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d1527] border-r border-slate-800/80 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-500/25">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-sm tracking-tight truncate">
                PCHub Admin
              </span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                Enterprise Portal
              </span>
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

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group) => {
          const Icon = group.icon;

          // Single direct link (e.g. Dashboard)
          if (!group.children) {
            const isActive = group.exact
              ? pathname === group.href
              : pathname.startsWith(group.href!);

            return (
              <div key={group.id}>
                <Link
                  href={group.href!}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title={collapsed ? group.name : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!collapsed && <span className="truncate flex-1">{group.name}</span>}
                </Link>
              </div>
            );
          }

          // Expandable Group
          const isOpen = Boolean(openGroups[group.id]);
          const isGroupActive = group.children.some((c) =>
            c.href === '/admin' ? pathname === '/admin' : pathname.startsWith(c.href)
          );

          return (
            <div key={group.id} className="pt-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isGroupActive
                    ? 'text-white bg-slate-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
                title={collapsed ? group.name : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isGroupActive ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{group.name}</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {Boolean(group.badge && group.badge > 0) && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600/30 text-blue-400 border border-blue-500/30">
                        {group.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-slate-300' : ''
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* Sub items dropdown */}
              {!collapsed && isOpen && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-800 ml-4 my-1">
                  {group.children.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive =
                      sub.href === '/admin'
                        ? pathname === '/admin'
                        : pathname === sub.href || pathname.startsWith(sub.href + '/');

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          isSubActive
                            ? 'text-blue-400 bg-blue-950/40 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {SubIcon ? (
                            <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isSubActive ? 'text-blue-400' : 'text-slate-500'}`} />
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-blue-400' : 'bg-slate-600'}`} />
                          )}
                          <span className="truncate">{sub.name}</span>
                        </div>

                        {Boolean(sub.badge && sub.badge > 0) && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full flex-shrink-0 ${
                              isSubActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
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

      {/* Storefront Link */}
      <div className="px-3 py-2 border-t border-slate-800/60">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
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

      {/* User Profile Card */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090f1d]/70">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-blue-500/30">
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
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{userRole}</div>
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
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
