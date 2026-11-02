'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
} from 'lucide-react';

interface OrderItem {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  items_count?: number;
}

interface Props {
  orders: OrderItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const statusBadge: Record<string, { label: string; class: string }> = {
  pending: { label: 'Chờ duyệt', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  confirmed: { label: 'Đã xác nhận', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  processing: { label: 'Đang chuẩn bị', class: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  shipping: { label: 'Đang giao', class: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  completed: { label: 'Hoàn thành', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Đã hủy', class: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

const paymentBadge: Record<string, { label: string; class: string }> = {
  pending: { label: 'Chưa thanh toán', class: 'text-slate-400 border-slate-700 bg-slate-800/60' },
  paid: { label: 'Đã thanh toán', class: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  failed: { label: 'Thất bại', class: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  refunded: { label: 'Đã hoàn tiền', class: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
};

export function OrderDataTable({ orders, totalCount, page, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('payment') || '');

  const totalPages = Math.ceil(totalCount / pageSize);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (status) params.set('status', status);
    if (paymentStatus) params.set('payment', paymentStatus);
    params.set('page', '1');

    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleExportCSV = () => {
    const headers = ['Mã đơn', 'Khách hàng', 'Số điện thoại', 'Email', 'Tổng tiền (VND)', 'Phương thức', 'Thanh toán', 'Trạng thái', 'Ngày tạo'];
    const rows = orders.map((o) => [
      o.code,
      `"${o.customer_name.replace(/"/g, '""')}"`,
      o.phone,
      o.email || '',
      o.total,
      o.payment_method,
      o.payment_status,
      o.status,
      new Date(o.created_at).toLocaleString('vi-VN'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PCHub_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý Đơn Hàng</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tổng số: <span className="font-semibold text-blue-400">{totalCount}</span> đơn hàng trong hệ thống
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất danh sách CSV</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Tìm theo mã đơn (PCH-...), tên khách, SĐT..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt (Mới)</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang đóng gói</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả thanh toán</option>
              <option value="pending">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thanh toán thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-800/80">
          <button
            onClick={applyFilters}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
            <span>Lọc đơn hàng</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Mã đơn & Thời gian</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Phương thức</th>
                <th className="p-4 text-center">Thanh toán</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.length > 0 ? (
                orders.map((o) => {
                  const sInfo = statusBadge[o.status] || { label: o.status, class: 'bg-slate-800 text-slate-400' };
                  const pInfo = paymentBadge[o.payment_status] || { label: o.payment_status, class: 'text-slate-400' };

                  return (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Code & Date */}
                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-bold text-blue-400 hover:text-blue-300 font-mono text-xs block"
                        >
                          {o.code}
                        </Link>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(o.created_at).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-semibold text-white">{o.customer_name}</div>
                        <div className="text-[11px] text-slate-400">{o.phone}</div>
                      </td>

                      {/* Total */}
                      <td className="p-4 font-bold text-white text-xs">
                        {Number(o.total).toLocaleString('vi-VN')} ₫
                      </td>

                      {/* Payment method */}
                      <td className="p-4 text-[11px] text-slate-300 uppercase font-mono">
                        {o.payment_method}
                      </td>

                      {/* Payment status */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${pInfo.class}`}>
                          {pInfo.label}
                        </span>
                      </td>

                      {/* Order status */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sInfo.class}`}>
                          {sInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Trang <span className="font-bold text-white">{page}</span> / {totalPages} (Tổng số {totalCount} đơn)
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href={`/admin/orders?page=${Math.max(page - 1, 1)}`}
                className={`p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors ${
                  page <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/orders?page=${Math.min(page + 1, totalPages)}`}
                className={`p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors ${
                  page >= totalPages ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}