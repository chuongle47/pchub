'use client';

import Link from 'next/link';
import { useAuthStore, useOrderStore } from '@/lib/store';
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, User } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Đơn hàng của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi danh sách các đơn hàng đã đặt</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
          {orders.length} đơn hàng
        </span>
      </div>
      
      {/* Recipient info card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 overflow-hidden shadow-inner border-2 border-white">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase() || <User size={24} />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Thông tin người nhận</span>
            <h3 className="font-bold text-slate-900 text-base mt-0.5">{userName} <span className="text-slate-400 font-normal text-sm">· {userEmail}</span></h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">{userPhone || 'Chưa cập nhật số điện thoại'}</p>
          </div>
        </div>
        <Link 
          href="/tai-khoan/ho-so" 
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl text-xs font-bold transition-all duration-200 self-start sm:self-center"
        >
          Chỉnh sửa
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length ? (
          orders.map(order => {
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            const isShipping = order.status === 'shipping';
            const isPending = order.status === 'pending';

            return (
              <div 
                key={order.id} 
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-base">{order.id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isDelivered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      isShipping ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isDelivered && <CheckCircle2 size={13} />}
                      {isCancelled && <XCircle size={13} />}
                      {isShipping && <Truck size={13} />}
                      {isPending && <Clock size={13} />}
                      {order.status === 'pending' ? 'Chờ xác nhận' :
                       order.status === 'shipping' ? 'Đang giao hàng' :
                       order.status === 'delivered' ? 'Đã giao thành công' :
                       'Đã hủy'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>📅 Ngày đặt: <strong className="text-slate-700 font-semibold">{order.date}</strong></span>
                    {order.products?.length > 0 && (
                      <span>📦 {order.products.length} sản phẩm</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Tổng tiền thanh toán</span>
                    <span className="font-extrabold text-blue-600 text-lg font-mono">
                      {(Number(order.total) || 0).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <Link 
                    href={`/tai-khoan/don-hang/${order.id}`} 
                    className="inline-flex items-center gap-1 px-4 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-extrabold transition-all duration-200"
                  >
                    Xem chi tiết <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <Package size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Bạn chưa có đơn hàng nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Tất cả thông tin đơn hàng mua sắm của bạn sẽ được hiển thị tại đây.</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}