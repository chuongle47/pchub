'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight, Tag, X, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const VOUCHER_CODES: Record<string, { type: 'percent' | 'fixed' | 'freeship'; value: number; label: string }> = {
  'PCHUB10': { type: 'percent', value: 10, label: 'Giảm 10% tổng đơn' },
  'SAVE50K': { type: 'fixed', value: 50000, label: 'Giảm 50.000₫' },
  'FREESHIP': { type: 'freeship', value: 0, label: 'Miễn phí vận chuyển' },
  'PCHUB20': { type: 'percent', value: 20, label: 'Giảm 20% (tối đa 200k)' },
  'PCNEW10': { type: 'percent', value: 10, label: 'Giảm 10% khách mới' },
};

export default function CartPage() {
  const { items, total, updateQty, removeItem, clearCart } = useCartStore();
  const router = useRouter();

  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<null | { code: string; type: string; value: number; label: string }>(null);
  const [voucherError, setVoucherError] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);

  const totalPrice = total();
  const baseShipping = totalPrice >= 500000 ? 0 : 30000;

  let discount = 0;
  let shipping = baseShipping;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') discount = Math.min(Math.round(totalPrice * appliedVoucher.value / 100), 200000);
    else if (appliedVoucher.type === 'fixed') discount = appliedVoucher.value;
    else if (appliedVoucher.type === 'freeship') shipping = 0;
  }
  const finalTotal = totalPrice - discount + shipping;

  const applyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) { setVoucherError('Vui lòng nhập mã voucher.'); return; }
    const found = VOUCHER_CODES[code];
    if (!found) { setVoucherError('Mã không hợp lệ hoặc đã hết hạn.'); return; }
    setAppliedVoucher({ code, ...found });
    setVoucherError('');
    setVoucherInput('');
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id);
    setRemovedNotice(`Đã xóa "${name}" khỏi giỏ hàng.`);
    setTimeout(() => setRemovedNotice(null), 3000);
  };

  const handleProceedToCheckout = (e: React.MouseEvent) => {
    // Validate stock for all items
    const invalidItems = items.filter(item => {
      const stock = item.product?.stock ?? 50;
      return item.quantity > stock;
    });

    if (invalidItems.length > 0) {
      e.preventDefault();
      setCheckoutError(`Sản phẩm "${invalidItems[0].name}" vượt quá số lượng tồn kho còn lại.`);
      return;
    }

    setCheckoutError(null);
    router.push('/thanh-toan');
  };

  if (!items.length) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ShoppingBag size={72} color="#e2e8f0" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Giỏ hàng trống</h1>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#2563eb', color: '#fff', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
          }}>
            <ShoppingBag size={16} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 20px' }}>

        {/* Page title + breadcrumb */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Trang chủ</Link>
            <ChevronRight size={12} />
            <span style={{ color: '#1e293b', fontWeight: 600 }}>Thanh toán an toàn</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            🛒 Thanh toán an toàn
          </h1>
        </div>

        {/* Alert Notifications */}
        {removedNotice && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 18px', borderRadius: '10px', marginBottom: '16px', fontSize: '13.5px', fontWeight: 600 }}>
            {removedNotice}
          </div>
        )}
        {checkoutError && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', color: '#991b1b', padding: '12px 18px', borderRadius: '10px', marginBottom: '16px', fontSize: '13.5px', fontWeight: 700 }}>
            ⚠️ {checkoutError}
          </div>
        )}

        {/* Step indicator simple */}
        <div className="step-bar-container">
          {[
            { num: 1, label: 'Giỏ hàng', active: true, done: false },
            { num: 2, label: 'Giao hàng', active: false, done: false },
            { num: 3, label: 'Thanh toán', active: false, done: false },
            { num: 4, label: 'Hoàn thành', active: false, done: false },
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: s.active ? '#2563eb' : '#f1f5f9',
                  color: s.active ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, flexShrink: 0,
                }}>
                  {s.num}
                </div>
                <span className={`step-bar-label ${s.active ? 'step-bar-label-active' : ''}`} style={{ fontSize: '13px', fontWeight: s.active ? 700 : 500, color: s.active ? '#2563eb' : '#94a3b8', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: '1px', background: '#e2e8f0', margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        <div className="cart-layout-grid" style={{ alignItems: 'flex-start' }}>

          {/* LEFT: Cart items */}
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              {/* Cart header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                  Giỏ hàng ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
                </span>
                <button
                  onClick={clearCart}
                  style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  🗑 Xóa tất cả
                </button>
              </div>

              {/* Column headers */}
              <div className="cart-header-row">
                <span>Sản phẩm</span>
                <span style={{ textAlign: 'center' }}>Số lượng</span>
                <span style={{ textAlign: 'right' }}>Thành tiền</span>
                <span />
              </div>

              {/* Items */}
              {items.map((item, idx) => {
                const prodId = item.product?.id || item.id || `cart-item-${idx}`;
                const prodName = item.product?.name || item.name || 'Sản phẩm linh kiện';
                const prodImage = item.product?.image_url || item.product?.image || item.image || (item as any).image_url || '/images/cpu-box.jpg';
                const prodPrice = item.product?.price || item.price || 0;
                const prodOriginalPrice = item.product?.originalPrice || item.originalPrice;
                const quantity = item.quantity || 1;
                const maxStock = item.product?.stock ?? 50;

                return (
                  <div key={prodId} className="cart-item-row">
                    {/* Product */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '72px', height: '72px', flexShrink: 0,
                        background: '#f8fafc', borderRadius: '10px',
                        border: '1px solid #f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img
                          src={prodImage}
                          alt={prodName}
                          style={{ maxWidth: '56px', maxHeight: '56px', objectFit: 'contain' }}
                          onError={e => { (e.target as HTMLImageElement).src = '/images/cpu-box.jpg'; }}
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{
                          fontSize: '13px', fontWeight: 700, color: '#0f172a',
                          lineHeight: '1.4', marginBottom: '6px',
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {prodName}
                        </p>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#ef4444' }}>
                          {prodPrice.toLocaleString('vi-VN')}₫
                        </div>
                        {prodOriginalPrice && (
                          <del style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {prodOriginalPrice.toLocaleString('vi-VN')}₫
                          </del>
                        )}
                      </div>
                    </div>

                    {/* Controls & Subtotal wrap container */}
                    <div className="cart-item-mobile-actions">
                      {/* Quantity Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                        <button
                          type="button"
                          onClick={() => updateQty(prodId, quantity - 1)}
                          disabled={quantity <= 1}
                          style={{ width: '28px', height: '30px', border: '1px solid #e2e8f0', borderRight: 'none', borderRadius: '6px 0 0 6px', background: '#f8fafc', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: quantity <= 1 ? 0.4 : 1 }}
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          min={1}
                          max={maxStock}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) updateQty(prodId, Math.max(1, Math.min(maxStock, val)));
                          }}
                          style={{ width: '38px', height: '30px', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#0f172a', outline: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => updateQty(prodId, quantity + 1)}
                          disabled={quantity >= maxStock}
                          style={{ width: '28px', height: '30px', border: '1px solid #e2e8f0', borderLeft: 'none', borderRadius: '0 6px 6px 0', background: '#f8fafc', cursor: quantity >= maxStock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: quantity >= maxStock ? 0.4 : 1 }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 900, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {(prodPrice * quantity).toLocaleString('vi-VN')}₫
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveItem(prodId, prodName)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                        title="Xóa khỏi giỏ hàng"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Smart Match banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
              borderRadius: '14px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid #1d4ed8',
            }}>
              <div style={{ flexShrink: 0 }}>
                <Sparkles size={28} color="#93c5fd" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>
                  AI Smart Match — Kiểm tra tương thích linh kiện
                </div>
                <div style={{ fontSize: '12px', color: '#93c5fd', lineHeight: '1.5' }}>
                  Các sản phẩm trong giỏ đã được AI xác nhận tương thích. Xem chi tiết phân tích.
                </div>
              </div>
              <Link href="/build-pc" style={{
                flexShrink: 0, background: 'rgba(255,255,255,0.15)',
                color: '#fff', textDecoration: 'none', padding: '8px 14px',
                borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.3)', whiteSpace: 'nowrap',
              }}>
                Xem AI →
              </Link>
            </div>
          </div>

          {/* RIGHT: Order summary */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            position: 'sticky',
            top: '20px',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#0f172a' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>Tổng giỏ hàng</span>
            </div>

            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>{items.reduce((s, i) => s + i.quantity, 0)} sản phẩm</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{totalPrice.toLocaleString('vi-VN')}₫</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Phí vận chuyển</span>
                <span style={{ fontWeight: 700, color: shipping === 0 ? '#16a34a' : '#1e293b' }}>
                  {shipping === 0 ? 'Miễn phí 🎉' : `${shipping.toLocaleString('vi-VN')}₫`}
                </span>
              </div>

              {/* Voucher */}
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Tag size={12} color="var(--color-primary)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Mã giảm giá</span>
                </div>
                {appliedVoucher ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>{appliedVoucher.code}</span>
                      <span style={{ fontSize: '11px', color: '#16a34a', marginLeft: '8px' }}>{appliedVoucher.label}</span>
                    </div>
                    <button onClick={() => setAppliedVoucher(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        value={voucherInput}
                        onChange={e => { setVoucherInput(e.target.value.toUpperCase()); setVoucherError(''); }}
                        onKeyDown={e => e.key === 'Enter' && applyVoucher()}
                        placeholder="Nhập mã voucher..."
                        style={{
                          flex: 1, padding: '9px 12px',
                          border: `1.5px solid ${voucherError ? '#fca5a5' : '#e2e8f0'}`,
                          borderRadius: '8px', fontSize: '12px', fontVariantNumeric: 'tabular-nums',
                          fontWeight: 600, outline: 'none', textTransform: 'uppercase',
                          background: voucherError ? '#fef2f2' : '#fff',
                        }}
                      />
                      <button onClick={applyVoucher} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Áp dụng
                      </button>
                    </div>
                    {voucherError && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '5px', fontWeight: 600 }}>{voucherError}</p>}
                    <div style={{ marginTop: '6px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {Object.keys(VOUCHER_CODES).map(code => (
                        <button key={code} onClick={() => { setVoucherInput(code); setVoucherError(''); }}
                          style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', border: '1px dashed #bfdbfe', background: '#eff6ff', color: 'var(--color-primary)', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>
                          {code}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a' }}>
                  <span style={{ fontWeight: 600 }}>🎟️ Giảm giá</span>
                  <span style={{ fontWeight: 700 }}>-{discount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}

              {/* Total */}
              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>Tổng cộng</span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                  {finalTotal.toLocaleString('vi-VN')}₫
                </span>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                  color: '#fff', border: 'none', padding: '15px',
                  borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                  boxShadow: '0 4px 15px rgba(37,99,235,0.35)',
                  textAlign: 'center', cursor: 'pointer', width: '100%',
                }}
              >
                Tiến hành thanh toán →
              </button>

              {/* Payment logos */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                {['VNPAY', 'MoMo', 'ZaloPay', 'COD'].map(m => (
                  <span key={m} style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
