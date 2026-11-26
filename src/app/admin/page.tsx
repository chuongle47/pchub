import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  SAMPLE_ORDERS,
  SAMPLE_LOW_STOCK,
  SAMPLE_TOP_PRODUCTS,
  SAMPLE_AI_STATS,
} from '@/lib/admin-sample-data';
import {
  TrendingUp,
  Bot,
  AlertTriangle,
  MoreHorizontal,
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Percent,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';

export const revalidate = 0; // Fresh data for admin dashboard

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch live pending orders, low stock, etc.
  let recentOrders = [...SAMPLE_ORDERS];
  let lowStockList = [...SAMPLE_LOW_STOCK];

  try {
    const [{ data: dbOrders }, { data: dbLowStock }] = await Promise.all([
      supabase
        .from('orders')
        .select('id, code, customer_name, phone, email, total, payment_method, payment_status, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('products')
        .select('id, name, sku, stock, price')
        .lte('stock', 5)
        .order('stock', { ascending: true })
        .limit(5),
    ]);

    if (dbOrders && dbOrders.length > 0) {
      recentOrders = dbOrders.map((o: any, idx: number) => {
        const totalNum = Number(o.total || 0);
        const displayTotal =
          totalNum >= 1000000
            ? (totalNum / 1000000).toFixed(1).replace(/\.0$/, '') + 'tr'
            : totalNum.toLocaleString('vi-VN') + ' đ';

        const created = new Date(o.created_at);
        const diffMins = Math.max(Math.floor((Date.now() - created.getTime()) / 60000), 1);
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

    if (dbLowStock && dbLowStock.length > 0) {
      lowStockList = dbLowStock.map((p: any, idx: number) => ({
        id: p.id || `p-${idx}`,
        name: p.name,
        short_name: p.name.length > 24 ? p.name.substring(0, 22) + '...' : p.name,
        sku: p.sku || `SKU-${p.id ? p.id.slice(0, 6).toUpperCase() : 'PROD'}`,
        stock: p.stock ?? 0,
        price: Number(p.price || 0),
      }));
    }
  } catch (err) {
    console.error('Error fetching admin overview data:', err);
  }

  // Smooth Bézier curve for sales chart: viewBox="0 0 600 200"
  const chartPath =
    'M 20 160 C 80 155, 120 110, 160 110 C 200 110, 240 120, 280 90 C 320 65, 360 70, 400 115 C 440 155, 480 165, 520 150 C 555 135, 575 80, 590 55';
  const chartArea = `${chartPath} L 590 190 L 20 190 Z`;

  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Tổng Quan Kinh Doanh
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Thời gian thực
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span className="capitalize">{todayFormatted}</span>
            <span className="text-slate-300">•</span>
            <span>Theo dõi doanh thu, kho linh kiện và chỉ số tự động hóa</span>
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/quotes/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all hover:border-slate-300"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Tạo báo giá PC</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all hover:shadow-md hover:shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* Row 1: 4 Modern Minimalist KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Doanh thu hôm nay */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Doanh thu hôm nay
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
              84.320.000 ₫
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5" />
                +12%
              </span>
              <span className="text-xs text-slate-400">so với hôm qua</span>
            </div>
          </div>
        </div>

        {/* Card 2: Đơn hàng hôm nay */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Đơn hàng mới
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              47 <span className="text-base font-normal text-slate-400">đơn</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5" />
                +8 đơn
              </span>
              <span className="text-xs text-slate-400">đang chờ duyệt</span>
            </div>
          </div>
        </div>

        {/* Card 3: Tỷ lệ chuyển đổi */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tỷ lệ chuyển đổi
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              3.2%
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5" />
                +0.4%
              </span>
              <span className="text-xs text-slate-400">trung bình tuần</span>
            </div>
          </div>
        </div>

        {/* Card 4: AI Tư Vấn PC */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI Tư Vấn PC
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                1.204
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xl font-bold text-blue-600 tracking-tight">142</span>
              <span className="text-xs font-medium text-slate-500">đơn chốt</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Chốt: {SAMPLE_AI_STATS.conversion_rate}
              </span>
              <span className="text-xs text-slate-400">Gemini 2.5 Pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Chart & Top 5 Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Doanh thu 30 ngày qua (Span 2 cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Doanh thu 30 ngày qua
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Biểu đồ biến động doanh số theo các mốc thời gian trong tháng
                </p>
              </div>

              {/* Quick Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-xs"
                >
                  30 ngày qua
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Năm nay
                </button>
              </div>
            </div>

            {/* Quick Metrics Header */}
            <div className="grid grid-cols-3 gap-4 pb-6 mb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Tổng doanh thu
                </span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  1.482.000.000 ₫
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Đơn trung bình
                </span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  31.500.000 ₫
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Ngày cao điểm
                </span>
                <span className="text-lg font-bold text-blue-600 mt-0.5 block">
                  115tr (29/10)
                </span>
              </div>
            </div>

            {/* Smooth SVG Area Chart */}
            <div className="relative w-full h-64 pt-2">
              {/* Y Axis Grid & Labels */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-slate-400 pr-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>150tr</span>
                  <div className="flex-1 border-b border-dashed border-slate-100 ml-3" />
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>100tr</span>
                  <div className="flex-1 border-b border-dashed border-slate-100 ml-3" />
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>50tr</span>
                  <div className="flex-1 border-b border-dashed border-slate-100 ml-3" />
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span>0</span>
                  <div className="flex-1 border-b border-dashed border-slate-100 ml-3" />
                </div>
              </div>

              {/* SVG Graphic with Gradient Fill */}
              <svg
                className="w-full h-full overflow-visible relative z-10"
                viewBox="0 0 600 200"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartBlueFade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gradient Area */}
                <path d={chartArea} fill="url(#chartBlueFade)" />

                {/* Line Path */}
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Milestone Points */}
                <circle cx="160" cy="110" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="280" cy="90" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="400" cy="115" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="590" cy="55" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </div>

            {/* X Axis Milestone Dates */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 border-t border-slate-100 mt-2 px-3">
              <span>01/10</span>
              <span>08/10</span>
              <span>15/10</span>
              <span>22/10</span>
              <span className="text-blue-600 font-bold">29/10 (Hôm nay)</span>
            </div>
          </div>
        </div>

        {/* Right Card: Top 5 Sản phẩm bán chạy */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Top 5 Bán Chạy</h2>
                <p className="text-xs text-slate-500 mt-0.5">Xếp hạng theo sản lượng & doanh thu</p>
              </div>
              <Link
                href="/admin/products"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-0.5"
              >
                Xem kho →
              </Link>
            </div>

            <div className="space-y-4">
              {SAMPLE_TOP_PRODUCTS.map((prod, idx) => {
                const rankColor =
                  idx === 0
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : idx === 1
                    ? 'bg-slate-200 text-slate-800 border-slate-300'
                    : idx === 2
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200';

                return (
                  <div key={idx} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${rankColor} shrink-0`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900 truncate" title={prod.name}>
                          {prod.name}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-900">{prod.revenue_text}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                          {prod.qty} SL
                        </span>
                      </div>
                    </div>
                    {/* Modern Slim Gradient Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                        style={{ width: `${prod.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-right">
            <Link
              href="/admin/products"
              className="text-xs text-slate-500 hover:text-blue-600 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Xem báo cáo chi tiết sản phẩm</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders (2 cols) & Low Stock Alert (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Đơn hàng gần đây (Span 2 cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Đơn hàng gần đây</h2>
                <p className="text-xs text-slate-500 mt-0.5">Các đơn mới nhất cần duyệt và xử lý giao vận</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Tất cả ({recentOrders.length})
              </Link>
            </div>

            {/* Orders Table with increased row height and clean borders */}
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 px-2">
                <div className="col-span-5">Mã / Khách hàng</div>
                <div className="col-span-3 text-right">Tổng tiền</div>
                <div className="col-span-4 text-right">Trạng thái</div>
              </div>

              {recentOrders.map((ord) => {
                const isPending = ord.status === 'pending';
                const isShipping = ord.status === 'shipping';

                // Soft pill badges
                const badgeBg = isPending
                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                  : isShipping
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200';

                const badgeLabel = isPending
                  ? 'Chờ duyệt'
                  : isShipping
                  ? 'Đang giao'
                  : 'Hoàn thành';

                return (
                  <div
                    key={ord.id}
                    className="grid grid-cols-12 items-center py-4 px-2 text-xs hover:bg-slate-50/80 rounded-xl transition-colors"
                  >
                    <div className="col-span-5 pr-2">
                      <Link
                        href={`/admin/orders`}
                        className="font-bold text-slate-900 hover:text-blue-600 block truncate transition-colors text-sm"
                      >
                        {ord.code}
                      </Link>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {ord.customer_name} {ord.phone ? `(${ord.phone})` : ''}
                      </div>
                    </div>

                    <div className="col-span-3 text-right font-extrabold text-slate-900 text-sm">
                      {ord.display_total}
                    </div>

                    <div className="col-span-4 text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badgeBg} whitespace-nowrap`}
                      >
                        {badgeLabel}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-1">
                        {ord.time_ago}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              href="/admin/orders"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>Vào trang quản lý đơn hàng</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Card 2: Cảnh báo tồn kho (1 col) */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cảnh báo tồn kho</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Linh kiện sắp hết hàng (dưới 5 cái)</p>
                </div>
              </div>
              <Link
                href="/admin/products"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Kho hàng
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStockList.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className="font-semibold text-slate-900 block truncate"
                      title={item.name}
                    >
                      {item.short_name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                        Còn lại: {item.stock} cái
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                    </div>
                  </div>

                  {/* Outline Ghost Button */}
                  <Link
                    href={`/admin/products`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 transition-all shrink-0 shadow-2xs"
                  >
                    Nhập thêm
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <Link
              href="/admin/products"
              className="text-xs text-slate-500 hover:text-blue-600 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Xem toàn bộ 156 sản phẩm trong kho</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
