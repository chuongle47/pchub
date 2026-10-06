'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, MapPin, CreditCard, Clock, Package, ExternalLink, Phone, Mail, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import { useOrderStore } from '@/lib/store';

export interface OrderDetailModalProps {
  order: any | null;
  onClose: () => void;
}

const CANCEL_REASONS = [
  'Muốn thay đổi sản phẩm / số lượng',
  'Thay đổi địa chỉ hoặc số điện thoại nhận hàng',
  'Tìm thấy giá tốt hơn ở nơi khác',
  'Muốn đổi phương thức thanh toán',
  'Đặt nhầm sản phẩm',
  'Khác'
];

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCancelModal) {
          setShowCancelModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showCancelModal]);

  if (!order) return null;

  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';
  const isShipping = order.status === 'shipping';
  const isPending = order.status === 'pending' || order.status === 'on-hold';

  const canCancel = isPending;

  const products = order.products || [];
  const shipping = order.shippingAddress || {};

  const steps = [
    { label: 'Đã đặt hàng', done: true },
    { label: 'Đang chuẩn bị', done: !isCancelled },
    { label: 'Đang giao hàng', done: isShipping || isDelivered },
    { label: 'Hoàn thành', done: isDelivered }
  ];

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

        // Nếu đơn hàng thanh toán bằng ví điện tử, hoàn tiền lại vào ví
        const isPaidByWallet = order.paymentMethod === 'wallet' ||
          (order.paymentMethodLabel && order.paymentMethodLabel.toLowerCase().includes('ví'));
        if (isPaidByWallet) {
          try {
            const { useWalletStore } = await import('@/lib/wallet-store');
            useWalletStore.getState().addBalance(
              Number(order.total) || 0,
              `Hoàn tiền hủy đơn hàng ${order.id}`,
              `REF-${order.id}`,
              'REFUND'
            );
          } catch (e) {
            console.warn('Wallet refund store error:', e);
          }
        }

        setShowCancelModal(false);
        setCancelMessage(`Đã hủy đơn hàng thành công!${isPaidByWallet ? ` Tiền (${(Number(order.total) || 0).toLocaleString('vi-VN')}₫) đã được hoàn lại vào Ví điện tử.` : ''}`);
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
      <div 
        className="modal-responsive"
        style={{
          position: 'relative',
          zIndex: 10,
          width: 'min(920px, 94vw)',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        
        {/* Header */}
        <div 
          className="modal-header-responsive"
          style={{
            padding: '20px 28px',
            background: 'var(--color-secondary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-primary)',
            }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: '17px', color: '#38bdf8', letterSpacing: '0.03em' }}>
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
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Ngày đặt: <strong style={{ color: '#e2e8f0' }}>{order.date}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert Banner */}
        {cancelMessage && (
          <div style={{
            background: '#ecfdf5',
            borderBottom: '1px solid #a7f3d0',
            padding: '12px 28px',
            color: '#065f46',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} color="#10b981" />
            {cancelMessage}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div style={{
          padding: '24px 28px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          flex: 1,
        }}>
          
          {/* Top Info Grid: Shipping + Timeline */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            
            {/* Buyer & Recipient Address */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 800, fontSize: '13px' }}>
                <MapPin size={16} color="#2563eb" />
                <span>Thông tin người mua & người nhận</span>
              </div>

              {/* Buyer info */}
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.4px' }}>👤 Người mua (Tài khoản)</span>
                <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {order.buyer?.name || shipping.name || 'Khách hàng'}
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', color: '#475569', fontSize: '12px' }}>
                  {(order.buyer?.phone || shipping.phone) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} color="#64748b" /> {order.buyer?.phone || shipping.phone}
                    </span>
                  )}
                  {(order.buyer?.email || shipping.email) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} color="#64748b" /> {order.buyer?.email || shipping.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Recipient info */}
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>📦 Người nhận hàng</span>
                <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {shipping.name || order.buyer?.name || 'Khách hàng'}
                </p>
                {shipping.phone && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', margin: 0 }}>
                    <Phone size={12} color="#64748b" /> {shipping.phone}
                  </p>
                )}
                <p style={{ color: '#475569', lineHeight: '1.4', margin: '4px 0 0 0', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                  📍 {[shipping.address, shipping.ward, shipping.province].filter(p => p && p.trim()).join(', ') || 'Địa chỉ nhận hàng'}
                </p>
                {shipping.note && (
                  <p style={{ color: '#b45309', fontStyle: 'italic', background: '#fffbeb', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fef3c7', margin: '4px 0 0 0', fontSize: '11.5px' }}>
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
                        background: s.done ? (isCancelled && idx > 0 ? '#ef4444' : '#16a34a') : '#e2e8f0',
                        color: s.done ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}>
                        {isCancelled && idx === 1 ? '✕' : s.done ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontWeight: s.done ? 700 : 500, color: s.done ? '#0f172a' : '#94a3b8' }}>
                        {isCancelled && idx === 1 ? 'Đã hủy' : s.label}
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
                <span>Phương thức: <strong>{(order.paymentMethodLabel || 'Thanh toán khi nhận hàng (COD)').replace(/\s*\(NKS.*?\)/gi, '').replace(/NKS\s*/gi, '').replace(/\s*\(PCHub.*?\)/gi, '').trim()}</strong></span>
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
                      <div style={{ fontSize: '12px', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                        {price.toLocaleString('vi-VN')} ₫ × {qty}
                        {origPrice && origPrice > price && (
                          <span style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#94a3b8' }}>
                            {origPrice.toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
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
              <span style={{ fontVariantNumeric: 'tabular-nums', color: '#0f172a', fontWeight: 700 }}>
                {(Number(order.total) - (order.shippingFee || 0)).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 500 }}>
              <span>Phí vận chuyển:</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', color: '#0f172a', fontWeight: 700 }}>
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
              <span style={{ color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums', fontSize: '18px', fontWeight: 900 }}>
                {(Number(order.total) || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

        </div>

        {/* Footer with Actions */}
        <div style={{
          padding: '16px 28px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <ExternalLink size={15} /> Mở trang riêng →
            </Link>

            {canCancel && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fee2e2'; }}
              >
                <Trash2 size={14} /> Hủy đơn hàng
              </button>
            )}
          </div>

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

        {/* Cancellation Confirmation Dialog Overlay */}
        {showCancelModal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100,
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              width: 'min(480px, 92vw)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Xác nhận hủy đơn hàng
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Đơn hàng {order.id} sẽ được hủy.
                  </p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                  Vui lòng chọn lý do hủy đơn:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {CANCEL_REASONS.map(reason => (
                    <label 
                      key={reason} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontSize: '13px', 
                        color: '#1e293b', 
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: cancelReason === reason ? '#eff6ff' : 'transparent',
                        border: cancelReason === reason ? '1px solid #bfdbfe' : '1px solid transparent'
                      }}
                    >
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
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Không hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isCancelling ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isCancelling ? 'Đang hủy...' : 'Đồng ý hủy đơn'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
