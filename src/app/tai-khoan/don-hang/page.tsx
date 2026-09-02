'use client';

import Link from 'next/link';
import { useAuthStore, useOrderStore } from '@/lib/store';

export default function OrdersPage() {
  const user = useAuthStore(state => state.user);
  const orders = useOrderStore(state => state.orders);
  
  // Extract NKS user data if available
  const nksUser = (user as any)?.user || user;
  const avatarUrl = nksUser?.avatar || null;
  const userName = nksUser?.name || user?.name || 'Khách hàng';
  const userEmail = nksUser?.email || user?.email || '';
  const userPhone = nksUser?.phone || user?.phone || '';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Đơn hàng của tôi</h1>
      
      <div className="order-customer-info">
        <div className="order-customer-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : userName.charAt(0) ?? 'U'}
        </div>
        <div>
          <strong>Thông tin người nhận</strong>
          <p>{userName} · {userEmail}</p>
          <small>{userPhone || 'Chưa cập nhật số điện thoại'}</small>
        </div>
        <Link href="/tai-khoan/ho-so">Chỉnh sửa</Link>
      </div>

      <div className="space-y-4">
        {orders.length ? (
          orders.map(order => (
            <div key={order.id} className="bg-white border rounded-xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-blue-300 transition-all">
              <div>
                <p className="font-mono font-semibold text-gray-900">{order.id}</p>
                <p className="text-xs text-gray-400 mt-1">Ngày đặt: {order.date}</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mt-2 ${
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
              <div className="text-right">
                <p className="font-bold text-blue-600 font-mono">{(Number(order.total) || 0).toLocaleString('vi-VN')} ₫</p>
                <Link href={`/tai-khoan/don-hang/${order.id}`} className="text-sm text-blue-600 hover:underline mt-2 inline-block font-semibold">
                  Xem chi tiết →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border rounded-xl p-12 text-center text-gray-500 shadow-sm">
            <p>Bạn chưa có đơn hàng nào.</p>
            <Link href="/" className="text-blue-600 font-semibold hover:underline mt-3 inline-block">
              Mua sắm ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}