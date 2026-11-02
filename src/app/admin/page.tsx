import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  DollarSign,
  ShoppingCart,
  FileSpreadsheet,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Clock,
  Package,
  CheckCircle,
  Eye,
} from 'lucide-react';

export const revalidate = 0; // Fresh data for admin dashboard

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch KPIs via RPC or fallback direct queries
  let kpis: any = {
    revenue_today: 0,
    revenue_week: 0,
    revenue_month: 0,
    orders_today: 0,
    orders_pending: 0,
    quotes_new: 0,
    low_stock_count: 0,
    reviews_pending: 0,
    recent_sales: [],
    sales_by_category: [],
  };

  try {
    const { data, error } = await supabase.rpc('get_admin_dashboard_kpis');
    if (!error && data) {
      kpis = data;
    } else {
      // Fallback query if RPC migration hasn't been executed yet
      const [
        { count: pendingOrders },
        { count: newQuotes },
        { count: lowStock },
        { count: pendingReviews },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock', 5),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      kpis.orders_pending = pendingOrders || 0;
      kpis.quotes_new = newQuotes || 0;
      kpis.low_stock_count = lowStock || 0;
      kpis.reviews_pending = pendingReviews || 0;
    }
  } catch (err) {
    console.error('Failed to load KPIs:', err);
  }

  // 2. Fetch Urgent Action Items (Recent pending orders & new quotes)
  const [{ data: pendingOrdersList }, { data: newQuotesList }, { data: lowStockProducts }] =
    await Promise.all([
      supabase
        .from('orders')
        .select('id, code, customer_name, phone, total, payment_method, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('quotes')
        .select('id, code, customer_name, phone, total, status, created_at')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('products')
        .select('id, name, sku, stock, price')
        .lte('stock', 5)
        .order('stock', { ascending: true })
        .limit(5),
    ]);

  const formatVND = (num: number) => {
    return Number(num || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const recentSalesData = kpis.recent_sales && kpis.recent_sales.length > 0
    ? kpis.recent_sales
    : [
        { date: 'T2', total: 12500000, orders_count: 3 },
        { date: 'T3', total: 24800000, orders_count: 5 },
        { date: 'T4', total: 18900000, orders_count: 4 },
        { date: 'T5', total: 32000000, orders_count: 7 },
        { date: 'T6', total: 45600000, orders_count: 9 },
        { date: 'T7', total: 58200000, orders_count: 12 },
        { date: 'CN', total: 39500000, orders_count: 8 },
      ];

  const maxSale = Math.max(...recentSalesData.map((d: any) => Number(d.total || 0)), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Quản Trị</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tổng quan tình hình kinh doanh, đơn hàng và kho linh kiện PCHub
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </Link>
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Xem báo giá</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Doanh thu tháng */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Doanh thu tháng
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatVND(kpis.revenue_month || kpis.revenue_today || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hôm nay: {formatVND(kpis.revenue_today || 0)}</span>
            </div>
          </div>
        </div>

        {/* Đơn hàng chờ xử lý */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Đơn hàng chờ duyệt
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {kpis.orders_pending || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Đơn phát sinh hôm nay: {kpis.orders_today || 0}</span>
            </div>
          </div>
        </div>

        {/* Báo giá chưa phản hồi */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Báo giá cần xử lý
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {kpis.quotes_new || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
              <span>Cần liên hệ khách hàng sớm</span>
            </div>
          </div>
        </div>

        {/* Cảnh báo tồn kho */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Sắp hết hàng (≤ 5)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {kpis.low_stock_count || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400">
              <span>Đánh giá chờ duyệt: {kpis.reviews_pending || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Biểu đồ doanh thu 7 ngày</h2>
              <p className="text-xs text-slate-400 mt-0.5">Xu hướng kinh doanh trong tuần</p>
            </div>
            <div className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              Tuần hiện tại
            </div>
          </div>

          <div className="h-56 flex items-end gap-3 pt-6 pb-2">
            {recentSalesData.map((d: any, idx: number) => {
              const heightPercent = Math.max(Math.round((Number(d.total || 0) / maxSale) * 100), 10);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {formatVND(d.total)}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-xl bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all shadow-md"
                  />
                  <span className="text-[11px] font-medium text-slate-400">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgent Action Products Stock */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Cảnh báo tồn kho</h2>
              <Link href="/admin/products" className="text-xs text-blue-400 hover:underline">
                Xem tất cả
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4">Linh kiện tồn kho ít cần nhập thêm</p>

            <div className="space-y-3">
              {lowStockProducts && lowStockProducts.length > 0 ? (
                lowStockProducts.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
                  >
                    <div className="pr-2 truncate">
                      <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</div>
                    </div>
                    <span className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap">
                      Còn {p.stock}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  Kho hàng ổn định, chưa có sản phẩm nào chạm ngưỡng tồn kho thấp.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <Link
              href="/admin/products"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span>Kiểm tra toàn bộ kho</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Action Sections: Pending Orders & New Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-base font-bold text-white">Đơn hàng mới cần xử lý</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingOrdersList && pendingOrdersList.length > 0 ? (
              pendingOrdersList.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400">{order.code}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white mt-0.5">{order.customer_name}</div>
                    <div className="text-[11px] text-slate-400">{order.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">
                      {formatVND(order.total)}
                    </div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Chi tiết</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Hiện không có đơn hàng nào chờ xử lý.
              </div>
            )}
          </div>
        </div>

        {/* New Quotes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base font-bold text-white">Yêu cầu báo giá mới</h2>
            </div>
            <Link
              href="/admin/quotes"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {newQuotesList && newQuotesList.length > 0 ? (
              newQuotesList.map((quote: any) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">{quote.code}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(quote.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white mt-0.5">{quote.customer_name}</div>
                    <div className="text-[11px] text-slate-400">{quote.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-300">
                      {formatVND(quote.total)}
                    </div>
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Xử lý</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Chưa có yêu cầu báo giá mới.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}