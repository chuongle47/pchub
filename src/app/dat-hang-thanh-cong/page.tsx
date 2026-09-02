'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';
import StepIndicator from '@/components/checkout/StepIndicator';
import {
  CheckCircle, Package, Home, Phone, Clock,
  ShieldCheck, Truck, Star, ChevronRight
} from 'lucide-react';

export default function OrderSuccessPage() {
  const clearCart = useCartStore(state => state.clearCart);
  const orderId = useSearchParams().get('orderId') ?? 'ORD-PCHUB';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    clearCart();
    // small delay to trigger animation
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, [clearCart]);

  const orderDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const estimatedDelivery = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  })();

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px' }}>

        <StepIndicator currentStep={4} />

        {/* Main success card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease',
        }}>

          {/* Top success header */}
          <div style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            padding: '40px 32px',
            textAlign: 'center',
          }}>
            {/* Animated checkmark circle */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '3px solid rgba(255,255,255,0.4)',
            }}>
              <CheckCircle size={48} color="#fff" strokeWidth={2} />
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}>
              Đặt hàng thành công! 🎉
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              Cảm ơn bạn đã tin tưởng mua sắm tại <strong>PCHub</strong>
            </p>
          </div>

          {/* Order info */}
          <div style={{ padding: '28px 32px' }}>

            {/* Order ID box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Mã đơn hàng
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#2563eb', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {orderId}
                </div>
              </div>
              <div style={{
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#15803d',
              }}>
                ✓ Đã xác nhận
              </div>
            </div>

            {/* Timeline info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
              {[
                {
                  icon: <Clock size={18} color="#2563eb" />,
                  label: 'Ngày đặt hàng',
                  value: orderDate,
                  bg: '#eff6ff',
                },
                {
                  icon: <Truck size={18} color="#ea580c" />,
                  label: 'Dự kiến giao',
                  value: estimatedDelivery,
                  bg: '#fff7ed',
                },
                {
                  icon: <Package size={18} color="#7c3aed" />,
                  label: 'Trạng thái',
                  value: 'Đang xử lý đơn hàng',
                  bg: '#f5f3ff',
                },
                {
                  icon: <ShieldCheck size={18} color="#16a34a" />,
                  label: 'Bảo hành',
                  value: 'Chính hãng 36 tháng',
                  bg: '#f0fdf4',
                },
              ].map((item, i) => (
                <div key={i} style={{
                  background: item.bg,
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ flexShrink: 0, marginTop: '1px' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '3px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', lineHeight: '1.3' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Email notification note */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginBottom: '28px',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>📧</span>
              <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                Chúng tôi đã gửi email xác nhận đơn hàng. Bạn có thể theo dõi trạng thái tại mục{' '}
                <strong>"Đơn hàng của tôi"</strong>.
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/tai-khoan/don-hang" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                textDecoration: 'none',
                padding: '15px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 800,
                boxShadow: '0 4px 15px rgba(37,99,235,0.35)',
              }}>
                <Package size={18} />
                Theo dõi đơn hàng
                <ChevronRight size={16} />
              </Link>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Link href="/" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#475569',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: '1.5px solid #e2e8f0',
                  background: '#fff',
                }}>
                  <Home size={15} />
                  Trang chủ
                </Link>

                <a href="tel:19006789" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#16a34a',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: '1.5px solid #bbf7d0',
                  background: '#f0fdf4',
                }}>
                  <Phone size={15} />
                  1900-6789
                </a>
              </div>
            </div>
          </div>

          {/* Bottom rating prompt */}
          <div style={{
            borderTop: '1px solid #f1f5f9',
            padding: '20px 32px',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                Bạn hài lòng với PCHub?
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Đánh giá giúp chúng tôi phục vụ bạn tốt hơn!</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={22}
                  fill="#f59e0b"
                  color="#f59e0b"
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recommended next purchase */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/search" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 700,
            padding: '12px 24px',
            background: '#fff',
            border: '1px solid #dbeafe',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            🛍️ Tiếp tục mua sắm
            <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
