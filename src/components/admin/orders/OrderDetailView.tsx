'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
  updateOrderNoteAction,
} from '@/lib/actions/admin-orders';

interface OrderItem {
  id: string;
  product_id?: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
}

interface StatusHistory {
  id: string;
  status: string;
  note?: string;
  created_at: string;
}

interface OrderDetailProps {
  order: {
    id: string;
    code: string;
    customer_name: string;
    phone: string;
    email: string | null;
    shipping_address: any;
    subtotal: number | string;
    shipping_fee: number | string;
    discount: number | string;
    tax: number | string;
    total: number | string;
    payment_method: string;
    payment_status: string;
    status: string;
    note: string | null;
    created_at: string;
    updated_at: string;
  };
  items: OrderItem[];
  history: StatusHistory[];
}

const STEPS = [
  { key: 'pending', label: 'Chờ duyệt', icon: Clock },
  { key: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle2 },
  { key: 'shipping', label: 'Đang giao hàng', icon: Truck },
  { key: 'completed', label: 'Hoàn thành', icon: Package },
];

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
  pending: {
    label: 'Chờ xác nhận',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: CheckCircle2,
  },
  shipping: {
    label: 'Đang giao hàng',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    icon: Truck,
  },
  completed: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: Package,
  },
  cancelled: {
    label: 'Đã hủy đơn',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    icon: XCircle,
  },
};

export function OrderDetailView({ order, items, history }: OrderDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStatus, setCurrentStatus] = useState(order.status || 'pending');
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(order.payment_status || 'pending');
  const [adminNote, setAdminNote] = useState(order.note || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Parse address
  const formatAddress = (addr: any) => {
    if (!addr) return 'Chưa cập nhật địa chỉ';
    if (typeof addr === 'string') return addr;
    const parts = [addr.address, addr.ward, addr.district, addr.province].filter(Boolean);
    return parts.join(', ') || 'Chưa cập nhật địa chỉ';
  };

  const formatVND = (num: number | string) => {
    return Number(num || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Status Change
  const handleUpdateStatus = (newStatus: string) => {
    const label = STATUS_CONFIG[newStatus]?.label || newStatus;
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng sang "${label}"?`)) return;

    startTransition(async () => {
      try {
        await updateOrderStatusAction(order.id, newStatus, `Quản trị viên chuyển trạng thái sang ${label}`);
        setCurrentStatus(newStatus);
        setMessage({ type: 'success', text: `Đã cập nhật trạng thái đơn hàng: ${label}` });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Lỗi khi cập nhật trạng thái đơn' });
      }
    });
  };

  // Payment Status Toggle
  const handleTogglePayment = () => {
    const nextPay = currentPaymentStatus === 'paid' ? 'pending' : 'paid';
    const payLabel = nextPay === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán';

    startTransition(async () => {
      try {
        await updatePaymentStatusAction(order.id, nextPay);
        setCurrentPaymentStatus(nextPay);
        setMessage({ type: 'success', text: `Đã cập nhật thanh toán: ${payLabel}` });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Lỗi cập nhật thanh toán' });
      }
    });
  };

  // Save Note
  const handleSaveNote = () => {
    startTransition(async () => {
      try {
        await updateOrderNoteAction(order.id, adminNote.trim());
        setMessage({ type: 'success', text: 'Đã lưu ghi chú đơn hàng' });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Lỗi khi lưu ghi chú' });
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const statusInfo = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
  const isCancelled = currentStatus === 'cancelled';

  const currentStepIdx = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 print:p-0 print:max-w-none">
      {/* Printable Invoice Header (Visible only when printing) */}
      <div className="hidden print:block mb-8 border-b border-slate-300 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">PCHUB VIỆT NAM</h1>
            <p className="text-xs text-slate-600 mt-1">Hệ thống phân phối linh kiện máy tính & PC Workstation</p>
            <p className="text-xs text-slate-600">Hotline: 1900-8888 • Email: support@pchub.vn • Website: pchub.vn</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-900">HÓA ĐƠN BÁN LẺ</h2>
            <p className="text-xs font-mono font-semibold text-blue-600 mt-1">Mã đơn: #{order.code}</p>
            <p className="text-xs text-slate-500">Ngày tạo: {formatDate(order.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb & Navigation (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-colors"
            title="Quay lại danh sách đơn hàng"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Quản lý đơn hàng</span>
              <span className="text-xs text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-900">Chi tiết #{order.code}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5 flex items-center gap-3">
              <span>Đơn hàng #{order.code}</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}
              >
                <statusInfo.icon className="w-3.5 h-3.5" />
                <span>{statusInfo.label}</span>
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In hóa đơn</span>
          </button>
        </div>
      </div>

      {/* Alert Notification Feedback */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 print:hidden ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs underline hover:no-underline font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Order Progress Stepper (Hidden on print) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Tiến trình xử lý đơn hàng
          </h2>
          <span className="text-xs text-slate-400">
            Tạo lúc: {formatDate(order.created_at)}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">Đơn hàng này đã bị hủy</div>
              <p className="text-xs text-rose-700 mt-0.5">
                Tồn kho của các linh kiện trong đơn đã được tự động hoàn trả vào kho hàng.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Step Track */}
            <div className="hidden sm:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-100 z-0">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, (currentStepIdx / (STEPS.length - 1)) * 100))}%`,
                }}
              />
            </div>

            {/* Step Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                          : isPassed
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs mt-2 font-semibold ${
                        isCurrent ? 'text-blue-600' : isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Stepper Action Buttons */}
        {!isCancelled && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Chuyển nhanh bước xử lý:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {currentStatus === 'pending' && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleUpdateStatus('confirmed')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  Xác nhận đơn hàng →
                </button>
              )}
              {currentStatus === 'confirmed' && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleUpdateStatus('shipping')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  Bắt đầu giao hàng →
                </button>
              )}
              {currentStatus === 'shipping' && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleUpdateStatus('completed')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  Hoàn tất đơn hàng ✓
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleUpdateStatus('cancelled')}
                className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hủy đơn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Products & Status History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products List Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Danh sách linh kiện ({items.length})</span>
              </h2>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3 pr-4">Sản phẩm</th>
                    <th className="pb-3 px-3">Mã SKU</th>
                    <th className="pb-3 px-3 text-right">Đơn giá</th>
                    <th className="pb-3 px-3 text-center">SL</th>
                    <th className="pb-3 pl-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || '/images/cpu-box.jpg'}
                            alt={item.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/cpu-box.jpg';
                            }}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 line-clamp-2">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {item.sku || 'N/A'}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-700 whitespace-nowrap">
                        {formatVND(item.price)}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 pl-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatVND(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-slate-200/80 space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tiền hàng (Tạm tính):</span>
                <span className="font-semibold text-slate-900">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-slate-900">{formatVND(order.shipping_fee)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                  <span>Mã giảm giá (Coupon):</span>
                  <span>-{formatVND(order.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Tổng cộng:</span>
                <span className="text-base font-black text-blue-600">{formatVND(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Status History Timeline (Hidden on print) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 print:hidden">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Lịch sử trạng thái</span>
            </h2>

            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
              {history.map((h, i) => (
                <div key={h.id || i} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-xs font-bold text-slate-900">
                      {h.note || `Trạng thái: ${h.status}`}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDate(h.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Customer, Payment, Notes */}
        <div className="space-y-6">
          {/* Customer & Shipping Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Khách hàng & Giao nhận</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {order.customer_name}
                  </span>
                  <span className="text-[11px] text-slate-400">Khách mua hàng trực tuyến</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`tel:${order.phone}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {order.phone || 'Chưa có SĐT'}
                </a>
              </div>

              {order.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${order.email}`}
                    className="text-slate-600 hover:text-blue-600 truncate"
                  >
                    {order.email}
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Địa chỉ giao hàng:</span>
                  <span className="font-medium text-slate-800 leading-relaxed block mt-0.5">
                    {formatAddress(order.shipping_address)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Thanh toán</span>
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  currentPaymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {currentPaymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-semibold text-slate-900 uppercase">
                  {order.payment_method === 'bacs'
                    ? 'Chuyển khoản ngân hàng (QR)'
                    : order.payment_method === 'cod'
                    ? 'Thanh toán khi nhận hàng (COD)'
                    : order.payment_method || 'COD'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 print:hidden">
              <button
                type="button"
                disabled={isPending}
                onClick={handleTogglePayment}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {currentPaymentStatus === 'paid'
                  ? '↺ Chuyển về Chờ thanh toán'
                  : '✓ Đánh dấu Đã thanh toán'}
              </button>
            </div>
          </div>

          {/* Order Notes Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Ghi chú đơn hàng</span>
            </h2>

            {/* Customer Note */}
            {order.note && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                <span className="font-bold block text-[11px] mb-1">Ghi chú từ khách:</span>
                <p className="italic">{order.note}</p>
              </div>
            )}

            {/* Admin Internal Note (Print: hidden textarea, shows text) */}
            <div className="space-y-2 print:hidden">
              <label className="block text-[11px] font-semibold text-slate-600">
                Ghi chú nội bộ nhân viên:
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Nhập ghi chú xử lý đơn, số vận đơn, dặn dò..."
                style={{ color: '#0f172a', backgroundColor: '#f8fafc' }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveNote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Lưu ghi chú</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Footer (Visible only when printing) */}
      <div className="hidden print:block mt-12 pt-8 border-t border-slate-300">
        <div className="grid grid-cols-2 text-center text-xs">
          <div>
            <p className="font-bold text-slate-900">NGƯỜI MUA HÀNG</p>
            <p className="text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-20" />
            <p className="font-semibold text-slate-800">{order.customer_name}</p>
          </div>
          <div>
            <p className="font-bold text-slate-900">ĐẠI DIỆN PCHUB</p>
            <p className="text-slate-500 italic mt-0.5">(Ký, đóng dấu)</p>
            <div className="h-20" />
            <p className="font-semibold text-slate-800">Bộ phận giao nhận PCHub</p>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-8 italic">
          Cảm ơn quý khách đã mua hàng tại PCHub! Linh kiện được bảo hành chính hãng theo tiêu chuẩn của nhà sản xuất.
        </p>
      </div>
    </div>
  );
}
