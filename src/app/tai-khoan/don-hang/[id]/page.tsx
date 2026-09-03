'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useOrderStore } from '@/lib/store';

type Props = { params: Promise<{ id: string }> };

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const orders = useOrderStore(state => state.orders);
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
        <p className="text-gray-500">Không tìm thấy thông tin đơn hàng này.</p>
        <Link href="/tai-khoan/don-hang" className="text-blue-600 font-semibold hover:underline mt-4 inline-block">
          ← Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const steps = [
    { label: 'Đã đặt hàng', active: true },
    { label: 'Đang chuẩn bị hàng', active: order.status !== 'cancelled' },
    { label: 'Đang giao hàng', active: order.status === 'shipping' || order.status === 'delivered' },
    { label: 'Giao hàng thành công', active: order.status === 'delivered' }
  ];

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <Link href="/tai-khoan/don-hang" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
        ← Quay lại đơn hàng
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
          <p className="font-mono text-blue-600 mt-1 text-sm font-semibold">{order.id}</p>
        </div>
        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold mt-2 md:mt-0 ${
          order.status === 'delivered' ? 'bg-green-50 text-green-700' :
          order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {order.status === 'pending' ? 'Chờ xác nhận' :
           order.status === 'shipping' ? 'Đang giao hàng' :
           order.status === 'delivered' ? 'Đã giao thành công' :
           'Đã hủy'}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Shipping address & payment */}
        <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl">
          <strong className="text-gray-900 dark:text-white text-sm block mb-3">Thông tin giao nhận</strong>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="text-gray-400">Người nhận:</span> {order.shippingAddress.name}</p>
            <p><span className="text-gray-400">Số điện thoại:</span> {order.shippingAddress.phone}</p>
            <p><span className="text-gray-400">Email:</span> {order.shippingAddress.email}</p>
            <p><span className="text-gray-400">Địa chỉ:</span> {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}</p>
            {order.shippingAddress.note && <p><span className="text-gray-400">Ghi chú:</span> {order.shippingAddress.note}</p>}
          </div>

          <strong className="text-gray-900 dark:text-white text-sm block mt-5 mb-2">Thanh toán</strong>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order.paymentMethodLabel}</p>
        </div>

        {/* Dynamic status timeline */}
        <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl flex flex-col justify-center">
          <strong className="text-gray-900 dark:text-white text-sm block mb-3">Trạng thái xử lý</strong>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${step.active ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-gray-300'}`} />
                <span className={`text-sm ${step.active ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Pricing details */}
        <div className="mt-6 flex flex-col items-end gap-2 text-sm">
          <div className="flex justify-between w-64 text-gray-500">
            <span>Tiền hàng:</span>
            <span className="font-mono">{(order.total - order.shippingFee).toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between w-64 text-gray-500">
            <span>Phí vận chuyển:</span>
            <span className="font-mono">{order.shippingFee.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between w-64 text-gray-900 font-bold border-t border-gray-100 pt-2 text-base">
            <span>Tổng cộng:</span>
            <span className="text-blue-600 font-mono">{order.total.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>
  );
}