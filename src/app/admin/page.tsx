import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  SAMPLE_ORDERS,
  SAMPLE_LOW_STOCK,
  SAMPLE_TOP_PRODUCTS,
  SAMPLE_AI_STATS,
} from '@/lib/admin-sample-data';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import {
  Bot,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const revalidate = 0; // Fresh data for admin overview

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // Initial data fallbacks
  let recentOrders = [...SAMPLE_ORDERS];
  let lowStockList = [...SAMPLE_LOW_STOCK];
  let todayRevenue = 84320000;
  let todayOrdersCount = 47;

  try {
    const [
      { data: dbOrders },
      { data: dbTodayOrders },
      { data: dbLowStock },
    ] = await Promise.all([
      // 1. Five most recent orders
      supabase
        .from('orders')
        .select('id, code, customer_name, phone, email, total, payment_method, payment_status, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),

      // 2. Orders placed today
      supabase
        .from('orders')
        .select('total, status, created_at')
        .gte('created_at', startOfDay),

      // 3. Products with stock <= 5, sorted by lowest stock first (0 first)
      supabase
        .from('products')
        .select('id, name, sku, stock, price')
        .lte('stock', 5)
        .order('stock', { ascending: true })
        .limit(5),
    ]);

    // Map Recent Orders
    if (dbOrders && dbOrders.length > 0) {
      recentOrders = dbOrders.map((o: any, idx: number) => {
        const totalNum = Number(o.total || 0);
        const displayTotal =
          totalNum >= 1000000
            ? (totalNum / 1000000).toFixed(1).replace(/\.0$/, '') + 'tr ₫'
            : totalNum.toLocaleString('vi-VN') + ' ₫';

        const created = new Date(o.created_at);
        const diffMins = Math.max(Math.floor((now.getTime() - created.getTime()) / 60000), 1);
        const timeAgo =
          diffMins < 60
            ? `${diffMins} phút trước`
            : diffMins < 1440
            ? `${Math.floor(diffMins / 60)} giờ trước`
            : `${Math.floor(diffMins / 1440)} ngày trước`;

        return {
          id: o.id || `order-${idx}`,
          code: o.code || `ORD-00${47 - idx}`,
          customer_name: o.customer_name || 'Khách hàng',
          phone: o.phone || '',
          email: o.email || null,
          total: totalNum,
          display_total: displayTotal,
          payment_method: o.payment_method || 'cod',
          payment_status: o.payment_status || 'pending',
          status: o.status || 'pending',
          created_at: o.created_at,
          time_ago: timeAgo,
        };
      });
    }

    // Calculate Today's Stats from Live DB if available
    if (dbTodayOrders && dbTodayOrders.length > 0) {
      todayOrdersCount = dbTodayOrders.length;
      const sum = dbTodayOrders.reduce((acc: number, curr: any) => acc + Number(curr.total || 0), 0);
      if (sum > 0) todayRevenue = sum;
    }

    // Map Low Stock List (Strictly sorted by lowest stock: 0 first)
    if (dbLowStock && dbLowStock.length > 0) {
      lowStockList = dbLowStock
        .map((p: any, idx: number) => ({
          id: p.id || `p-${idx}`,
          name: p.name,
          short_name: p.name.length > 28 ? p.name.substring(0, 26) + '...' : p.name,
          sku: p.sku || `SKU-${p.id ? p.id.slice(0, 6).toUpperCase() : 'PROD'}`,
          stock: p.stock ?? 0,
          price: Number(p.price || 0),
        }))
        .sort((a, b) => a.stock - b.stock);
    }
  } catch (err) {
    console.error('Error fetching admin live overview:', err);
  }

  const formattedRevenue = todayRevenue.toLocaleString('vi-VN');

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. DASHBOARD HEADER (Title 24-28px, Subtitle & Live Status)               */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng quan tình hình kinh doanh, doanh số và vận hành hệ thống PCHub
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200/90 rounded-full px-3.5 py-1.5 shadow-2xs self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-slate-700">Thời gian thực</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Hôm nay: {now.toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROW 1: 4 EQUAL-HEIGHT KPI CARDS (Sentence Casing & Prominent Numbers) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
        {/* KPI 1: Doanh thu hôm nay */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Doanh thu hôm nay
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
              12%
            </span>
          </div>

          <div className="my-2.5">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight" title={`${formattedRevenue} ₫`}>
              {formattedRevenue} <span className="underline decoration-slate-400 font-semibold text-xl">đ</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>So với hôm qua</span>
            <span className="text-slate-600 font-medium">+9.040.000 đ</span>
          </div>
        </div>

        {/* KPI 2: Đơn hàng hôm nay */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Đơn hàng hôm nay
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +8
            </span>
          </div>

          <div className="my-2.5">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {todayOrdersCount} <span className="text-base font-semibold text-slate-500">đơn</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Đang chờ duyệt</span>
            <span className="text-amber-600 font-bold">5 đơn</span>
          </div>
        </div>

        {/* KPI 3: Tỷ lệ chuyển đổi */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Tỷ lệ chuyển đổi
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
              0.4%
            </span>
          </div>

          <div className="my-2.5">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              3.2%
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Trung bình 7 ngày qua</span>
            <span className="text-slate-600 font-medium">2.8%</span>
          </div>
        </div>

        {/* KPI 4: AI Chat sessions (Clear, responsive, no clipped text) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                🤖
              </span>
              <span className="text-xs font-semibold text-slate-500">
                AI Chat sessions
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">
              Gemini 2.5
            </span>
          </div>

          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {SAMPLE_AI_STATS.sessions.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">lượt tư vấn</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Đơn từ AI:</span>
            <span className="text-indigo-600 font-bold">
              {SAMPLE_AI_STATS.converted_orders} đơn ({SAMPLE_AI_STATS.conversion_rate})
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: BIỂU ĐỒ DOANH THU (2 COLS) & TOP 5 BÁN CHẠY (1 COL)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {/* Left: Interactive Revenue Chart (Span 2 cols) */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Right: Top 5 bán chạy (Card Title 16-18px, Clean Alignment) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-[17px] font-semibold text-slate-800 tracking-tight">
                Top 5 bán chạy
              </h2>
              <Link
                href="/admin/products"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
              >
                <span>Xem kho</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {SAMPLE_TOP_PRODUCTS.map((prod, idx) => (
                <div key={idx} className="space-y-1.5">
                  {/* Single Line: Product Name + Revenue + Sales Count */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className="font-semibold text-slate-900 truncate flex-1 min-w-0"
                      title={prod.name}
                    >
                      {idx + 1}. {prod.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900">{prod.revenue_text}</span>
                      <span className="text-[11px] text-slate-400 font-medium">({prod.qty} SL)</span>
                    </div>
                  </div>

                  {/* Clean Slim Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${prod.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Xem báo cáo chi tiết sản phẩm →
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROW 3: 3 EQUAL-WIDTH COLUMNS (Recent Orders, AI Donut, Low Stock)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {/* Col 1: Đơn hàng gần đây */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h2 className="text-[17px] font-semibold text-slate-800 tracking-tight">
                Đơn hàng gần đây
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Xem tất cả ({recentOrders.length})
              </Link>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 pb-2 border-b border-slate-100">
              <div className="col-span-5">MÃ / KHÁCH HÀNG</div>
              <div className="col-span-3 text-right">TỔNG</div>
              <div className="col-span-4 text-right">TRẠNG THÁI</div>
            </div>

            {/* Table Rows without horizontal overflow */}
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => {
                const isPending = ord.status === 'pending';
                const isShipping = ord.status === 'shipping';
                const isCompleted = ord.status === 'completed' || ord.status === 'paid';

                const badgeBg = isPending
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : isShipping
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

                const badgeLabel = isPending
                  ? 'Chờ xác nhận'
                  : isShipping
                  ? 'Đang giao'
                  : isCompleted
                  ? 'Đã thanh toán'
                  : 'Đã xử lý';

                return (
                  <div
                    key={ord.id}
                    className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-slate-50/80 px-1 rounded-lg transition-colors"
                  >
                    <div className="col-span-5 pr-1 min-w-0">
                      <Link
                        href="/admin/orders"
                        className="font-bold text-slate-900 hover:text-blue-600 block truncate"
                      >
                        {ord.code}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {ord.customer_name}
                      </div>
                    </div>

                    <div className="col-span-3 text-right font-semibold text-slate-800">
                      {ord.display_total}
                    </div>

                    <div className="col-span-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeBg} whitespace-nowrap`}
                      >
                        {badgeLabel}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {ord.time_ago}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 2: Hiệu suất AI Chat */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between items-center text-center">
          <div className="w-full text-left mb-2">
            <h2 className="text-[17px] font-semibold text-slate-800 tracking-tight">
              Hiệu suất AI Chat
            </h2>
          </div>

          {/* Donut Chart Visual */}
          <div className="my-auto py-3 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                {/* Gray Segment (13%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#cbd5e1"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="0"
                />
                {/* Purple Segment (19%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="32.6"
                />
                {/* Blue Segment (68%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="80.3"
                  strokeLinecap="round"
                />
              </svg>

              {/* Inner Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-slate-900">
                  {SAMPLE_AI_STATS.resolved_percent}%
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs shrink-0" />
                <span>Resolved (Tự giải quyết)</span>
              </div>
              <span className="font-bold text-slate-900">{SAMPLE_AI_STATS.resolved_percent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-xs shrink-0" />
                <span>Escalated (Chuyển nhân viên)</span>
              </div>
              <span className="font-bold text-slate-900">{SAMPLE_AI_STATS.escalated_percent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-slate-300 rounded-xs shrink-0" />
                <span>Unanswered (Bỏ lỡ)</span>
              </div>
              <span className="font-bold text-slate-900">{SAMPLE_AI_STATS.unanswered_percent}%</span>
            </div>
          </div>
        </div>

        {/* Col 3: Cảnh báo tồn kho */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <h2 className="text-[17px] font-semibold text-slate-800 tracking-tight">
                Cảnh báo tồn kho
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStockList.map((item) => {
                const isOutOfStock = item.stock === 0;
                return (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between gap-2 text-xs hover:bg-slate-50/80 px-1 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        className="font-semibold text-slate-900 block truncate"
                        title={item.name}
                      >
                        {item.short_name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[11px] font-bold ${
                            isOutOfStock ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {isOutOfStock ? '⚠️ Đã hết hàng' : `Còn ${item.stock} cái`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Tối thiểu: 5)
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/admin/products"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold border border-slate-200 transition-colors shrink-0 shadow-2xs cursor-pointer"
                    >
                      Nhập thêm
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <Link
              href="/admin/products?filter=low_stock"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Xem toàn bộ danh sách cần nhập kho →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
