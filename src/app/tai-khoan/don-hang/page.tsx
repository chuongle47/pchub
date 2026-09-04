'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore, useOrderStore } from '@/lib/store';
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, User } from 'lucide-react';
import OrderDetailModal from '@/components/account/OrderDetailModal';

export default function OrdersPage() {
  const user = useAuthStore(state => state.user);
  const orders = useOrderStore(state => state.orders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Extract NKS user data if available
  const nksUser = (user as any)?.user || user;
  const avatarUrl = nksUser?.avatar || null;
  const userName = nksUser?.name || user?.name || 'Khách hàng';
  const userEmail = nksUser?.email || user?.email || '';
  const userPhone = nksUser?.phone || user?.phone || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Đơn hàng của tôi</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Quản lý và theo dõi danh sách các đơn hàng đã đặt</p>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: 800,
          color: '#2563eb',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '4px 14px',
          borderRadius: '20px',
        }}>
          {orders.length} đơn hàng
        </span>
      </div>
      
      {/* Recipient info card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '20px',
            flexShrink: 0,
            overflow: 'hidden',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              userName.charAt(0).toUpperCase() || <User size={24} />
            )}
          </div>
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Thông tin người nhận</span>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
              {userName} <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '13px' }}>· {userEmail}</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontFamily: 'monospace' }}>{userPhone || 'Chưa cập nhật số điện thoại'}</p>
          </div>
        </div>
        <Link 
          href="/tai-khoan/ho-so" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            background: '#f1f5f9',
            color: '#2563eb',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '12.5px',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Chỉnh sửa
        </Link>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.length ? (
          orders.map(order => {
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            const isShipping = order.status === 'shipping';
            const isPending = order.status === 'pending';

            return (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>{order.id}</span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      background: isDelivered ? '#ecfdf5' : isCancelled ? '#fff1f2' : isShipping ? '#eef2ff' : '#fffbeb',
                      color: isDelivered ? '#047857' : isCancelled ? '#be123c' : isShipping ? '#4338ca' : '#b45309',
                      border: `1px solid ${isDelivered ? '#a7f3d0' : isCancelled ? '#fecdd3' : isShipping ? '#c7d2fe' : '#fde68a'}`,
                    }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', color: '#64748b' }}>
                    <span>📅 Ngày đặt: <strong style={{ color: '#334155', fontWeight: 700 }}>{order.date}</strong></span>
                    {order.products?.length > 0 && (
                      <span>📦 {order.products.length} sản phẩm</span>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', fontWeight: 600 }}>Tổng tiền thanh toán</span>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '17px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {(Number(order.total) || 0).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '9px 16px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Xem chi tiết <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <Package size={48} style={{ margin: '0 auto 12px auto', color: '#cbd5e1' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Bạn chưa có đơn hàng nào</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px auto 0 auto', maxWidth: '360px' }}>Tất cả thông tin đơn hàng mua sắm của bạn sẽ được hiển thị tại đây.</p>
            <Link
              href="/"
              style={{
                marginTop: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Khám phá sản phẩm ngay
            </Link>
          </div>
        )}
      </div>

      {/* Order Detail Popup Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}