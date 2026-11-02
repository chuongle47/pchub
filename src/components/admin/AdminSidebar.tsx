'use client';

import React from 'react';
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
  Newspaper,
  Sliders,
  Bot,
  Mail,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Store,
  ExternalLink,
  Truck,
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
}

export function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  badgeCounts = {},
}: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      group: 'Tổng quan & Bán hàng',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart, badge: badgeCounts.orders },
        { name: 'Báo giá & Cấu hình', href: '/admin/quotes', icon: FileSpreadsheet, badge: badgeCounts.quotes },
      ],
    },
    {
      group: 'Kho & Danh mục',
      items: [
        { name: 'Sản phẩm', href: '/admin/products', icon: Cpu },
        { name: 'Danh mục', href: '/admin/categories', icon: Layers },
        { name: 'Hãng sản xuất', href: '/admin/brands', icon: Building2 },
      ],
    },
    {
      group: 'Khuyến mãi & Marketing',
      items: [
        { name: 'Flash Sale', href: '/admin/flash-sales', icon: Zap },
        { name: 'Mã giảm giá', href: '/admin/coupons', icon: Ticket },
      ],
    },
    {
      group: 'Khách hàng & Tương tác',
      items: [
        { name: 'Khách hàng', href: '/admin/customers', icon: Users },
        { name: 'Đánh giá & Review', href: '/admin/reviews', icon: MessageSquare, badge: badgeCounts.reviews },
        { name: 'Hộp thư liên hệ', href: '/admin/contacts', icon: Mail },
      ],
    },
    {
      group: 'Nội dung & Công cụ AI',
      items: [
        { name: 'Bài viết & Cẩm nang', href: '/admin/posts', icon: Newspaper },
        { name: 'Luật tương thích PC', href: '/admin/compat-rules', icon: Sliders },
        { name: 'Tư vấn AI Advisor', href: '/admin/ai-advisor', icon: Bot },
      ],
    },
    {
      group: 'Hệ thống & Cấu hình',
      items: [
        { name: 'Vận chuyển & Thuế', href: '/admin/shipping', icon: Truck },
        { name: 'Cài đặt chung', href: '/admin/settings', icon: Settings },
        { name: 'Nhật ký Audit Log', href: '/admin/audit-logs', icon: ShieldAlert },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300">
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg flex-shrink-0 shadow-lg shadow-blue-600/30">
            PC
          </div>
          {!collapsed && (
            <div className="leading-tight transition-all">
              <div className="font-bold text-white tracking-wide">PCHUB</div>
              <div className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Admin Portal</div>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navigation.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h3 className="px-2 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {section.group}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors relative group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {!collapsed && <span className="truncate flex-1">{item.name}</span>}
                      {Boolean(item.badge && item.badge > 0) && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${
                            isActive ? 'bg-white text-blue-600' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Store className="w-4 h-4 flex-shrink-0 text-blue-400" />
          {!collapsed && (
            <>
              <span className="truncate flex-1">Xem Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </>
          )}
        </Link>
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
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
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