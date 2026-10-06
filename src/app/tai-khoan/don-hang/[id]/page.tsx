'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useOrderStore } from '@/lib/store';
import { 
  ArrowLeft, MapPin, CreditCard, Clock, CheckCircle2, Truck, 
  Package, ShieldCheck, Trash2, AlertTriangle, User, Phone, 
  Mail, FileText, Check, Copy, RotateCcw
} from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const CANCEL_REASONS = [
  'Muốn thay đổi sản phẩm / số lượng',
  'Thay đổi địa chỉ hoặc số điện thoại nhận hàng',
  'Tìm thấy giá tốt hơn ở nơi khác',
  'Muốn đổi phương thức thanh toán',
  'Đặt nhầm sản phẩm',
  'Khác'
];

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const orders = useOrderStore(state => state.orders);
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);
  const order = orders.find(o => o.id === id || o.id === `ORD-${id}` || String(o.wooOrderId) === id);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!order) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Package size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Không tìm thấy thông tin đơn hàng</h3>
        <p className="text-slate-500 text-xs mb-6">Mã đơn hàng không tồn tại hoặc đã được chuyển khỏi tài khoản của bạn.</p>
        <Link 
          href="/tai-khoan/don-hang" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm"
        >
          <ArrowLeft size={15} /> Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const products = (order.products ?? []) as OrderItem[];

  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';
  const isShipping = order.status === 'shipping';
  const isPending = order.status === 'pending' || order.status === 'on-hold';

  const canCancel = isPending;

  const steps = [
    { label: 'Đã đặt hàng', desc: 'Đơn hàng đã được ghi nhận', done: true },
    { label: 'Đang chuẩn bị hàng', desc: isCancelled ? 'Đơn đã hủy' : 'Đóng gói & kiểm tra linh kiện', done: !isCancelled },
    { label: 'Đang giao hàng', desc: 'Bàn giao đơn vị vận chuyển', done: isShipping || isDelivered },
    { label: 'Giao hàng thành công', desc: 'Khách hàng nhận và kiểm tra', done: isDelivered }
  ];

  // Clean pure functional payment label
  const rawPaymentLabel = order.paymentMethodLabel || 'Thanh toán trực tiếp';
  const cleanPaymentLabel = rawPaymentLabel
    .replace(/\s*\(NKS.*?\)/gi, '')
    .replace(/NKS\s*/gi, '')
    .replace(/\s*\(PCHub.*?\)/gi, '')
    .trim();

  // Clean 2-tier formatted address
  const formattedAddress = [
    order.shippingAddress?.address,
    order.shippingAddress?.ward,
    order.shippingAddress?.province
  ].filter(p => p && p.trim()).join(', ') || 'Địa chỉ nhận hàng';

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setCancelMessage(null);
    try {
      const finalReason = cancelReason === 'Khác' ? customReason : cancelReason;
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          wooOrderId: order.wooOrderId,
          reason: finalReason
        })
      });
      const data = await res.json();
      if (data.success) {
        updateOrderStatus(order.id, 'cancelled', 'Đã hủy');
        order.status = 'cancelled';
        order.statusLabel = 'Đã hủy';
        setShowCancelModal(false);
        setCancelMessage('Đã hủy đơn hàng thành công!');
      } else {
        alert(data.error || 'Có lỗi khi hủy đơn');
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
      {/* 1. Top Navigation & Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
        <Link 
          href="/tai-khoan/don-hang" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60"
        >
          <ArrowLeft size={14} /> Quay lại danh sách đơn hàng
        </Link>

        {canCancel && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 px-3.5 py-1.5 rounded-xl hover:bg-rose-100 transition-all shadow-sm"
          >
            <Trash2 size={13} /> Hủy đơn hàng này
          </button>
        )}
      </div>

      {cancelMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{cancelMessage}</span>
        </div>
      )}

      {/* 2. Order Header Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Chi tiết đơn hàng</h1>
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-mono font-bold text-blue-200 border border-white/15">
              <span>{order.id}</span>
              <button 
                type="button" 
                onClick={handleCopyOrderId}
                title="Sao chép mã đơn" 
                className="hover:text-white transition-colors"
              >
                {copiedId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Thời gian đặt hàng: {order.date || 'Hôm nay'}
          </p>
        </div>

        {/* Status Badge */}
        <span className={`self-start sm:self-center px-4 py-2 rounded-xl text-xs font-extrabold border shadow-sm ${
          isDelivered ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
          isCancelled ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
          isShipping ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
          'bg-amber-500/20 text-amber-300 border-amber-500/40'
        }`}>
          {order.status === 'pending' || order.status === 'on-hold' ? '⏳ Chờ xác nhận' :
           order.status === 'shipping' ? '🚚 Đang giao hàng' :
           order.status === 'delivered' ? '✓ Đã giao thành công' :
           '✕ Đã hủy'}
        </span>
      </div>

      {/* 3. Info Boxes (2 Columns) */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Left Column: Customer & Shipping Details */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <MapPin size={16} className="text-blue-600" /> Thông tin giao nhận
          </div>
          
          {/* Buyer */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
              <User size={13} /> Người mua (Tài khoản)
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Họ tên:</span>
                <strong className="text-slate-800 font-bold">{order.buyer?.name || order.shippingAddress?.name || 'Khách hàng'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Số điện thoại:</span>
                <span className="text-slate-700 font-semibold tabular-nums">{order.buyer?.phone || order.shippingAddress?.phone || 'Chưa có'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Email:</span>
                <span className="text-slate-700 font-medium">{order.buyer?.email || order.shippingAddress?.email || 'Chưa có'}</span>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">
              <Package size={13} /> Người nhận hàng
            </div>
            <div className="text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Người nhận:</span>
                <strong className="text-slate-800 font-bold">{order.shippingAddress?.name || order.buyer?.name || 'Khách hàng'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Số điện thoại:</span>
                <span className="text-slate-700 font-semibold tabular-nums">{order.shippingAddress?.phone || 'Chưa có'}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-100">
                <span className="text-slate-400 font-medium block mb-0.5">Địa chỉ nhận hàng:</span>
                <span className="text-slate-800 font-medium leading-relaxed block">{formattedAddress}</span>
              </div>
              {order.shippingAddress?.note && (
                <div className="bg-amber-50/80 border border-amber-200/60 p-2 rounded-lg text-amber-800 text-[11.5px] italic">
                  📝 Ghi chú: {order.shippingAddress.note}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Hình thức thanh toán</span>
                <strong className="text-xs font-bold text-slate-800">{cleanPaymentLabel}</strong>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Đã thiết lập
            </span>
          </div>
        </div>

        {/* Right Column: Processing Status Stepper */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-4">
              <Clock size={16} className="text-indigo-600" /> Trạng thái xử lý đơn hàng
            </div>

            <div className="space-y-4 my-2 relative pl-2">
              {/* Stepper Vertical Line */}
              <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-200 -z-0" />

              {steps.map((step, idx) => (
                <div key={step.label} className="flex items-start gap-3.5 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                    step.done 
                      ? (isCancelled && idx > 0 ? 'bg-rose-500 text-white shadow-sm' : 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50') 
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}>
                    {isCancelled && idx === 1 ? '✕' : step.done ? '✓' : idx + 1}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {isCancelled && idx === 1 ? 'Đã hủy' : step.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 font-bold">
              <ShieldCheck size={13} /> Bảo hành chính hãng 36 tháng
            </span>
            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 font-bold">
              <RotateCcw size={13} /> Đổi trả 7 ngày
            </span>
          </div>
        </div>
      </div>

      {/* 4. Products List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Package size={16} className="text-blue-600" /> Sản phẩm đã đặt ({products.length})
        </h3>

        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
          {products.map((item, idx) => (
            <div key={item.id || idx} className="p-4 flex gap-4 items-center hover:bg-slate-50/60 transition-colors">
              <div className="w-14 h-14 bg-slate-50 rounded-xl p-1.5 flex items-center justify-center border border-slate-200/60 shrink-0">
                <img 
                  src={item.image || '/images/cpu-box.jpg'} 
                  alt={item.name} 
                  className="max-w-full max-h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).src = '/images/cpu-box.jpg'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-relaxed">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
                  {item.price.toLocaleString('vi-VN')} ₫ × {item.quantity}
                </p>
              </div>
              <span className="font-extrabold text-sm text-blue-600 tabular-nums shrink-0 pl-2">
                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="p-5 bg-slate-50/90 border border-slate-200/80 rounded-2xl flex flex-col items-end gap-2 text-xs">
          <div className="flex justify-between w-64 text-slate-500 font-medium">
            <span>Tiền hàng sản phẩm:</span>
            <span className="tabular-nums text-slate-800 font-bold">
              {(order.total - (order.shippingFee || 0)).toLocaleString('vi-VN')} ₫
            </span>
          </div>
          <div className="flex justify-between w-64 text-slate-500 font-medium">
            <span>Phí vận chuyển:</span>
            <span className="tabular-nums text-slate-800 font-bold">
              {order.shippingFee ? `${order.shippingFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí 🎉'}
            </span>
          </div>
          <div className="flex justify-between w-64 text-slate-900 font-black border-t border-slate-200/80 pt-2.5 text-sm mt-1">
            <span>Tổng cộng thanh toán:</span>
            <span className="text-blue-600 tabular-nums text-lg font-black">{order.total.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>

      {/* 5. Cancel Order Modal Dialog */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Xác nhận hủy đơn hàng</h3>
                <p className="text-xs text-slate-500">Đơn hàng {order.id} sẽ được hủy khỏi hệ thống.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Lý do bạn muốn hủy đơn:</label>
              <div className="space-y-1.5">
                {CANCEL_REASONS.map(reason => (
                  <label key={reason} className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                    cancelReason === reason ? 'bg-blue-50 border-blue-200 font-bold text-blue-900' : 'border-transparent text-slate-700 hover:bg-slate-50'
                  }`}>
                    <input 
                      type="radio" 
                      name="cancelReason" 
                      value={reason} 
                      checked={cancelReason === reason} 
                      onChange={() => setCancelReason(reason)} 
                    />
                    {reason}
                  </label>
                ))}
              </div>

              {cancelReason === 'Khác' && (
                <textarea
                  rows={2}
                  placeholder="Nhập lý do chi tiết..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              >
                Không hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isCancelling ? 'Đang hủy...' : 'Đồng ý hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}