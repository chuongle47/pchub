'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Cpu, ArrowRight, X, AlertCircle, Layers, Monitor, Check } from 'lucide-react';

export interface CartChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildItemsCount: number;
  buildTotal: number;
  cartItemCount: number;
  cartTotal: number;
  onCheckoutBuildOnly: (pcQuantity: number) => void;
  onAddToCartBuildOnly: (pcQuantity: number) => void;
  onCheckoutAll: (pcQuantity: number) => void;
  onAddToCartAll: (pcQuantity: number) => void;
  initialPcQuantity?: number;
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
  initialPcQuantity = 1,
}: CartChoiceModalProps) {
  const [pcQuantity, setPcQuantity] = useState<number>(initialPcQuantity || 1);

  useEffect(() => {
    if (isOpen) {
      setPcQuantity(initialPcQuantity || 1);
    }
  }, [isOpen, initialPcQuantity]);

  if (!isOpen) return null;

  const scaledBuildTotal = buildTotal * pcQuantity;
  const scaledBuildItemsCount = buildItemsCount * pcQuantity;
  const combinedTotal = scaledBuildTotal + cartTotal;
  const combinedCount = cartItemCount + scaledBuildItemsCount;

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
          maxWidth: '740px',
          width: '100%',
          maxHeight: '92vh',
          border: '1px solid #e2e8f0',
          overflowY: 'auto',
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
                Lựa chọn phương thức thanh toán và số lượng dàn PC vừa build
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
            backgroundColor: cartItemCount > 0 ? '#fffbeb' : '#f0fdf4',
            borderBottom: `1px solid ${cartItemCount > 0 ? '#fde68a' : '#bbf7d0'}`,
            padding: '12px 24px',
            color: cartItemCount > 0 ? '#92400e' : '#166534',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxSizing: 'border-box',
          }}
        >
          {cartItemCount > 0 ? (
            <>
              <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
              <div style={{ lineHeight: '1.5' }}>
                <span style={{ fontWeight: 700 }}>
                  Giỏ hàng của bạn đang có sẵn <span style={{ color: '#78350f' }}>{cartItemCount} sản phẩm</span> khác.
                </span>{' '}
                <span>
                  Vui lòng chọn thanh toán <strong>chỉ riêng dàn PC này</strong> hoặc <strong>gộp thanh toán toàn bộ</strong> giỏ hàng.
                </span>
              </div>
            </>
          ) : (
            <>
              <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
              <div style={{ lineHeight: '1.5' }}>
                <span>
                  Cấu hình PC hoàn tất với <strong>{buildItemsCount} linh kiện</strong>. Bạn có thể chọn số lượng dàn PC và tiến hành thanh toán hoặc lưu vào giỏ hàng.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Content Body / Options */}
        <div
          style={{
            padding: '20px 24px 16px',
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
              padding: '18px',
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
                  marginBottom: '10px',
                }}
              >
                <Cpu size={14} /> Chỉ Dàn PC Vừa Build {pcQuantity > 1 && `(${pcQuantity} Bộ)`}
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Thanh Toán Theo Build PC
              </h4>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                {cartItemCount > 0 ? (
                  <>Hệ thống sẽ làm sạch sản phẩm cũ trong giỏ hàng và <strong>chỉ thanh toán {scaledBuildItemsCount} linh kiện</strong> ({pcQuantity} dàn PC).</>
                ) : (
                  <>Tiến hành thanh toán trực tiếp <strong>{scaledBuildItemsCount} linh kiện</strong> cho {pcQuantity} dàn PC này.</>
                )}
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
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>Số lượng linh kiện:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>
                    {scaledBuildItemsCount} linh kiện {pcQuantity > 1 && `(${pcQuantity} bộ)`}
                  </span>
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
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#2563eb', fontSize: '15px', fontWeight: 800 }}>
                      {scaledBuildTotal.toLocaleString('vi-VN')} ₫
                    </div>
                    {pcQuantity > 1 && (
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                        ({buildTotal.toLocaleString('vi-VN')} ₫ / bộ)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onCheckoutBuildOnly(pcQuantity)}
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
                <span>Thanh Toán Dàn PC Này {pcQuantity > 1 && `(${pcQuantity} Bộ)`}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => onAddToCartBuildOnly(pcQuantity)}
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
                <span>Chỉ thêm dàn PC vào giỏ {pcQuantity > 1 && `(${pcQuantity} Bộ)`}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Combine All or Add to Cart */}
          <div
            style={{
              border: '2px solid #e9d5ff',
              backgroundColor: '#faf5ff',
              borderRadius: '16px',
              padding: '18px',
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
                  marginBottom: '10px',
                }}
              >
                {cartItemCount > 0 ? (
                  <>
                    <Layers size={14} /> Gộp Tất Cả ({combinedCount} Sản Phẩm)
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} /> Thêm Vào Giỏ & Mua Thêm
                  </>
                )}
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                {cartItemCount > 0 ? 'Thanh Toán Tất Cả Sản Phẩm' : 'Thêm Vào Giỏ & Tiếp Tục Xem'}
              </h4>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                {cartItemCount > 0 ? (
                  <>Gộp dàn PC vừa build ({scaledBuildItemsCount} linh kiện) vào giỏ hàng hiện tại ({cartItemCount} món cũ).</>
                ) : (
                  <>Lưu {scaledBuildItemsCount} linh kiện của {pcQuantity} dàn PC vào giỏ hàng để tiếp tục chọn thêm phụ kiện khác.</>
                )}
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
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>{cartItemCount > 0 ? 'Tổng số lượng sản phẩm:' : 'Tổng số linh kiện:'}</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>
                    {cartItemCount > 0 ? `${combinedCount} sản phẩm` : `${scaledBuildItemsCount} linh kiện`}
                  </span>
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
                  <span>{cartItemCount > 0 ? 'Tổng tiền tất cả:' : 'Tổng tiền tạm tính:'}</span>
                  <span style={{ color: '#7e22ce', fontSize: '15px', fontWeight: 800 }}>
                    {(cartItemCount > 0 ? combinedTotal : scaledBuildTotal).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => (cartItemCount > 0 ? onCheckoutAll(pcQuantity) : onCheckoutBuildOnly(pcQuantity))}
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
                <span>
                  {cartItemCount > 0 ? `Thanh Toán Tất Cả (${combinedCount} Món)` : `Thanh Toán Ngay (${pcQuantity} Bộ)`}
                </span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => (cartItemCount > 0 ? onAddToCartAll(pcQuantity) : onAddToCartBuildOnly(pcQuantity))}
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
                <span>
                  {cartItemCount > 0 ? 'Gộp tất cả vào giỏ hàng' : `Thêm ${pcQuantity} bộ vào giỏ hàng`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* DÒNG DƯỚI CÙNG: Chọn số lượng dàn PC muốn mua */}
        <div
          style={{
            margin: '0 24px 18px 24px',
            padding: '14px 18px',
            background: pcQuantity > 1 
              ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' 
              : '#f8fafc',
            border: pcQuantity > 1 ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', flex: '1 1 300px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: pcQuantity > 1 ? '#2563eb' : '#64748b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: pcQuantity > 1 ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              <Monitor size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Bạn muốn mua nhiều bộ PC cấu hình này?</span>
                {pcQuantity > 1 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: '#2563eb',
                      color: '#ffffff',
                    }}
                  >
                    Đang chọn {pcQuantity} bộ PC
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: pcQuantity > 1 ? '#1e40af' : '#64748b', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                {pcQuantity === 1 ? (
                  'Tăng số lượng dàn PC để tự động nhân số lượng linh kiện tương ứng khi thanh toán.'
                ) : (
                  <span>
                    Tự động nhân <strong>x{pcQuantity} mỗi linh kiện</strong> ➔ Tổng cộng <strong>{scaledBuildItemsCount} linh kiện</strong> khi vào giỏ & thanh toán.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stepper control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
              Số lượng bộ PC:
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#ffffff',
                border: pcQuantity > 1 ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <button
                type="button"
                onClick={() => setPcQuantity((q) => Math.max(1, q - 1))}
                disabled={pcQuantity <= 1}
                style={{
                  width: '32px',
                  height: '32px',
                  background: pcQuantity <= 1 ? '#f8fafc' : '#ffffff',
                  border: 'none',
                  borderRight: '1px solid #e2e8f0',
                  color: pcQuantity <= 1 ? '#cbd5e1' : '#0f172a',
                  cursor: pcQuantity <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '15px',
                }}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={pcQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setPcQuantity(Math.max(1, Math.min(100, val)));
                  }
                }}
                style={{
                  width: '46px',
                  height: '32px',
                  border: 'none',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setPcQuantity((q) => Math.min(100, q + 1))}
                disabled={pcQuantity >= 100}
                style={{
                  width: '32px',
                  height: '32px',
                  background: pcQuantity >= 100 ? '#f8fafc' : '#ffffff',
                  border: 'none',
                  borderLeft: '1px solid #e2e8f0',
                  color: pcQuantity >= 100 ? '#cbd5e1' : '#0f172a',
                  cursor: pcQuantity >= 100 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '15px',
                }}
              >
                +
              </button>
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: pcQuantity > 1 ? '#2563eb' : '#475569' }}>
              Bộ PC
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '12px 24px',
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
              padding: '8px 18px',
              backgroundColor: '#e2e8f0',
              color: '#334155',
              border: 'none',
              borderRadius: '8px',
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
