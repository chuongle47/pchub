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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="flex items-center px-4 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, khách hàng, tên sản phẩm, SKU... (phím tắt Esc để đóng)"
            className="w-full bg-transparent py-4 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-400 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Thao tác nhanh
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickLinks.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => navigateTo(item.href)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left transition-colors border border-slate-800/80 hover:border-slate-700"
                    >
                      <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-slate-200 truncate">{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 ml-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {query && (
            <>
              {loading && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Đang tìm kiếm dữ liệu...
                </div>
              )}

              {!loading && results.orders.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                    <span>Đơn hàng ({results.orders.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => navigateTo(`/admin/orders/${o.id}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">#{o.order_number}</div>
                          <div className="text-[11px] text-slate-400">{o.customer_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-blue-400">
                            {Number(o.total_amount).toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-[10px] text-slate-500 capitalize">{o.status}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && results.products.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sản phẩm ({results.products.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigateTo(`/admin/products/${p.id}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className="pr-4 truncate">
                          <div className="text-xs font-medium text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">SKU: {p.sku || 'N/A'}</div>
                        </div>
                        <div className="text-xs font-semibold text-emerald-400 whitespace-nowrap">
                          {Number(p.price).toLocaleString('vi-VN')} ₫
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && results.quotes.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
                    <span>Báo giá PC ({results.quotes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.quotes.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => navigateTo(`/admin/quotes/${q.id}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">#{q.code}</div>
                          <div className="text-[11px] text-slate-400">{q.customer_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-purple-400">
                            {Number(q.total_amount).toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-[10px] text-slate-500 capitalize">{q.status}</div>
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
                  <div className="py-8 text-center text-xs text-slate-500">
                    Không tìm thấy kết quả nào phù hợp với "{query}".
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}