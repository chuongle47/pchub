'use client';

import React from 'react';
import { ShoppingCart, Cpu, ArrowRight, X, AlertCircle, Layers } from 'lucide-react';

export interface CartChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildItemsCount: number;
  buildTotal: number;
  cartItemCount: number;
  cartTotal: number;
  onCheckoutBuildOnly: () => void;
  onAddToCartBuildOnly: () => void;
  onCheckoutAll: () => void;
  onAddToCartAll: () => void;
}

export default function CartChoiceModal({
  isOpen,
  onClose,
  buildItemsCount,
  buildTotal,
  cartItemCount,
  cartTotal,
  onCheckoutBuildOnly,
  onAddToCartBuildOnly,
  onCheckoutAll,
  onAddToCartAll,
}: CartChoiceModalProps) {
  if (!isOpen) return null;

  const combinedTotal = buildTotal + cartTotal;
  const combinedCount = cartItemCount + buildItemsCount;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          maxWidth: '720px',
          width: '100%',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
            padding: '18px 24px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, lineHeight: '1.2' }}>
                Xác Nhận Giỏ Hàng & Thanh Toán
              </h3>
              <p style={{ fontSize: '12px', color: '#e0e7ff', margin: '4px 0 0 0' }}>
                Lựa chọn phương thức thanh toán cho dàn PC vừa build
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice Banner */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            borderBottom: '1px solid #fde68a',
            padding: '14px 24px',
            color: '#92400e',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxSizing: 'border-box',
          }}
        >
          <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0 }} />
          <div style={{ lineHeight: '1.5' }}>
            <span style={{ fontWeight: 700 }}>
              Giỏ hàng của bạn đang có sẵn <span style={{ color: '#78350f' }}>{cartItemCount} sản phẩm</span> khác.
            </span>{' '}
            <span>
              Vui lòng chọn thanh toán <strong>chỉ riêng dàn PC này</strong> hoặc <strong>gộp thanh toán toàn bộ</strong> giỏ hàng.
            </span>
          </div>
        </div>

        {/* Content Body / Options */}
        <div
          style={{
            padding: '22px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px',
            boxSizing: 'border-box',
          }}
        >
          {/* Option 1: Build Only */}
          <div
            style={{
              border: '2px solid #bfdbfe',
              backgroundColor: '#f0f9ff',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              gap: '14px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  border: '1px solid #93c5fd',
                  marginBottom: '12px',
                }}
              >
                <Cpu size={14} /> Chỉ Dàn PC Vừa Build
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Thanh Toán Theo Build PC
              </h4>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                Hệ thống sẽ làm sạch sản phẩm cũ trong giỏ hàng và <strong>chỉ thanh toán {buildItemsCount} linh kiện</strong> trong dàn PC này.
              </p>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #e0f2fe',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>Số lượng linh kiện:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{buildItemsCount} linh kiện</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '6px',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  <span>Tổng tiền Build PC:</span>
                  <span style={{ color: '#2563eb', fontSize: '15px', fontWeight: 800 }}>
                    {buildTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={onCheckoutBuildOnly}
                style={{
                  width: '100%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  boxSizing: 'border-box',
                }}
              >
                <span>Thanh Toán Dàn PC Này</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onAddToCartBuildOnly}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#1d4ed8',
                  border: '1px solid #93c5fd',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <ShoppingCart size={14} />
                <span>Chỉ thêm dàn PC vào giỏ</span>
              </button>
            </div>
          </div>

          {/* Option 2: Combine All */}
          <div
            style={{
              border: '2px solid #e9d5ff',
              backgroundColor: '#faf5ff',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              gap: '14px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: '#f3e8ff',
                  color: '#7e22ce',
                  border: '1px solid #d8b4fe',
                  marginBottom: '12px',
                }}
              >
                <Layers size={14} /> Gộp Tất Cả ({combinedCount} Sản Phẩm)
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Thanh Toán Tất Cả Sản Phẩm
              </h4>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                Gộp dàn PC vừa build vào giỏ hàng hiện tại ({cartItemCount} món cũ + {buildItemsCount} linh kiện PC).
              </p>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #f3e8ff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>Tổng số lượng sản phẩm:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{combinedCount} sản phẩm</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '6px',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  <span>Tổng tiền tất cả:</span>
                  <span style={{ color: '#7e22ce', fontSize: '15px', fontWeight: 800 }}>
                    {combinedTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={onCheckoutAll}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.25)',
                  boxSizing: 'border-box',
                }}
              >
                <span>Thanh Toán Tất Cả ({combinedCount} Món)</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onAddToCartAll}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#7e22ce',
                  border: '1px solid #d8b4fe',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <ShoppingCart size={14} />
                <span>Gộp tất cả vào giỏ hàng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              backgroundColor: '#e2e8f0',
              color: '#334155',
              border: 'none',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            Hủy / Giữ nguyên giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}
