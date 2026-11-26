'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Cpu,
  FileSpreadsheet,
  X,
  ArrowRight,
  PlusCircle,
  Zap,
  Sliders,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickLinks = [
  { label: 'Thêm sản phẩm mới', href: '/admin/products/new', icon: PlusCircle },
  { label: 'Tạo chiến dịch Flash Sale', href: '/admin/flash-sales/new', icon: Zap },
  { label: 'Tạo báo giá PC mới', href: '/admin/quotes/new', icon: FileSpreadsheet },
  { label: 'Kiểm tra tương thích phần cứng', href: '/admin/compat-rules', icon: Sliders },
  { label: 'Cài đặt hệ thống & nhân sự', href: '/admin/settings', icon: Settings },
  { label: 'Nhật ký kiểm toán (Audit Logs)', href: '/admin/audit-logs', icon: ShieldAlert },
];

export function AdminQuickSearch({ isOpen, onClose }: QuickSearchProps) {
  const router = useRouter();
  const supabase = createClient();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    products: any[];
    orders: any[];
    quotes: any[];
  }>({ products: [], orders: [], quotes: [] });

  // Handle hotkeys (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search logic debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], orders: [], quotes: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.trim();
        // 1. Search products
        const { data: prods } = await supabase
          .from('products')
          .select('id, name, sku, price')
          .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
          .limit(4);

        // 2. Search orders
        const { data: ords } = await supabase
          .from('orders')
          .select('id, order_number, customer_name, total_amount, status')
          .or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`)
          .limit(4);

        // 3. Search quotes
        const { data: qts } = await supabase
          .from('quotes')
          .select('id, code, customer_name, total_amount, status')
          .or(`code.ilike.%${q}%,customer_name.ilike.%${q}%`)
          .limit(4);

        setResults({
          products: prods || [],
          orders: ords || [],
          quotes: qts || [],
        });
      } catch (err) {
        console.error('QuickSearch error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150 ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="flex items-center px-4 sm:px-5 border-b border-slate-100 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, khách hàng, tên linh kiện, SKU..."
            className="w-full bg-transparent py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-0.5 text-[11px] font-mono font-medium text-slate-500 bg-white rounded-md border border-slate-200 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-[420px] overflow-y-auto p-4 sm:p-5 space-y-4">
          {!query && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>Phím tắt & Thao tác nhanh</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickLinks.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => navigateTo(item.href)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 text-left transition-all border border-slate-200/70 hover:border-blue-200 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-900 truncate flex-1">
                        {item.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all ml-auto shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {query && (
            <>
              {loading && (
                <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tìm kiếm thông tin...</span>
                </div>
              )}

              {!loading && results.orders.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
                    <span>Đơn hàng ({results.orders.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => navigateTo(`/admin/orders/${o.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/60 text-left transition-all border border-slate-100 hover:border-blue-200 group cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                            #{o.order_number}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{o.customer_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-blue-600">
                            {Number(o.total_amount).toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize mt-0.5">{o.status}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && results.products.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Linh kiện & Sản phẩm ({results.products.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigateTo(`/admin/products/${p.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 text-left transition-all border border-slate-100 hover:border-emerald-200 group cursor-pointer"
                      >
                        <div className="pr-4 truncate flex-1">
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            SKU: {p.sku || (p.id ? `PCH-${p.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}` : 'PCH-PROD')}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-emerald-600 whitespace-nowrap">
                          {Number(p.price).toLocaleString('vi-VN')} ₫
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && results.quotes.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
                    <span>Báo giá cấu hình PC ({results.quotes.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.quotes.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => navigateTo(`/admin/quotes/${q.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-purple-50/60 text-left transition-all border border-slate-100 hover:border-purple-200 group cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                            #{q.code}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{q.customer_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-purple-600">
                            {Number(q.total_amount).toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize mt-0.5">{q.status}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading &&
                results.orders.length === 0 &&
                results.products.length === 0 &&
                results.quotes.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Không tìm thấy dữ liệu phù hợp với từ khóa "{query}".
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer command bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Dùng phím <strong>ESC</strong> để đóng</span>
            <span>•</span>
            <span>Gõ từ khóa để tra cứu thời gian thực</span>
          </div>
          <span className="font-medium text-slate-500">PCHub QuickSearch</span>
        </div>
      </div>
    </div>
  );
}