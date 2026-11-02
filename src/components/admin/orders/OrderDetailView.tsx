'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  PackageCheck,
  AlertTriangle,
  Loader2,
  User,
  MapPin,
  CreditCard,
  FileText,
  Save,
  History,
} from 'lucide-react';
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
  updateOrderNoteAction,
} from '@/lib/actions/admin-orders';
import { OrderInvoicePrint } from './OrderInvoicePrint';

interface Props {
  order: any;
  items: any[];
  history: any[];
}

const statusOptions = [
  { value: 'pending', label: 'Chờ duyệt (Pending)' },
  { value: 'confirmed', label: 'Đã xác nhận (Confirmed)' },
  { value: 'processing', label: 'Đang chuẩn bị hàng (Processing)' },
  { value: 'shipping', label: 'Đang giao hàng (Shipping)' },
  { value: 'completed', label: 'Hoàn thành (Completed)' },
  { value: 'cancelled', label: 'Đã hủy (Cancelled - Hoàn kho)' },
];

const paymentOptions = [
  { value: 'pending', label: 'Chưa thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'failed', label: 'Thanh toán thất bại' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

export function OrderDetailView({ order, items, history }: Props) {
  const router = useRouter();
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [currentPayment, setCurrentPayment] = useState(order.payment_status);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const [internalNote, setInternalNote] = useState(order.note || '');
  const [updatingNote, setUpdatingNote] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateStatus = async () => {
    if (currentStatus === order.status) return;
    if (currentStatus === 'cancelled') {
      if (!confirm('HỦY ĐƠN HÀNG: Toàn bộ số lượng sản phẩm trong đơn sẽ được tự động hoàn lại vào kho. Bạn có chắc chắn muốn hủy?')) {
        return;
      }
    }

    setUpdatingStatus(true);
    setMessage(null);
    try {
      await updateOrderStatusAction(order.id, currentStatus, statusNote);
      setMessage({ type: 'success', text: 'Cập nhật trạng thái đơn hàng thành công!' });
      setStatusNote('');
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi cập nhật trạng thái.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePayment = async (val: string) => {
    setCurrentPayment(val);
    setUpdatingPayment(true);
    try {
      await updatePaymentStatusAction(order.id, val);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật thanh toán.');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleSaveNote = async () => {
    setUpdatingNote(true);
    try {
      await updateOrderNoteAction(order.id, internalNote);
      alert('Đã lưu ghi chú nội bộ!');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu ghi chú.');
    } finally {
      setUpdatingNote(false);
    }
  };

  const address = typeof order.shipping_address === 'object'
    ? `${order.shipping_address.address || ''}, ${order.shipping_address.ward || ''}, ${order.shipping_address.district || ''}, ${order.shipping_address.province || ''}`
    : String(order.shipping_address || '');

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white font-mono">{order.code}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Đặt lúc: {new Date(order.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>In phiếu giao hàng</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Customer details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items List */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Danh sách sản phẩm trong đơn ({items.length})
            </h2>

            <div className="divide-y divide-slate-800/80">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{item.name_snapshot}</div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="font-mono">SKU: {item.sku_snapshot || 'N/A'}</span>
                      <span>Đơn giá: {Number(item.price_snapshot).toLocaleString('vi-VN')} ₫</span>
                      <span className="font-bold text-white">Số lượng: x{item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right font-bold text-blue-400 text-xs whitespace-nowrap">
                    {Number(item.price_snapshot * item.quantity).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-medium text-slate-200">
                  {Number(order.subtotal || order.total).toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phí giao hàng:</span>
                <span className="font-medium text-slate-200">
                  {Number(order.shipping_fee || 0).toLocaleString('vi-VN')} ₫
                </span>
              </div>
              {Boolean(order.discount && order.discount > 0) && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá:</span>
                  <span className="font-medium">
                    -{Number(order.discount).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Tổng giá trị đơn hàng:</span>
                <span className="text-blue-400 text-base">
                  {Number(order.total).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-400" />
                <span>Thông tin khách hàng</span>
              </div>
              <div className="text-xs font-semibold text-white pt-1">{order.customer_name}</div>
              <div className="text-xs text-slate-300">SĐT: <strong>{order.phone}</strong></div>
              {order.email && <div className="text-xs text-slate-400">Email: {order.email}</div>}
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Địa chỉ giao hàng</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed pt-1">
                {address || 'Nhận tại cửa hàng'}
              </div>
            </div>
          </div>

          {/* Order Status History Timeline */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <History className="w-4 h-4 text-amber-400" />
              <span>Lịch sử trạng thái đơn hàng</span>
            </div>

            <div className="space-y-3">
              {history && history.length > 0 ? (
                history.map((h, i) => (
                  <div key={h.id || i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white capitalize">{h.status}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {h.note && <div className="text-slate-400 mt-0.5">{h.note}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">Chưa có lịch sử thay đổi.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Control panel (Status change, Payment, Internal Note) */}
        <div className="space-y-6">
          {/* Order Status Manager */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Cập nhật trạng thái đơn
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Trạng thái tiến độ
              </label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Ghi chú thay đổi (gửi kèm email thông báo khách)
              </label>
              <textarea
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Ví dụ: Đã bàn giao cho đơn vị vận chuyển Viettel Post..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={updatingStatus || currentStatus === order.status}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Lưu trạng thái</span>
            </button>
          </div>

          {/* Payment Status Manager */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Thanh toán ({order.payment_method?.toUpperCase()})
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Trạng thái thanh toán
              </label>
              <select
                value={currentPayment}
                onChange={(e) => handleUpdatePayment(e.target.value)}
                disabled={updatingPayment}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {paymentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Ghi chú nội bộ
            </h2>

            <textarea
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Ghi chú riêng cho nhân viên kỹ thuật hoặc CSKH..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSaveNote}
              disabled={updatingNote}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {updatingNote ? 'Đang lưu...' : 'Lưu ghi chú nội bộ'}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Print Modal */}
      {showPrintModal && (
        <OrderInvoicePrint
          order={order}
          items={items}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}