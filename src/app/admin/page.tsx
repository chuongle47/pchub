import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  SAMPLE_ORDERS,
  SAMPLE_LOW_STOCK,
  SAMPLE_TOP_PRODUCTS,
} from '@/lib/admin-sample-data';
import {
  MoreHorizontal,
  Bot,
  AlertTriangle,
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
        short_name: p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name,
        sku: p.sku || `SKU-${p.id ? p.id.slice(0, 6).toUpperCase() : 'PROD'}`,
        stock: p.stock ?? 0,
        price: Number(p.price || 0),
      }));
    }
  } catch (err) {
    console.error('Error fetching admin overview data:', err);
  }

  // Smooth SVG Bézier curve for sales chart: viewBox="0 0 600 220"
  const chartPath =
    'M 20 180 C 80 170, 120 125, 170 120 C 220 115, 250 145, 300 115 C 340 85, 370 85, 410 135 C 450 180, 500 180, 530 160 C 560 140, 575 80, 595 55';
  const chartArea = `${chartPath} L 595 210 L 20 210 Z`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dashboard Main Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      {/* Row 1: 4 KPI Cards (Matching Stitch Screen) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Doanh thu hôm nay */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Doanh thu hôm nay</span>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              84.320.000 <span className="underline decoration-slate-400 font-semibold text-xl">đ</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center shrink-0">
              ↑ 12%
            </span>
          </div>
        </div>

        {/* Card 2: Đơn hàng hôm nay */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Đơn hàng hôm nay</span>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              47
            </div>
            <span className="text-xs font-semibold text-teal-600 flex items-center shrink-0">
              ↑ 8
            </span>
          </div>
        </div>

        {/* Card 3: Tỷ lệ chuyển đổi */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Tỷ lệ chuyển đổi</span>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              3.2%
            </div>
            <span className="text-xs font-semibold text-teal-600 flex items-center shrink-0">
              ↑ 0.4%
            </span>
          </div>
        </div>

        {/* Card 4: AI Chat sessions */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>AI Chat sessions</span>
            <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px]">
              🤖
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">1.204</span>
              <span className="text-slate-300">|</span>
              <span className="text-lg font-bold text-indigo-600">142 →</span>
            </div>
            <span className="text-xs text-slate-400 shrink-0">đơn hàng</span>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Chart (2 cols) & Top 5 Products (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Doanh thu 30 ngày qua (Span 2 cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Doanh thu 30 ngày qua
              </h2>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
                title="Tùy chọn"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Smooth SVG Area Chart */}
            <div className="relative w-full h-64 pt-2">
              {/* Y Axis Grid & Labels */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-slate-400 pr-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>150M</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>100M</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>50M</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span>0</span>
                </div>
              </div>

              {/* SVG Graphic with Gradient Fill */}
              <svg
                className="w-full h-full overflow-visible relative z-10"
                viewBox="0 0 600 220"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="stitchBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area */}
                <path d={chartArea} fill="url(#stitchBlueGradient)" />

                {/* Smooth Curve */}
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* X Axis Milestone Dates */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-2 px-3">
              <span>01/10</span>
              <span>08/10</span>
              <span>15/10</span>
              <span>22/10</span>
              <span>30/10</span>
            </div>
          </div>
        </div>

        {/* Right Card: Top 5 Sản phẩm */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Top 5 Sản phẩm</h2>
            </div>

            <div className="space-y-4">
              {SAMPLE_TOP_PRODUCTS.map((prod, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 truncate" title={prod.name}>
                      {prod.name}
                    </span>
                    <span className="font-semibold text-slate-900 shrink-0">{prod.revenue_text}</span>
                  </div>
                  {/* Thick dark progress bar matching Stitch */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full"
                      style={{ width: `${prod.percent}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">{prod.qty} SL</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: 3 Columns Matching Stitch Screen (Orders, AI Chat Donut, Low Stock) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Đơn hàng gần đây */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Đơn hàng gần đây</h2>
              <Link
                href="/admin/orders"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả
              </Link>
            </div>

            {/* Sub-header labels */}
            <div className="grid grid-cols-12 text-[11px] text-slate-400 pb-2">
              <div className="col-span-5">Mã / Khách hàng</div>
              <div className="col-span-3 text-right">Tổng</div>
              <div className="col-span-4 text-right">Trạng thái</div>
            </div>

            {/* Order Items */}
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => {
                const isPending = ord.status === 'pending';
                const isShipping = ord.status === 'shipping';

                const badgeBg = isPending
                  ? 'bg-amber-100 text-amber-700'
                  : isShipping
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-emerald-100 text-emerald-700';

                const badgeLabel = isPending
                  ? 'Chờ xác nhận'
                  : isShipping
                  ? 'Đang giao'
                  : 'Đã thanh toán';

                return (
                  <div key={ord.id} className="grid grid-cols-12 items-center py-3 text-xs">
                    <div className="col-span-5 pr-1">
                      <Link
                        href="/admin/orders"
                        className="font-semibold text-slate-900 hover:text-blue-600 block truncate"
                      >
                        {ord.code}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {ord.customer_name}
                      </div>
                    </div>

                    <div className="col-span-3 text-right font-medium text-slate-800">
                      {ord.display_total}
                    </div>

                    <div className="col-span-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${badgeBg} whitespace-nowrap`}
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

        {/* Col 2: Hiệu suất AI Chat (Donut Chart Matching Stitch) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full text-left mb-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Hiệu suất AI Chat</h2>
          </div>

          {/* Donut Chart Visual */}
          <div className="my-auto py-4 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* SVG Ring */}
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
                <span className="text-lg font-extrabold text-slate-900">68%</span>
              </div>
            </div>
          </div>

          {/* Legend Matching Stitch Screen */}
          <div className="w-full space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs shrink-0" />
                <span>Resolved (Giải quyết)</span>
              </div>
              <span className="font-semibold text-slate-900">68%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-xs shrink-0" />
                <span>Escalated (Chuyển tiếp)</span>
              </div>
              <span className="font-semibold text-slate-900">19%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-slate-300 rounded-xs shrink-0" />
                <span>Unanswered (Bỏ lỡ)</span>
              </div>
              <span className="font-semibold text-slate-900">13%</span>
            </div>
          </div>
        </div>

        {/* Col 3: Cảnh báo tồn kho Matching Stitch */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Cảnh báo tồn kho</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStockList.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className="font-semibold text-slate-900 block truncate"
                      title={item.name}
                    >
                      {item.short_name}
                    </span>
                    <span className="text-[11px] text-amber-500 font-medium block mt-0.5">
                      Còn {item.stock} sản phẩm
                    </span>
                  </div>

                  {/* Dark solid button matching Stitch */}
                  <Link
                    href="/admin/products"
                    className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    Nhập thêm
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
