'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const itemCount = items.length;

  if (itemCount === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <ShoppingBag size={64} style={{ color: '#94a3b8', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
            Giỏ hàng trống
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px' }}>
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link 
            href="/search"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#0055d4',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '32px' }}>
        Giỏ hàng ({itemCount} sản phẩm)
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* Cart Items */}
        <div>
          {items.map(item => (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                gap: '20px',
                padding: '20px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            >
              {/* Product Image */}
              <div style={{ width: '100px', height: '100px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <ShoppingBag size={32} style={{ color: '#94a3b8' }} />
                )}
              </div>

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <Link 
                  href={item.slug ? `/product/${item.slug}` : '#'}
                  style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', textDecoration: 'none', marginBottom: '8px', display: 'block' }}
                >
                  {item.name}
                </Link>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#0055d4', marginBottom: '12px' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                </p>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 12px', fontWeight: 600 }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
         style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600 }}
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={clearCart}
            style={{ padding: '12px 24px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, width: '100%' }}
          >
            Xóa tất cả
          </button>
        </div>

        {/* Order Summary */}
        <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>
              Tóm tắt đơn hàng
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
              <span>Tạm tính</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', color: '#64748b' }}>
              <span>Thuế VAT (10%)</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total * 0.1)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '24px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Tổng cộng</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0055d4' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total * 1.1)}
              </span>
            </div>

            <Link 
              href="/checkout"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                background: '#0055d4',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '16px',
                width: '100%'
              }}
            >
              Tiến hành thanh toán
              <ArrowRight size={20} />
            </Link>

            <Link 
              href="/search"
              style={{ display: 'block', textAlign: 'center', marginTop: '16px', color: '#64748b', textDecoration: 'none', fontSize: '14px' }}
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}