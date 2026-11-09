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

  // SVG Chart points: ViewBox is 0 0 500 180
  // Dates: 01/10 (x=20), 08/10 (x=130), 15/10 (x=250), 22/10 (x=370), 29/10 (x=480)
  // Matching the curved wave from the screenshot:
  // Starts around y=140 (~25tr), curves up to y=90 (~80tr) at 08/10, dips slightly to y=95 at x=180,
  // peaks at y=60 (~110tr) around 15/10, valleys to y=135 (~35tr) at 22/10,
  // then swoops up steeply to y=60 (~115tr) at 29/10.
  const chartPath =
    'M 20 145 C 70 140, 95 90, 130 90 C 165 90, 205 100, 245 75 C 275 55, 305 60, 335 95 C 365 130, 395 140, 420 135 C 450 130, 465 80, 485 58';
  const chartArea = `${chartPath} L 485 170 L 20 170 Z`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu hôm nay */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-medium text-slate-500">Doanh thu hôm nay</div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
              84.320.000 ₫
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
              <span className="text-sm">↑</span>
              <span>12%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Đơn hàng hôm nay */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-medium text-slate-500">Đơn hàng hôm nay</div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">47</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
              <span className="text-sm">↑</span>
              <span>8</span>
            </div>
          </div>
        </div>

        {/* Card 3: Tỷ lệ chuyển đổi */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-medium text-slate-500">Tỷ lệ chuyển đổi</div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">3.2%</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
              <span className="text-sm">↑</span>
              <span>0.4%</span>
            </div>
          </div>
        </div>

        {/* Card 4: AI Chat sessions */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">AI Chat sessions</span>
            <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">1.204</span>
              <span className="text-slate-300 mx-1">|</span>
              <span className="text-xl sm:text-2xl font-bold text-indigo-600 tracking-tight">142</span>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-1">
                → đơn hàng
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 font-medium">
              Tỷ lệ chốt đơn AI: {SAMPLE_AI_STATS.conversion_rate}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Chart & Top 5 Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Doanh thu 30 ngày qua */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Doanh thu 30 ngày qua</h2>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
              title="Tùy chọn"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* SVG Wave Chart */}
          <div className="relative w-full h-56 pt-2">
            {/* Y Axis Grid & Labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 pr-2">
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
                <div className="flex-1 border-b border-slate-100 ml-3" />
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
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.05" />
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
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* X Axis Milestone Dates */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-3 border-t border-slate-100 mt-2 px-3">
            <span>01/10</span>
            <span>08/10</span>
            <span>15/10</span>
            <span>22/10</span>
            <span>29/10</span>
          </div>
        </div>

        {/* Right Card: Top 5 Sản phẩm */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Top 5 Sản phẩm</h2>
            <Link
              href="/admin/products"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-0.5"
            >
              Chi tiết
            </Link>
          </div>

          <div className="space-y-4">
            {SAMPLE_TOP_PRODUCTS.map((prod, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate max-w-[150px]">
                    {prod.name}
                  </span>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-bold text-slate-900">{prod.revenue_text}</span>
                    <span className="text-[10px] text-slate-400">{prod.qty} SL</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{ width: `${prod.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-right">
            <Link
              href="/admin/products"
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Xem báo cáo bán hàng lẻ →
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders, AI Chat Performance, Low Stock Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Đơn hàng gần đây */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Đơn hàng gần đây</h2>
              <Link
                href="/admin/orders"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Xem tất cả
              </Link>
            </div>

            {/* Orders Table */}
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 text-[11px] font-medium text-slate-400 pb-2">
                <div className="col-span-6">Mã / Khách hàng</div>
                <div className="col-span-3 text-right">Tổng</div>
                <div className="col-span-3 text-right">Trạng thái</div>
              </div>

              {recentOrders.map((ord) => {
                const isPending = ord.status === 'pending';
                const isShipping = ord.status === 'shipping';
                const isPaid = ord.status === 'completed' || ord.payment_status === 'paid';

                const badgeBg = isPending
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : isShipping
                  ? 'bg-sky-50 text-sky-600 border-sky-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200';

                const badgeLabel = isPending
                  ? 'Chờ xác nhận'
                  : isShipping
                  ? 'Đang giao'
                  : 'Đã thanh toán';

                return (
                  <div key={ord.id} className="grid grid-cols-12 items-center py-2.5 text-xs">
                    <div className="col-span-6 pr-2">
                      <Link
                        href={`/admin/orders`}
                        className="font-semibold text-slate-800 hover:text-blue-600 block truncate"
                      >
                        {ord.code}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate">{ord.customer_name}</div>
                    </div>

                    <div className="col-span-3 text-right font-medium text-slate-800">
                      {ord.display_total}
                    </div>

                    <div className="col-span-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeBg} whitespace-nowrap`}
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
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <span>Vào trang quản lý đơn hàng</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Card 2: Hiệu suất AI Chat */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Hiệu suất AI Chat</h2>
              <span className="text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
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
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />

                {/* Unanswered (13%) - Light Gray/Blue */}
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

                {/* Escalated (19%) - Purple */}
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

                {/* Resolved (68%) - Blue */}
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
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">68%</span>
              </div>
            </div>

            {/* Legend below donut */}
            <div className="space-y-2 mt-4 px-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 flex-shrink-0" />
                  <span className="text-slate-600">Resolved (Giải quyết)</span>
                </div>
                <span className="font-semibold text-slate-900">68%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 flex-shrink-0" />
                  <span className="text-slate-600">Escalated (Chuyển tiếp)</span>
                </div>
                <span className="font-semibold text-slate-900">19%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 flex-shrink-0" />
                  <span className="text-slate-600">Unanswered (Bỏ lỡ)</span>
                </div>
                <span className="font-semibold text-slate-900">13%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 text-center">
            <Link
              href="/admin/ai-advisor"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Cấu hình kịch bản AI Advisor →
            </Link>
          </div>
        </div>

        {/* Card 3: Cảnh báo tồn kho */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <h2 className="text-sm font-semibold text-slate-900">Cảnh báo tồn kho</h2>
              </div>
              <Link
                href="/admin/products"
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Kho hàng
              </Link>
            </div>

            {/* Low Stock List */}
            <div className="space-y-3">
              {lowStockList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1 text-xs gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800 truncate" title={item.name}>
                      {item.short_name}
                    </div>
                    <div
                      className={`text-[11px] font-medium ${
                        item.stock === 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      Còn {item.stock} sản phẩm
                    </div>
                  </div>

                  <Link
                    href={`/admin/products`}
                    className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium shadow-sm transition-colors whitespace-nowrap flex-shrink-0"
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
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
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
