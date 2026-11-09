'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
  pending: { label: 'Chờ duyệt', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Đã xác nhận', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'Đang chuẩn bị', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  shipping: { label: 'Đang giao', class: 'bg-sky-50 text-sky-700 border-sky-200' },
  completed: { label: 'Hoàn thành', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Đã hủy', class: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const paymentBadge: Record<string, { label: string; class: string }> = {
  pending: { label: 'Chưa thanh toán', class: 'text-slate-600 border-slate-200 bg-slate-100' },
  paid: { label: 'Đã thanh toán', class: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
  failed: { label: 'Thất bại', class: 'text-rose-700 border-rose-200 bg-rose-50' },
  refunded: { label: 'Đã hoàn tiền', class: 'text-purple-700 border-purple-200 bg-purple-50' },
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Đơn Hàng</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng số: <span className="font-semibold text-blue-600">{totalCount}</span> đơn hàng trong hệ thống
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Xuất danh sách CSV</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Tìm theo mã đơn (ORD-...), tên khách, SĐT..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            >
              <option value="">Tất cả thanh toán</option>
              <option value="pending">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thanh toán thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            onClick={applyFilters}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
            <span>Lọc đơn hàng</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4 min-w-[150px]">Mã đơn & Thời gian</th>
                <th className="p-4 min-w-[180px]">Khách hàng</th>
                <th className="p-4 min-w-[130px]">Tổng tiền</th>
                <th className="p-4 min-w-[120px]">Phương thức</th>
                <th className="p-4 text-center min-w-[130px]">Thanh toán</th>
                <th className="p-4 text-center min-w-[130px]">Trạng thái</th>
                <th className="p-4 text-right min-w-[100px]">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length > 0 ? (
                orders.map((o) => {
                  const sInfo = statusBadge[o.status] || { label: o.status, class: 'bg-slate-100 text-slate-600 border-slate-200' };
                  const pInfo = paymentBadge[o.payment_status] || { label: o.payment_status, class: 'bg-slate-100 text-slate-600 border-slate-200' };

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Code & Date */}
                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-bold text-blue-600 hover:underline font-mono text-xs block"
                        >
                          {o.code}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
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
                        <div className="font-semibold text-slate-900">{o.customer_name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{o.phone}</div>
                      </td>

                      {/* Total */}
                      <td className="p-4 font-bold text-slate-900 text-xs sm:text-sm">
                        {Number(o.total).toLocaleString('vi-VN')} ₫
                      </td>

                      {/* Payment method */}
                      <td className="p-4 text-[11px] text-slate-600 uppercase font-mono font-semibold">
                        {o.payment_method}
                      </td>

                      {/* Payment status */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${pInfo.class}`}>
                          {pInfo.label}
                        </span>
                      </td>

                      {/* Order status */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sInfo.class}`}>
                          {sInfo.label}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors text-xs font-semibold"
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
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Trang <span className="font-bold text-slate-800">{page}</span> / {totalPages} (Tổng số {totalCount} đơn hàng)
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/orders?page=${Math.max(page - 1, 1)}`}
                className={`p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors ${
                  page <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/orders?page=${Math.min(page + 1, totalPages)}`}
                className={`p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors ${
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
