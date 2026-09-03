'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQty, total } = useCartStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !isOpen) return null;

  const totalPrice = total();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '380px',
        background: '#fff',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f172a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={20} color="#fff" />
            <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>
              Giỏ hàng ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="#fff" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60%',
              color: '#94a3b8',
              gap: '12px',
            }}>
              <ShoppingCart size={48} strokeWidth={1} />
              <p style={{ fontSize: '15px', fontWeight: 600 }}>Giỏ hàng trống</p>
              <p style={{ fontSize: '13px', textAlign: 'center' }}>
                Thêm sản phẩm để bắt đầu mua sắm
              </p>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, index) => {
                const prodId = item.product?.id || item.id || `cart-item-${index}`;
                const prodName = item.product?.name || item.name || 'Sản phẩm linh kiện';
                const prodImage = item.product?.image || item.image || '/images/cpu-box.jpg';
                const prodPrice = item.product?.price || item.price || 0;
                const quantity = item.quantity || 1;

                return (
                  <div key={prodId} style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                  }}>
                    {/* Image */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: '#fff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid #f1f5f9',
                    }}>
                      <img
                        src={prodImage}
                        alt={prodName}
                        style={{ maxWidth: '52px', maxHeight: '52px', objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.src = '/images/cpu-box.jpg'; }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#1e293b',
                        lineHeight: '1.4',
                        marginBottom: '6px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>{prodName}</p>

                      <div style={{
                        fontSize: '14px',
                        fontWeight: 900,
                        color: '#2563eb',
                        fontFamily: 'monospace',
                        marginBottom: '8px',
                      }}>
                        {(prodPrice * quantity).toLocaleString('vi-VN')} ₫
                      </div>

                      {/* Qty control */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => updateQty(prodId, quantity - 1)}
                          style={{
                            width: '26px', height: '26px', borderRadius: '6px',
                            background: '#fff', border: '1px solid #e2e8f0',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQty(prodId, quantity + 1)}
                          style={{
                            width: '26px', height: '26px', borderRadius: '6px',
                            background: '#fff', border: '1px solid #e2e8f0',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Plus size={12} />
                        </button>

                        <button
                          onClick={() => removeItem(prodId)}
                          style={{
                            marginLeft: 'auto',
                            width: '26px', height: '26px', borderRadius: '6px',
                            background: '#fff', border: '1px solid #fee2e2',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#ef4444',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #f1f5f9',
            background: '#fff',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Tổng cộng:</span>
              <span style={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#2563eb',
                fontFamily: 'monospace',
              }}>
                {totalPrice.toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <Link
              href="/thanh-toan"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                width: '100%',
                background: '#2563eb',
                color: '#fff',
                textAlign: 'center',
                textDecoration: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 800,
                marginBottom: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
            >
              Thanh toán ngay →
            </Link>

            <Link
              href="/gio-hang"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                width: '100%',
                background: 'transparent',
                color: '#64748b',
                textAlign: 'center',
                textDecoration: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '11px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Xem chi tiết giỏ hàng
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
