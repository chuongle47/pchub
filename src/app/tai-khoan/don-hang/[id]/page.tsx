'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useOrderStore } from '@/lib/store';
import { ArrowLeft, MapPin, CreditCard, Clock, CheckCircle2, Truck, Package, ShieldCheck } from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const orders = useOrderStore(state => state.orders);
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
        <Package size={48} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-600 font-medium">Không tìm thấy thông tin đơn hàng này.</p>
        <Link href="/tai-khoan/don-hang" className="text-blue-600 font-bold hover:underline mt-4 inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft size={16} /> Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const products = (order.products ?? []) as OrderItem[];

  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';
  const isShipping = order.status === 'shipping';

  const steps = [
    { label: 'Đã đặt hàng', done: true },
    { label: 'Đang chuẩn bị hàng', done: !isCancelled },
    { label: 'Đang giao hàng', done: isShipping || isDelivered },
    { label: 'Giao hàng thành công', done: isDelivered }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Back button */}
      <div>
        <Link 
          href="/tai-khoan/don-hang" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={14} /> Quay lại danh sách đơn hàng
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Chi tiết đơn hàng</h1>
          <p className="font-mono text-blue-600 mt-1 text-sm font-bold">{order.id}</p>
        </div>
        <span className={`self-start sm:self-center px-3.5 py-1.5 rounded-full text-xs font-bold border ${
          isDelivered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' :
          isShipping ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
          'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {order.status === 'pending' ? 'Chờ xác nhận' :
           order.status === 'shipping' ? 'Đang giao hàng' :
           order.status === 'delivered' ? 'Đã giao thành công' :
           'Đã hủy'}
        </span>
      </div>

      {/* Info Boxes Grid (High Contrast Light Backgrounds) */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Shipping address & payment */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-3">
              <MapPin size={16} className="text-blue-600" /> Thông tin giao nhận
            </div>
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="flex"><span className="w-24 text-slate-400 font-medium shrink-0">Người nhận:</span> <strong className="text-slate-800 font-bold">{order.shippingAddress.name}</strong></div>
              <div className="flex"><span className="w-24 text-slate-400 font-medium shrink-0">Số điện thoại:</span> <span className="text-slate-800 font-semibold font-mono">{order.shippingAddress.phone}</span></div>
              <div className="flex"><span className="w-24 text-slate-400 font-medium shrink-0">Email:</span> <span className="text-slate-800 font-medium">{order.shippingAddress.email}</span></div>
              <div className="flex"><span className="w-24 text-slate-400 font-medium shrink-0">Địa chỉ:</span> <span className="text-slate-800 font-medium">{order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}</span></div>
              {order.shippingAddress.note && (
                <div className="flex"><span className="w-24 text-slate-400 font-medium shrink-0">Ghi chú:</span> <span className="text-amber-700 font-medium italic">{order.shippingAddress.note}</span></div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-1.5">
              <CreditCard size={16} className="text-emerald-600" /> Phương thức thanh toán
            </div>
            <p className="text-xs text-slate-700 font-semibold">{order.paymentMethodLabel}</p>
          </div>
        </div>

        {/* Status timeline */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-4">
            <Clock size={16} className="text-indigo-600" /> Trạng thái xử lý đơn hàng
          </div>

          <div className="space-y-3.5 my-auto">
            {steps.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  step.done ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-400'
                }`}>
                  {step.done ? '✓' : idx + 1}
                </div>
                <span className={`text-xs font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200/60 mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" /> Bảo hành chính hãng 36 tháng
          </div>
        </div>
      </div>

      {/* Products list */}
      <div className="pt-2">
        <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <Package size={16} className="text-blue-600" /> Sản phẩm đã đặt ({products.length})
        </h3>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
          {products.map((item) => (
            <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-slate-50/50 transition-colors">
              <div className="w-14 h-14 bg-slate-50 rounded-xl p-1.5 flex items-center justify-center border border-slate-100 shrink-0">
                <img 
                  src={item.image || '/images/cpu-box.jpg'} 
                  alt={item.name} 
                  className="max-w-full max-h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).src = '/images/cpu-box.jpg'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-relaxed">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">{item.price.toLocaleString('vi-VN')} ₫ × {item.quantity}</p>
              </div>
              <span className="font-extrabold text-sm text-blue-600 font-mono shrink-0 pl-2">
                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          ))}
        </div>

        {/* Pricing summary */}
        <div className="mt-5 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-end gap-2 text-xs">
          <div className="flex justify-between w-64 text-slate-500 font-medium">
            <span>Tiền hàng sản phẩm:</span>
            <span className="font-mono text-slate-800 font-bold">{(order.total - (order.shippingFee || 0)).toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between w-64 text-slate-500 font-medium">
            <span>Phí vận chuyển:</span>
            <span className="font-mono text-slate-800 font-bold">
              {order.shippingFee ? `${order.shippingFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí 🎉'}
            </span>
          </div>
          <div className="flex justify-between w-64 text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm mt-1">
            <span>Tổng cộng thanh toán:</span>
            <span className="text-blue-600 font-mono text-base font-extrabold">{order.total.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}