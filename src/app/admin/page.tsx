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
        short_name: p.name.length > 22 ? p.name.substring(0, 20) + '...' : p.name,
        sku: p.sku || `SKU-${p.id ? p.id.slice(0, 6).toUpperCase() : 'PROD'}`,
        stock: p.stock ?? 0,
        price: Number(p.price || 0),
      }));
    }
  } catch (err) {
    console.error('Error fetching admin overview data:', err);
  }

  // SVG Chart points: ViewBox is 0 0 500 180
  const chartPath =
    'M 20 145 C 70 140, 95 90, 130 90 C 165 90, 205 100, 245 75 C 275 55, 305 60, 335 95 C 365 130, 395 140, 420 135 C 450 130, 465 80, 485 58';
  const chartArea = `${chartPath} L 485 170 L 20 170 Z`;

  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Tổng Quan Kinh Doanh
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/quotes/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all hover:border-slate-300"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Tạo báo giá PC</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all hover:shadow-md hover:shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* Row 1: 4 Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Doanh thu hôm nay */}
        <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 group overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doanh thu hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
              84.320.000 ₫
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
              <span className="text-[11px] text-slate-400">so với hôm qua</span>
            </div>
          </div>
        </div>

        {/* Card 2: Đơn hàng hôm nay */}
        <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 group overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đơn hàng mới</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">47 <span className="text-sm font-normal text-slate-400">đơn</span></div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                +8 đơn
              </span>
              <span className="text-[11px] text-slate-400">đang chờ duyệt</span>
            </div>
          </div>
        </div>

        {/* Card 3: Tỷ lệ chuyển đổi */}
        <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 group overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ chuyển đổi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">3.2%</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                +0.4%
              </span>
              <span className="text-[11px] text-slate-400">trung bình tuần</span>
            </div>
          </div>
        </div>

        {/* Card 4: AI Chat Sessions */}
        <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 group overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Tư Vấn PC</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-black text-slate-900 tracking-tight">1.204</span>
              <span className="text-slate-300 mx-0.5">/</span>
              <span className="text-xl font-bold text-indigo-600 tracking-tight">142</span>
              <span className="text-xs font-medium text-slate-500 ml-0.5">đơn chốt</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Chốt: {SAMPLE_AI_STATS.conversion_rate}
              </span>
              <span className="text-[11px] text-slate-400">Gemini 2.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Chart & Top 5 Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Doanh thu 30 ngày qua */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Doanh thu 30 ngày qua</h2>
                <p className="text-xs text-slate-500 mt-0.5">Biểu đồ biến động doanh số theo các mốc thời gian trong tháng</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Tháng hiện tại
                </span>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Tùy chọn"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Banner inside Chart */}
            <div className="grid grid-cols-3 gap-3 p-3 mb-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Tổng doanh thu</span>
                <span className="font-bold text-slate-900 text-sm">1.482.000.000 ₫</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Đơn trung bình</span>
                <span className="font-bold text-slate-900 text-sm">31.500.000 ₫</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Ngày cao điểm</span>
                <span className="font-bold text-blue-600 text-sm">115tr (29/10)</span>
              </div>
            </div>

            {/* SVG Wave Chart */}
            <div className="relative w-full h-56 pt-2">
              {/* Y Axis Grid & Labels */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 pr-2">
                <div className="flex items-center justify-between border-b border-slate-100/90 pb-1">
                  <span>150tr</span>
                  <div className="flex-1 border-b border-dashed border-slate-200/60 ml-3" />
                </div>
                <div className="flex items-center justify-between border-b border-slate-100/90 pb-1">
                  <span>100tr</span>
                  <div className="flex-1 border-b border-dashed border-slate-200/60 ml-3" />
                </div>
                <div className="flex items-center justify-between border-b border-slate-100/90 pb-1">
                  <span>50tr</span>
                  <div className="flex-1 border-b border-dashed border-slate-200/60 ml-3" />
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span>0</span>
                  <div className="flex-1 border-b border-dashed border-slate-200/60 ml-3" />
                </div>
              </div>

              {/* SVG Curve */}
              <svg
                className="w-full h-full overflow-visible relative z-10"
                viewBox="0 0 500 180"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                    <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area */}
                <path d={chartArea} fill="url(#blueGradient)" />

                {/* Stroke Line */}
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Milestone Points */}
                <circle cx="130" cy="90" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="245" cy="75" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="485" cy="58" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
              </svg>
            </div>

            {/* X Axis Milestone Dates */}
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-3 border-t border-slate-100 mt-2 px-3">
              <span>01/10</span>
              <span>08/10</span>
              <span>15/10</span>
              <span>22/10</span>
              <span>29/10 (Hôm nay)</span>
            </div>
          </div>
        </div>

        {/* Right Card: Top 5 Sản phẩm */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Top 5 Bán Chạy</h2>
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
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : idx === 1
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : idx === 2
                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200';

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${rankColor} shrink-0`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate" title={prod.name}>
                          {prod.name}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-900">{prod.revenue_text}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{prod.qty} SL</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${prod.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-right">
            <Link
              href="/admin/products"
              className="text-xs text-slate-500 hover:text-blue-600 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Xem báo cáo chi tiết sản phẩm</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders, AI Chat Performance, Low Stock Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Đơn hàng gần đây */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Đơn hàng gần đây</h2>
                <p className="text-xs text-slate-500 mt-0.5">Các đơn mới nhất cần xử lý</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Tất cả ({recentOrders.length})
              </Link>
            </div>

            {/* Orders Table */}
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-2.5">
                <div className="col-span-6">Mã / Khách hàng</div>
                <div className="col-span-3 text-right">Tổng</div>
                <div className="col-span-3 text-right">Trạng thái</div>
              </div>

              {recentOrders.map((ord) => {
                const isPending = ord.status === 'pending';
                const isShipping = ord.status === 'shipping';

                const badgeBg = isPending
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : isShipping
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                const badgeLabel = isPending
                  ? 'Chờ duyệt'
                  : isShipping
                  ? 'Đang giao'
                  : 'Hoàn thành';

                return (
                  <div key={ord.id} className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors">
                    <div className="col-span-6 pr-2">
                      <Link
                        href={`/admin/orders`}
                        className="font-bold text-slate-900 hover:text-blue-600 block truncate transition-colors"
                      >
                        {ord.code}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{ord.customer_name}</div>
                    </div>

                    <div className="col-span-3 text-right font-bold text-slate-900">
                      {ord.display_total}
                    </div>

                    <div className="col-span-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg} whitespace-nowrap shadow-2xs`}
                      >
                        {badgeLabel}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">
                        {ord.time_ago}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <Link
              href="/admin/orders"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>Vào trang quản lý đơn hàng</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Card 2: Hiệu suất AI Chat */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Hiệu suất AI Chat</h2>
                <p className="text-xs text-slate-500 mt-0.5">Tỷ lệ xử lý tự động của bot</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Gemini 2.5
              </span>
            </div>

            {/* Donut Chart with Center Robot Icon */}
            <div className="relative w-40 h-40 mx-auto my-3 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />

                {/* Unanswered (13%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#cbd5e1"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - 0.13)}`}
                  transform="rotate(313 50 50)"
                />

                {/* Escalated (19%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - 0.19)}`}
                  transform="rotate(245 50 50)"
                />

                {/* Resolved (68%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - 0.68)}`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Content: Robot Icon + 68% */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">68%</span>
                <span className="text-[10px] text-slate-400 font-medium">Tự động giải quyết</span>
              </div>
            </div>

            {/* Legend below donut */}
            <div className="space-y-2 mt-4 px-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                  <span className="text-slate-600 font-medium">Resolved (Tự giải quyết)</span>
                </div>
                <span className="font-bold text-slate-900">68%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0" />
                  <span className="text-slate-600 font-medium">Escalated (Chuyển nhân viên)</span>
                </div>
                <span className="font-bold text-slate-900">19%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <span className="text-slate-600 font-medium">Unanswered (Bỏ lỡ)</span>
                </div>
                <span className="font-bold text-slate-900">13%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 text-center">
            <Link
              href="/admin/ai-advisor"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
            >
              <span>Cấu hình kịch bản AI Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Cảnh báo tồn kho */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Cảnh báo tồn kho</h2>
                  <p className="text-xs text-slate-500">Linh kiện sắp hết hàng</p>
                </div>
              </div>
              <Link
                href="/admin/products"
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Kho hàng
              </Link>
            </div>

            {/* Low Stock List */}
            <div className="space-y-3">
              {lowStockList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 truncate" title={item.name}>
                      {item.short_name}
                    </div>
                    <div
                      className={`text-[11px] font-bold mt-0.5 flex items-center gap-1 ${
                        item.stock === 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.stock === 0 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      {item.stock === 0 ? 'Hết hàng' : `Còn lại: ${item.stock} cái`}
                    </div>
                  </div>

                  <Link
                    href={`/admin/products`}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-2xs transition-all whitespace-nowrap flex-shrink-0"
                  >
                    Nhập thêm
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <Link
              href="/admin/products?stock=low_stock"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>Xem tất cả linh kiện sắp hết</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}