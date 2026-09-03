'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, ChevronLeft, Truck, CreditCard, ShieldCheck,
  CheckCircle, Smartphone, Banknote, Building2, Wallet, Package, Lock
} from 'lucide-react';
import { useCartStore, useOrderStore } from '@/lib/store';

type CheckoutStep = 'shipping' | 'payment';

const SHIPPING_OPTIONS = [
  { id: 'ghn', name: 'GHN — Giao hàng nhanh', estimate: '1-2 ngày', price: 25000 },
  { id: 'ghtk', name: 'GHTK — Tiết kiệm', estimate: '3-5 ngày', price: 20000 },
];

const PAYMENT_METHODS = [
  {
    id: 'vnpay',
    label: 'VNPay — QR / ATM / Visa',
    desc: 'Quét QR hoặc thanh toán thẻ ATM / Visa / Master',
    icon: '🏦',
    color: '#1d4ed8',
    showQR: true,
  },
  {
    id: 'momo',
    label: 'MoMo',
    desc: 'Ví điện tử MoMo',
    icon: '💜',
    color: '#a21caf',
    showQR: false,
  },
  {
    id: 'zalopay',
    label: 'ZaloPay',
    desc: 'Ví điện tử ZaloPay / Zalo',
    icon: '💙',
    color: '#0284c7',
    showQR: false,
  },
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Trả tiền mặt khi nhận được hàng',
    icon: '💵',
    color: '#16a34a',
    showQR: false,
  },
  {
    id: 'bank',
    label: 'Chuyển khoản ngân hàng',
    desc: 'Chuyển khoản trực tiếp qua số tài khoản ngân hàng',
    icon: '🏛️',
    color: '#475569',
    showQR: false,
  },
];

// Simple step indicator for checkout page
function CheckoutStepBar({ step }: { step: CheckoutStep }) {
  const steps = [
    { num: 1, label: 'Giỏ hàng', done: true },
    { num: 2, label: 'Giao hàng', done: false, active: step === 'shipping' },
    { num: 3, label: 'Thanh toán', done: false, active: step === 'payment' },
    { num: 4, label: 'Hoàn thành', done: false },
  ];

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
      padding: '14px 24px', marginBottom: '20px',
      display: 'flex', alignItems: 'center',
    }}>
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: s.done ? '#16a34a' : s.active ? '#2563eb' : '#f1f5f9',
              color: s.done || s.active ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, flexShrink: 0,
            }}>
              {s.done ? '✓' : s.num}
            </div>
            <span style={{
              fontSize: '13px', fontWeight: s.active || s.done ? 700 : 500,
              color: s.done ? '#16a34a' : s.active ? '#2563eb' : '#94a3b8',
              whiteSpace: 'nowrap',
            }}>
              {s.label}
            </span>
          </div>
          {i < 3 && (
            <div style={{
              flex: 1, height: '2px',
              background: s.done ? '#16a34a' : '#e2e8f0',
              margin: '0 16px',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total } = useCartStore();
  const addOrder = useOrderStore(s => s.addOrder);

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingOption, setShippingOption] = useState('ghn');
  const [payment, setPayment] = useState('vnpay');
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState('');

  // Shipping form state
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    province: '', district: '', ward: '', address: '', note: '',
  });

  const totalPrice = total();
  const selectedShipping = SHIPPING_OPTIONS.find(s => s.id === shippingOption);
  const shippingFee = totalPrice >= 500000 ? 0 : (selectedShipping?.price ?? 25000);
  const finalTotal = Math.max(0, totalPrice + shippingFee - voucherDiscount);

  const applyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (code === 'PCNEW10') {
      setVoucherDiscount(Math.round(totalPrice * 0.1));
      setVoucherMessage('Áp dụng mã PCNEW10 thành công: giảm 10%');
    } else {
      setVoucherDiscount(0);
      setVoucherMessage('Mã voucher không hợp lệ hoặc đã hết hạn');
    }
  };

  useEffect(() => {
    if (!items.length) {
      router.push('/gio-hang');
    }
  }, [items.length, router]);

  if (!items.length) {
    return null;
  }

  const handleShippingSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderId = `ORD-${Date.now()}`;
    const selectedPayment = PAYMENT_METHODS.find(m => m.id === payment);

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      status: 'pending' as const,
      statusLabel: 'Chờ xác nhận',
      total: finalTotal,
      products: items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity
      })),
      shippingAddress: {
        name: form.name || 'Khách hàng PCHub',
        phone: form.phone || '0901234567',
        email: form.email || 'customer@pchub.vn',
        address: form.address || 'Địa chỉ nhận hàng',
        province: form.province || 'Hà Nội',
        district: form.district || 'Cầu Giấy',
        ward: form.ward || 'Dịch Vọng Hậu',
        note: form.note
      },
      shippingFee,
      paymentMethod: payment,
      paymentMethodLabel: selectedPayment?.label || 'Thanh toán'
    };

    addOrder(newOrder);

    await new Promise(r => setTimeout(r, 1400));
    router.push(`/dat-hang-thanh-cong?orderId=${orderId}`);
  };

  const selectedPayment = PAYMENT_METHODS.find(m => m.id === payment);

  // Shared right panel: order summary
  const OrderSummary = () => (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: '14px', overflow: 'hidden',
      position: 'sticky', top: '20px',
    }}>
      <div style={{ background: '#0f172a', padding: '14px 20px' }}>
        <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>
          Tóm tắt đơn hàng
        </span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
        {items.map((item, idx) => {
          const prodId = item.product?.id || item.id || `order-item-${idx}`;
          const prodName = item.product?.name || item.name || 'Sản phẩm linh kiện';
          const prodImage = item.product?.image || item.image || '/images/cpu-box.jpg';
          const prodPrice = item.product?.price || item.price || 0;
          const quantity = item.quantity || 1;

          return (
            <div key={prodId} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                width: '52px', height: '52px', flexShrink: 0,
                background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src={prodImage} alt={prodName} style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }}
                  onError={e => { (e.target as HTMLImageElement).src = '/images/cpu-box.jpg'; }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: '1.4', marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {prodName}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>×{quantity}</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                    {(prodPrice * quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
          <span>Tạm tính</span>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{totalPrice.toLocaleString('vi-VN')}₫</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
          <span>Phí vận chuyển</span>
          <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#16a34a' : '#1e293b' }}>
            {shippingFee === 0 ? 'Miễn phí 🎉' : `${shippingFee.toLocaleString('vi-VN')}₫`}
          </span>
        </div>
        {voucherDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a' }}>
            <span>Giảm voucher ({voucher.trim().toUpperCase()})</span>
            <span style={{ fontWeight: 600 }}>−{voucherDiscount.toLocaleString('vi-VN')}₫</span>
          </div>
        )}
        <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>Tổng cộng</span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>
            {finalTotal.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
          <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Trang chủ</Link>
          <ChevronRight size={12} />
          <Link href="/gio-hang" style={{ color: '#94a3b8', textDecoration: 'none' }}>Giỏ hàng</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#1e293b', fontWeight: 600 }}>
            {step === 'shipping' ? 'Thông tin giao hàng' : 'Thanh toán'}
          </span>
        </div>

        <CheckoutStepBar step={step} />

        {/* STEP 2: SHIPPING */}
        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'flex-start' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Shipping info card */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={16} color="#2563eb" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Thông tin giao hàng</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      { key: 'name', label: 'Người nhận', placeholder: 'Họ và tên', col: '1/-1', required: true },
                      { key: 'phone', label: 'SĐT nhận hàng', placeholder: '0912 345 678', required: true },
                      { key: 'email', label: 'Email', placeholder: 'email@example.com' },
                    ].map(f => (
                      <div key={f.key} style={{ gridColumn: f.col }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {f.label}{f.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </label>
                        <input
                          required={f.required}
                          placeholder={f.placeholder}
                          value={(form as any)[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    ))}

                    <div>
                      <label style={labelStyle}>Tỉnh / Thành phố <span style={{ color: '#ef4444' }}>*</span></label>
                      <select required value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} style={inputStyle}>
                        <option value="">Chọn tỉnh/thành phố</option>
                        {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Hải Phòng', 'Vũng Tàu'].map(p => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Quận / Huyện <span style={{ color: '#ef4444' }}>*</span></label>
                      <select required value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} style={inputStyle}>
                        <option value="">Chọn quận/huyện</option>
                        {['Quận 1', 'Quận 2', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Thủ Đức'].map(d => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>Địa chỉ nhận hàng <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        required
                        placeholder="Số nhà, tên đường, phường/xã..."
                        value={form.address}
                        onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>Ghi chú</label>
                      <textarea
                        rows={2}
                        placeholder="Ghi chú đơn hàng (nếu có)..."
                        value={form.note}
                        onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                        style={{ ...inputStyle, resize: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping carrier */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={16} color="#2563eb" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Đơn vị vận chuyển</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {SHIPPING_OPTIONS.map(opt => (
                      <label key={opt.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                        border: `2px solid ${shippingOption === opt.id ? '#2563eb' : '#e2e8f0'}`,
                        background: shippingOption === opt.id ? '#eff6ff' : '#fff',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="radio" name="shipping" value={opt.id}
                            checked={shippingOption === opt.id}
                            onChange={() => setShippingOption(opt.id)}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px' }}
                          />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{opt.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Dự kiến: {opt.estimate}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: totalPrice >= 500000 ? '#16a34a' : '#1e293b' }}>
                          {totalPrice >= 500000 ? 'Miễn phí' : `${opt.price.toLocaleString('vi-VN')}₫`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Voucher */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontWeight: 800 }}>%</div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Mã giảm giá</h2>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Nhập voucher để nhận ưu đãi cho đơn hàng</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={voucher}
                      onChange={e => { setVoucher(e.target.value.toUpperCase()); setVoucherMessage(''); setVoucherDiscount(0); }}
                      placeholder="Nhập mã voucher, ví dụ PCNEW10"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button type="button" onClick={applyVoucher} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 18px', fontWeight: 700, cursor: 'pointer' }}>
                      Áp dụng
                    </button>
                  </div>
                  {voucherMessage && <p style={{ margin: '8px 0 0', fontSize: '12px', color: voucherDiscount > 0 ? '#16a34a' : '#dc2626' }}>{voucherDiscount > 0 ? '✓ ' : '✕ '}{voucherMessage}</p>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link href="/gio-hang" style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 20px',
                    border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#64748b',
                    textDecoration: 'none', fontSize: '13px', fontWeight: 700, background: '#fff',
                  }}>
                    <ChevronLeft size={15} /> Giỏ hàng
                  </Link>
                  <button type="submit" style={{
                    flex: 1, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '13px', fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 15px rgba(37,99,235,0.3)',
                  }}>
                    Tiếp tục thanh toán →
                  </button>
                </div>
              </div>

              <OrderSummary />
            </div>
          </form>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 'payment' && (
          <form onSubmit={handlePlaceOrder}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'flex-start' }}>

              <div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={16} color="#2563eb" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Phương thức thanh toán</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {PAYMENT_METHODS.map(m => (
                      <label key={m.id} style={{
                        display: 'flex', flexDirection: 'column',
                        borderRadius: '12px', cursor: 'pointer', overflow: 'hidden',
                        border: `2px solid ${payment === m.id ? m.color : '#e2e8f0'}`,
                        transition: 'all 0.15s',
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '14px 16px',
                          background: payment === m.id ? `${m.color}10` : '#fff',
                        }}>
                          <input
                            type="radio" name="payment" value={m.id}
                            checked={payment === m.id}
                            onChange={() => setPayment(m.id)}
                            style={{ accentColor: m.color, width: '16px', height: '16px', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: '20px', flexShrink: 0 }}>{m.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{m.label}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{m.desc}</div>
                          </div>
                          {payment === m.id && (
                            <CheckCircle size={18} color={m.color} style={{ flexShrink: 0 }} />
                          )}
                        </div>

                        {/* VNPay QR expanded */}
                        {payment === 'vnpay' && m.id === 'vnpay' && (
                          <div style={{
                            padding: '20px', background: '#f8fafc',
                            borderTop: `2px dashed ${m.color}40`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                          }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>
                              Quét mã QR để thanh toán qua VNPay
                            </div>
                            {/* QR placeholder */}
                            <div style={{
                              width: '160px', height: '160px',
                              background: '#fff', border: '2px solid #e2e8f0',
                              borderRadius: '12px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              flexDirection: 'column', gap: '8px',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                            }}>
                              {/* SVG QR pattern simulation */}
                              <svg width="120" height="120" viewBox="0 0 120 120">
                                <rect width="120" height="120" fill="white"/>
                                {/* QR corner markers */}
                                <rect x="8" y="8" width="30" height="30" fill="none" stroke="#1d4ed8" strokeWidth="4" rx="3"/>
                                <rect x="14" y="14" width="18" height="18" fill="#1d4ed8" rx="2"/>
                                <rect x="82" y="8" width="30" height="30" fill="none" stroke="#1d4ed8" strokeWidth="4" rx="3"/>
                                <rect x="88" y="14" width="18" height="18" fill="#1d4ed8" rx="2"/>
                                <rect x="8" y="82" width="30" height="30" fill="none" stroke="#1d4ed8" strokeWidth="4" rx="3"/>
                                <rect x="14" y="88" width="18" height="18" fill="#1d4ed8" rx="2"/>
                                {/* QR data pattern */}
                                {[0,1,2,3,4,5,6,7,8,9].map(r => (
                                  [0,1,2,3,4,5,6,7,8,9].map(c => (
                                    Math.random() > 0.5 && !(r < 5 && c < 5) && !(r < 5 && c > 4) && !(r > 4 && c < 5) ? (
                                      <rect key={`${r}-${c}`} x={45 + c * 7} y={45 + r * 7} width="5" height="5" fill="#1d4ed8" rx="0.5"/>
                                    ) : null
                                  ))
                                ))}
                                {[40,42,44,46,48,50,52,54,56,58,62,64,66,68,70,72].map(x => (
                                  <rect key={x} x={x} y={44} width="4" height="4" fill="#1d4ed8" rx="0.5"/>
                                ))}
                              </svg>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                              Mã QR có hiệu lực trong <strong style={{ color: '#ef4444' }}>05:00</strong> phút
                            </div>
                            <div style={{
                              display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
                            }}>
                              {['Vietcombank', 'Techcombank', 'MB Bank', 'VietinBank'].map(b => (
                                <span key={b} style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '3px 8px', borderRadius: '4px' }}>{b}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '13px 20px', border: '1.5px solid #e2e8f0',
                        borderRadius: '10px', color: '#64748b', background: '#fff',
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <ChevronLeft size={15} /> Giao hàng
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1,
                        background: loading ? '#94a3b8' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: '#fff', border: 'none', borderRadius: '10px',
                        padding: '13px', fontSize: '15px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(22,163,74,0.3)',
                      }}
                    >
                      <Lock size={16} />
                      {loading ? 'Đang xử lý...' : 'Đặt hàng ngay →'}
                    </button>
                  </div>
                </div>

                {/* Security note */}
                <div style={{
                  marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                  justifyContent: 'center', fontSize: '12px', color: '#64748b',
                }}>
                  <ShieldCheck size={14} color="#16a34a" />
                  Thông tin thanh toán được mã hóa SSL 256-bit. Hoàn toàn bảo mật.
                </div>
              </div>

              {/* Right: Order summary + total */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ background: '#0f172a', padding: '14px 20px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>Tổng quan đơn hàng</span>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', flexShrink: 0, background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={product.image} alt={product.name} style={{ maxWidth: '38px', maxHeight: '38px', objectFit: 'contain' }}
                            onError={e => { (e.target as HTMLImageElement).src = '/images/cpu-box.jpg'; }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {product.name}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>×{quantity}</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                              {(product.price * quantity).toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                      <span>Tạm tính</span>
                      <span style={{ fontWeight: 600 }}>{totalPrice.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                      <span>Vận chuyển</span>
                      <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#16a34a' : '#1e293b' }}>
                        {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                      </span>
                    </div>
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>Tổng cộng</span>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>
                        {finalTotal.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '0 16px 16px' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#fff', border: 'none', borderRadius: '12px',
                        padding: '15px', fontSize: '15px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(37,99,235,0.35)',
                      }}
                    >
                      <Lock size={16} />
                      {loading ? 'Đang xử lý...' : 'Đặt hàng →'}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '10px' }}>
                      <ShieldCheck size={12} color="#16a34a" />
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Thanh toán bảo mật 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  color: '#1e293b',
  background: '#fff',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#475569',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
};
