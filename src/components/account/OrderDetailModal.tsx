'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, MapPin, CreditCard, Clock, Package, ExternalLink, Phone, Mail } from 'lucide-react';

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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
    }}>
      {/* Backdrop click listener */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Modal Container - Wide & Spacious */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: 'min(920px, 94vw)',
        maxHeight: '90vh',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
            }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '17px', color: '#38bdf8', letterSpacing: '0.03em' }}>
                  {order.id}
                </span>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  background: isDelivered ? 'rgba(34,197,94,0.15)' : isCancelled ? 'rgba(239,68,68,0.15)' : isShipping ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                  color: isDelivered ? '#4ade80' : isCancelled ? '#f87171' : isShipping ? '#818cf8' : '#fbbf24',
                  border: '1px solid currentColor',
                }}>
                  {isPending ? 'Chờ xác nhận' : isShipping ? 'Đang giao hàng' : isDelivered ? 'Đã giao thành công' : 'Đã hủy'}
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '3px 0 0 0' }}>Ngày đặt hàng: {order.date}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng popup"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#1e293b',
              border: 'none',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#334155';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1e293b';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          
          {/* Top Info Cards (Recipient + Timeline) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            {/* Recipient info */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 800, fontSize: '13px' }}>
                <MapPin size={16} color="#2563eb" />
                <span>Thông tin giao hàng</span>
              </div>
              <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', margin: 0 }}>
                  {shipping.name || 'Khách hàng'}
                </p>
                {shipping.phone && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontFamily: 'monospace', margin: 0 }}>
                    <Phone size={13} color="#64748b" /> {shipping.phone}
                  </p>
                )}
                {shipping.email && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', margin: 0 }}>
                    <Mail size={13} color="#64748b" /> {shipping.email}
                  </p>
                )}
                <p style={{ color: '#475569', lineHeight: '1.5', margin: '4px 0 0 0', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                  📍 {shipping.address || 'Địa chỉ nhận hàng'}
                  {shipping.ward ? `, ${shipping.ward}` : ''}
                  {shipping.district ? `, ${shipping.district}` : ''}
                  {shipping.province ? `, ${shipping.province}` : ''}
                </p>
                {shipping.note && (
                  <p style={{ color: '#b45309', fontStyle: 'italic', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fef3c7', margin: '6px 0 0 0', fontSize: '12px' }}>
                    📝 Ghi chú: {shipping.note}
                  </p>
                )}
              </div>
            </div>

            {/* Timeline & Payment Status */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 800, fontSize: '13px', marginBottom: '14px' }}>
                  <Clock size={16} color="#4f46e5" />
                  <span>Tiến trình đơn hàng</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {steps.map((s, idx) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: s.done ? '#16a34a' : '#e2e8f0',
                        color: s.done ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}>
                        {s.done ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontWeight: s.done ? 700 : 500, color: s.done ? '#0f172a' : '#94a3b8' }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#475569',
                fontWeight: 600,
              }}>
                <CreditCard size={15} color="#16a34a" />
                <span>Phương thức thanh toán: <strong>{order.paymentMethodLabel || 'Thanh toán khi nhận hàng (COD)'}</strong></span>
              </div>
            </div>

          </div>

          {/* Products List */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} color="#2563eb" />
              Sản phẩm trong đơn hàng ({products.length})
            </h4>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}>
              {products.map((p: any, idx: number) => {
                const name = p.name || 'Sản phẩm linh kiện';
                const price = Number(p.price) || 0;
                const origPrice = p.originalPrice ? Number(p.originalPrice) : null;
                const qty = p.quantity || 1;
                const img = p.image || '/images/cpu-box.jpg';

                return (
                  <div
                    key={p.id || idx}
                    style={{
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      borderBottom: idx < products.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    <div style={{
                      width: '52px',
                      height: '52px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      padding: '4px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <img
                        src={img}
                        alt={name}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        onError={e => { (e.target as HTMLImageElement).src = '/images/cpu-box.jpg'; }}
                      />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                        {name}
                      </h5>
                      <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                        {price.toLocaleString('vi-VN')} ₫ × {qty}
                        {origPrice && origPrice > price && (
                          <span style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#94a3b8' }}>
                            {origPrice.toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {(price * qty).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Total Summary */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 500 }}>
              <span>Tạm tính tiền hàng:</span>
              <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 700 }}>
                {(Number(order.total) - (order.shippingFee || 0)).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 500 }}>
              <span>Phí vận chuyển:</span>
              <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 700 }}>
                {order.shippingFee ? `${order.shippingFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí 🎉'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#0f172a',
              fontWeight: 800,
              borderTop: '1px solid #e2e8f0',
              paddingTop: '10px',
              marginTop: '4px',
              fontSize: '15px',
            }}>
              <span>Tổng cộng thanh toán:</span>
              <span style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '18px', fontWeight: 900 }}>
                {(Number(order.total) || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Link
            href={`/tai-khoan/don-hang/${order.id}`}
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#2563eb',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={15} /> Mở trang chi tiết riêng →
          </Link>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15,23,42,0.2)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0f172a')}
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
