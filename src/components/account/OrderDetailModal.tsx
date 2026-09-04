'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, MapPin, CreditCard, Clock, CheckCircle2, Truck, Package, ShieldCheck, ExternalLink, Phone, Mail } from 'lucide-react';

export interface OrderDetailModalProps {
  order: any | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';
  const isShipping = order.status === 'shipping';
  const isPending = order.status === 'pending';

  const products = order.products || [];
  const shipping = order.shippingAddress || {};

  const steps = [
    { label: 'Đã đặt hàng', done: true },
    { label: 'Đang chuẩn bị', done: !isCancelled },
    { label: 'Đang giao hàng', done: isShipping || isDelivered },
    { label: 'Hoàn thành', done: isDelivered }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-md">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-base tracking-wider text-blue-400">{order.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                  isDelivered ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  isCancelled ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  isShipping ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isPending ? 'Chờ xác nhận' :
                   isShipping ? 'Đang giao hàng' :
                   isDelivered ? 'Đã giao thành công' : 'Đã hủy'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Ngày đặt: {order.date}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng popup"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Info cards grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Recipient info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                <MapPin size={15} className="text-blue-600 shrink-0" />
                <span>Thông tin nhận hàng</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900 text-sm">{shipping.name || 'Khách hàng'}</p>
                {shipping.phone && (
                  <p className="flex items-center gap-1.5 text-slate-600 font-mono">
                    <Phone size={12} className="text-slate-400" /> {shipping.phone}
                  </p>
                )}
                {shipping.email && (
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <Mail size={12} className="text-slate-400" /> {shipping.email}
                  </p>
                )}
                <p className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60 mt-1">
                  📍 {shipping.address || 'Địa chỉ nhận hàng'}
                  {shipping.ward ? `, ${shipping.ward}` : ''}
                  {shipping.district ? `, ${shipping.district}` : ''}
                  {shipping.province ? `, ${shipping.province}` : ''}
                </p>
                {shipping.note && (
                  <p className="text-amber-700 italic bg-amber-50 p-2 rounded-lg border border-amber-200/60 mt-2">
                    📝 Ghi chú: {shipping.note}
                  </p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs mb-3">
                  <Clock size={15} className="text-indigo-600 shrink-0" />
                  <span>Trạng thái xử lý</span>
                </div>
                <div className="space-y-2.5">
                  {steps.map((s, idx) => (
                    <div key={s.label} className="flex items-center gap-2.5 text-xs">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        s.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {s.done ? '✓' : idx + 1}
                      </div>
                      <span className={`font-bold ${s.done ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                <CreditCard size={13} className="text-emerald-600 shrink-0" />
                <span>{order.paymentMethodLabel || 'Thanh toán COD'}</span>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package size={14} className="text-blue-600" />
              Sản phẩm trong đơn ({products.length})
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {products.map((p: any, idx: number) => {
                const name = p.name || 'Sản phẩm linh kiện';
                const price = Number(p.price) || 0;
                const qty = p.quantity || 1;
                const img = p.image || '/images/cpu-box.jpg';

                return (
                  <div key={p.id || idx} className="p-3.5 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl p-1 border border-slate-100 flex items-center justify-center shrink-0">
                      <img
                        src={img}
                        alt={name}
                        className="max-w-full max-h-full object-contain"
                        onError={e => { (e.target as HTMLImageElement).src = '/images/cpu-box.jpg'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">{name}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{price.toLocaleString('vi-VN')} ₫ × {qty}</p>
                    </div>
                    <span className="font-extrabold text-xs text-blue-600 font-mono shrink-0 pl-2">
                      {(price * qty).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-mono text-slate-800 font-bold">
                {(Number(order.total) - (order.shippingFee || 0)).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Phí vận chuyển:</span>
              <span className="font-mono text-slate-800 font-bold">
                {order.shippingFee ? `${order.shippingFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí 🎉'}
              </span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold border-t border-slate-200 pt-2 text-sm">
              <span>Tổng cộng thanh toán:</span>
              <span className="text-blue-600 font-mono text-base font-extrabold">
                {(Number(order.total) || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <Link
            href={`/tai-khoan/don-hang/${order.id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <ExternalLink size={14} /> Mở trang chi tiết riêng
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
