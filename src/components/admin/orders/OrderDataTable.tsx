'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Package,
  Calendar,
  CreditCard,
  User,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  XCircle,
  Filter,
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
  is_test?: boolean;
}

interface Props {
  orders: OrderItem[];
  totalCount: number;
  statusCounts?: Record<string, number>;
  page: number;
  pageSize: number;
  showTest?: boolean;
}

// WCAG AA Compliant Status Badges (Contrast ratio >= 4.5:1)
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  pending: {
    label: 'Chờ duyệt',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Đang đóng gói',
    bg: 'bg-indigo-100',
    text: 'text-indigo-900',
    border: 'border-indigo-300',
    icon: Package,
  },
  shipping: {
    label: 'Đang giao',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
    icon: Truck,
  },
  completed: {
    label: 'Hoàn thành',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    border: 'border-rose-300',
    icon: XCircle,
  },
};

const PAYMENT_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: 'Chưa thanh toán',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
  },
  paid: {
    label: 'Đã thanh toán',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
  },
  failed: {
    label: 'Thất bại',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    border: 'border-rose-300',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
  },
};

export function OrderDataTable({
  orders,
  totalCount,
  statusCounts = {},
  page,
  pageSize,
  showTest = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [currentStatus, setCurrentStatus] = useState(searchParams.get('status') || '');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('payment') || '');
  const [paymentMethod, setPaymentMethod] = useState(searchParams.get('method') || '');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [includeTest, setIncludeTest] = useState(showTest);

  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('q') || '')) {
        updateQuery({ q: search, page: '1' });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleStatusTab = (statusKey: string) => {
    setCurrentStatus(statusKey);
    updateQuery({ status: statusKey, page: '1' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCurrentStatus('');
    setPaymentStatus('');
    setPaymentMethod('');
    setIncludeTest(false);
    startTransition(() => {
      router.push('/admin/orders');
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(orders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Mã đơn',
      'Khách hàng',
      'Số điện thoại',
      'Email',
      'Tổng tiền (VNĐ)',
      'Phương thức',
      'Thanh toán',
      'Trạng thái',
      'Ngày tạo',
    ];

    const rows = orders.map((o) => [
      o.code,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.phone || ''}"`,
      o.email || '',
      o.total,
      o.payment_method || 'cod',
      o.payment_status || 'pending',
      o.status || 'pending',
      new Date(o.created_at).toLocaleString('vi-VN'),
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PCHub_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency
  const formatVND = (num: number) => {
    return Number(num || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const tabs = [
    { key: '', label: 'Tất cả', count: statusCounts.all ?? totalCount },
    { key: 'pending', label: 'Chờ duyệt', count: statusCounts.pending ?? 0 },
    { key: 'confirmed', label: 'Đã xác nhận', count: statusCounts.confirmed ?? 0 },
    { key: 'shipping', label: 'Đang giao', count: statusCounts.shipping ?? 0 },
    { key: 'completed', label: 'Hoàn thành', count: statusCounts.completed ?? 0 },
    { key: 'cancelled', label: 'Đã hủy', count: statusCounts.cancelled ?? 0 },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý Đơn hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng số: <span className="font-semibold text-blue-600">{totalCount}</span> đơn hàng trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200/90 shadow-xs transition-colors cursor-pointer"
            title="Xuất file bảng tính Excel/CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất file CSV</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs with Live Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80">
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleStatusTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Single-row Compact Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
          {/* Search Box with Flex layout - Icon never overlaps text */}
          <div className="lg:col-span-5 flex items-center h-10 rounded-xl bg-slate-50 border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15 px-3 gap-2.5 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="PCH-... (Mã đơn, tên khách, số điện thoại)"
              className="w-full h-full bg-transparent border-0 outline-none text-xs text-slate-900 placeholder:text-slate-400 p-0 m-0 focus:ring-0"
            />
          </div>

          {/* Payment Method Select */}
          <div className="lg:col-span-3">
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                updateQuery({ method: e.target.value, page: '1' });
              }}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="">Tất cả phương thức thanh toán</option>
              <option value="cod">COD (Tiền mặt khi nhận)</option>
              <option value="bacs">Chuyển khoản ngân hàng</option>
              <option value="wallet">Ví điện tử / Thẻ</option>
            </select>
          </div>

          {/* Payment Status Select */}
          <div className="lg:col-span-3">
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                updateQuery({ payment: e.target.value, page: '1' });
              }}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="">Tất cả trạng thái thanh toán</option>
              <option value="pending">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thanh toán thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="lg:col-span-1 flex items-center justify-end">
            <button
              onClick={handleResetFilters}
              className="w-full h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="lg:hidden">Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Test orders toggle */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeTest}
              onChange={(e) => {
                const nextVal = e.target.checked;
                setIncludeTest(nextVal);
                updateQuery({ test: nextVal ? '1' : '' });
              }}
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-600">Hiển thị đơn hàng thử nghiệm (Test)</span>
          </label>

          {selectedIds.length > 0 && (
            <div className="text-blue-600 font-medium">
              Đã chọn <b>{selectedIds.length}</b> đơn hàng
            </div>
          )}
        </div>
      </div>

      {/* Main Table Card (Desktop >= 768px) */}
      <div className="hidden md:block rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[980px]">
            <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 sticky top-0 backdrop-blur z-10">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 min-w-[160px]">Mã đơn & Thời gian</th>
                <th className="px-4 py-3.5 min-w-[200px]">Khách hàng</th>
                <th className="px-4 py-3.5 min-w-[140px]">Tổng tiền</th>
                <th className="px-4 py-3.5 min-w-[130px]">Phương thức</th>
                <th className="px-4 py-3.5 text-center min-w-[140px]">Thanh toán</th>
                <th className="px-4 py-3.5 text-center min-w-[140px]">Trạng thái</th>
                <th className="px-4 py-3.5 text-right w-28 sticky right-0 bg-slate-50/90 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)]">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isPending ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="h-14 animate-pulse">
                    <td className="px-4 py-3.5"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-3.5"><div className="w-24 h-4 bg-slate-200 rounded mb-1" /><div className="w-16 h-3 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-3.5"><div className="w-32 h-4 bg-slate-200 rounded mb-1" /><div className="w-20 h-3 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-3.5"><div className="w-24 h-4 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-3.5"><div className="w-20 h-4 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-3.5 text-center"><div className="w-24 h-5 bg-slate-200 rounded-full mx-auto" /></td>
                    <td className="px-4 py-3.5 text-center"><div className="w-24 h-5 bg-slate-200 rounded-full mx-auto" /></td>
                    <td className="px-4 py-3.5 text-right"><div className="w-16 h-6 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((o) => {
                  const sInfo = STATUS_CONFIG[o.status] || {
                    label: o.status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-800',
                    border: 'border-slate-300',
                    icon: AlertCircle,
                  };
                  const StatusIcon = sInfo.icon;

                  const pInfo = PAYMENT_CONFIG[o.payment_status] || {
                    label: o.payment_status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-800',
                    border: 'border-slate-300',
                  };

                  const isSelected = selectedIds.includes(o.id);

                  return (
                    <tr
                      key={o.id}
                      className={`h-14 hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(o.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors font-mono tracking-tight"
                        >
                          #{o.code}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(o.created_at).toLocaleDateString('vi-VN')} {new Date(o.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 truncate">
                          {o.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {o.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {formatVND(o.total)}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 uppercase text-[11px] font-medium">
                        {o.payment_method === 'bacs'
                          ? 'Chuyển khoản'
                          : o.payment_method === 'cod'
                          ? 'COD (Tiền mặt)'
                          : o.payment_method}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1 rounded-full border ${pInfo.bg} ${pInfo.text} ${pInfo.border}`}
                        >
                          {pInfo.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${sInfo.bg} ${sInfo.text} ${sInfo.border}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{sInfo.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)]">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold text-xs transition-all shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600 text-sm">
                      Không tìm thấy đơn hàng nào phù hợp
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử đổi từ khóa tìm kiếm hoặc bấm &quot;Đặt lại bộ lọc&quot;
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị <b>{orders.length}</b> trên tổng số <b>{totalCount}</b> đơn hàng
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateQuery({ page: String(page - 1) })}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Trang trước"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="font-medium text-slate-700 px-2">
              Trang {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => updateQuery({ page: String(page + 1) })}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Trang tiếp"
              aria-label="Trang tiếp"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card List (< 768px) */}
      <div className="md:hidden space-y-3">
        {orders.length > 0 ? (
          orders.map((o) => {
            const sInfo = STATUS_CONFIG[o.status] || {
              label: o.status,
              bg: 'bg-slate-100',
              text: 'text-slate-800',
              border: 'border-slate-300',
              icon: AlertCircle,
            };
            const StatusIcon = sInfo.icon;

            const pInfo = PAYMENT_CONFIG[o.payment_status] || {
              label: o.payment_status,
              bg: 'bg-slate-100',
              text: 'text-slate-800',
              border: 'border-slate-300',
            };

            return (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-bold text-slate-900 font-mono text-sm hover:text-blue-600"
                    >
                      #{o.code}
                    </Link>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('vi-VN')} {new Date(o.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${sInfo.bg} ${sInfo.text} ${sInfo.border}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{sInfo.label}</span>
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Khách hàng:</span>
                    <span className="font-semibold text-slate-900">{o.customer_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="font-mono text-slate-700">{o.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Thanh toán:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${pInfo.bg} ${pInfo.text} ${pInfo.border}`}
                    >
                      {pInfo.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">
                    {formatVND(o.total)}
                  </div>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem chi tiết</span>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-600 text-sm">Không có đơn hàng</p>
          </div>
        )}

        {/* Mobile Pagination */}
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/90 text-xs text-slate-600">
          <span>
            Trang {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateQuery({ page: String(page - 1) })}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-40"
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => updateQuery({ page: String(page + 1) })}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
