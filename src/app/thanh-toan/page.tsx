'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, ChevronLeft, Truck, CreditCard, ShieldCheck,
  CheckCircle, Smartphone, Banknote, Building2, Wallet, Package, Lock, User
} from 'lucide-react';
import { useCartStore, useOrderStore, useAuthStore } from '@/lib/store';
import { useWalletStore } from '@/lib/wallet-store';
import { calculateVoucherDiscount, AVAILABLE_VOUCHERS } from '@/lib/vouchers';

import TechCheckoutLoader from '@/components/checkout/TechCheckoutLoader';
import { VIETNAM_PROVINCES, getDistrictsForProvince, getWardsForDistrict } from '@/data/vietnam-locations';

type CheckoutStep = 'shipping' | 'payment';

const SHIPPING_OPTIONS = [
  { id: 'ghn', name: 'GHN — Giao hàng nhanh', estimate: '1-2 ngày', price: 25000 },
  { id: 'ghtk', name: 'GHTK — Tiết kiệm', estimate: '3-5 ngày', price: 20000 },
];

const PAYMENT_METHODS = [
  {
    id: 'wallet',
    label: 'Ví điện tử thành viên (NKS E-Wallet)',
    desc: 'Thanh toán trực tiếp bằng số dư ví điện tử PCHub / NKS',
    icon: '💳',
    color: '#2563eb',
    showQR: false,
    isWallet: true,
  },
  {
    id: 'momo',
    label: 'Ví điện tử MoMo',
    desc: 'Quét mã QR MoMo hoặc thanh toán qua ứng dụng MoMo',
    icon: '💜',
    color: '#a21caf',
    showQR: true,
  },
  {
    id: 'zalopay',
    label: 'Ví điện tử ZaloPay',
    desc: 'Quét mã QR ZaloPay / thanh toán qua ứng dụng Zalo',
    icon: '💙',
    color: '#0284c7',
    showQR: true,
  },
  {
    id: 'vnpay',
    label: 'VNPay — QR / ATM / Visa',
    desc: 'Quét QR hoặc thanh toán thẻ ATM / Visa / Master',
    icon: '🏦',
    color: '#1d4ed8',
    showQR: true,
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
    label: 'Chuyển khoản ngân hàng 24/7',
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
    <div className="step-bar-container">
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
            <span className={`step-bar-label ${s.active || s.done ? 'step-bar-label-active' : ''}`} style={{
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
              margin: '0 12px',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const addOrder = useOrderStore(s => s.addOrder);
  const updateOrderWooId = useOrderStore(s => s.updateOrderWooId);
  const user = useAuthStore(s => s.user);

  // Auto-fill form từ thông tin user đăng nhập
  const nksUser = (user as any)?.user || user;
  const userToken = nksUser?.nks_token || nksUser?.token || (user as any)?.token || '';

  // Wallet Store
  const walletStore = useWalletStore(s => s.wallet);
  const deductWalletBalance = useWalletStore(s => s.deductBalance);
  const syncWalletWithBackend = useWalletStore(s => s.syncWithBackend);

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingOption, setShippingOption] = useState('ghn');
  const [payment, setPayment] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(15);
  const [processingStep, setProcessingStep] = useState<1 | 2 | 3>(1);
  const [createdOrderId, setCreatedOrderId] = useState<string>('ORD-PCHUB');

  // E-Wallet balance state
  const walletBalance = walletStore?.balance ?? 16000000;
  const walletCode = walletStore?.walletcode ?? 'PCH-8789';
  const [walletLoading, setWalletLoading] = useState(false);

  const [voucher, setVoucher] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState('');

  // Buyer information (lấy tự động từ API user/auth store)
  const [buyerForm, setBuyerForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // Shipping / Recipient form state (thông tin người nhận)
  const [sameAsBuyer, setSameAsBuyer] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    province: '', district: '', ward: '', address: '', note: '',
  });

  const orders = useOrderStore(s => s.orders);

  // Sync wallet on mount
  useEffect(() => {
    syncWalletWithBackend(userToken, orders);
  }, [userToken, orders, syncWalletWithBackend]);

  // Auto-fill buyer & recipient form từ thông tin user khi trang load
  useEffect(() => {
    if (nksUser) {
      const fullName = nksUser.name ||
        [nksUser.firstname, nksUser.lastname].filter(Boolean).join(' ') || '';
      const phone = nksUser.phone || '';
      const email = nksUser.email || '';
      
      setBuyerForm({
        name: fullName,
        phone: phone,
        email: email,
      });

      // Mặc định nếu người nhận chưa nhập gì thì gợi ý hoặc để người dùng nhập thông tin người nhận
      setForm(prev => ({
        ...prev,
        email: prev.email || email,
      }));
    }
  }, [nksUser?.email, nksUser?.phone, nksUser?.name]);

  const handleToggleSameAsBuyer = (checked: boolean) => {
    setSameAsBuyer(checked);
    if (checked) {
      setForm(prev => ({
        ...prev,
        name: buyerForm.name,
        phone: buyerForm.phone,
        email: buyerForm.email,
      }));
    }
  };

  const totalPrice = total();
  const selectedShipping = SHIPPING_OPTIONS.find(s => s.id === shippingOption);
  const shippingFee = totalPrice >= 500000 ? 0 : (selectedShipping?.price ?? 25000);
  const finalTotal = Math.max(0, totalPrice + shippingFee - voucherDiscount);

  const applyVoucher = async (codeToApply?: string) => {
    const code = (codeToApply || voucher).trim().toUpperCase();
    if (!code) {
      setVoucherDiscount(0);
      setVoucherMessage('Vui lòng nhập mã voucher');
      return;
    }

    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, totalPrice, shippingFee })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVoucher(code);
        setVoucherDiscount(data.discount);
        setVoucherMessage(`Áp dụng mã ${code} thành công: giảm ${data.discount.toLocaleString('vi-VN')}₫`);
        return;
      } else if (data.error) {
        setVoucherDiscount(0);
        setVoucherMessage(data.error);
        return;
      }
    } catch (err) {
      // Fallback to local calculation
    }

    const result = calculateVoucherDiscount(code, totalPrice, shippingFee);
    if (result.error) {
      setVoucherDiscount(0);
      setVoucherMessage(result.error);
    } else {
      setVoucher(code);
      setVoucherDiscount(result.discount);
      setVoucherMessage(`Áp dụng mã ${code} thành công: giảm ${result.discount.toLocaleString('vi-VN')}₫`);
    }
  };

  useEffect(() => {
    if (!items.length && !isProcessing) {
      router.push('/gio-hang');
    }
  }, [items.length, isProcessing, router]);

  if (!items.length && !isProcessing) {
    return null;
  }

  const handleShippingSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || isProcessing) return;

    setIsProcessing(true);
    setLoading(true);
    setProcessingProgress(25);
    setProcessingStep(1);

    const orderId = `ORD-${Date.now()}`;
    setCreatedOrderId(orderId);
    const selectedPayment = PAYMENT_METHODS.find(m => m.id === payment);

    const bName = buyerForm.name.trim() || form.name || 'Khách hàng PCHub';
    const bPhone = buyerForm.phone.trim() || form.phone || '0901234567';
    const bEmail = buyerForm.email.trim() || form.email || 'customer@pchub.vn';

    const rName = form.name.trim() || bName;
    const rPhone = form.phone.trim() || bPhone;

    // Nếu chọn thanh toán bằng Ví thành viên, kiểm tra số dư ví
    if (payment === 'wallet') {
      if ((walletBalance ?? 0) < finalTotal) {
        alert(`Số dư Ví điện tử (${(walletBalance ?? 0).toLocaleString('vi-VN')}₫) không đủ để thanh toán đơn hàng (${finalTotal.toLocaleString('vi-VN')}₫). Vui lòng nạp thêm tiền vào ví hoặc chọn hình thức thanh toán khác.`);
        setIsProcessing(false);
        setLoading(false);
        return;
      }

      // Trừ tiền trong ví qua Local Store ngay lập tức
      deductWalletBalance(finalTotal, `Thanh toán đơn hàng ${orderId}`, orderId);

      // Trừ tiền trong ví qua Backend API
      try {
        await fetch('/api/wallet/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            access_token: userToken,
            note: `Thanh toán đơn hàng ${orderId}`
          })
        });
      } catch (err) {
        console.warn('Wallet deduct API warning:', err);
      }
    }

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      status: 'pending' as const,
      statusLabel: 'Chờ xác nhận',
      total: finalTotal,
      buyer: {
        name: bName,
        phone: bPhone,
        email: bEmail,
      },
      products: items.map(item => ({
        id: item.product?.id || item.id,
        name: item.product?.name || item.name,
        price: item.product?.price || item.price,
        image: item.product?.image_url || item.product?.image || item.image || (item as any).image_url || '/images/cpu-box.jpg',
        quantity: item.quantity
      })),
      shippingAddress: {
        name: rName,
        phone: rPhone,
        email: bEmail,
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

    // Step 2 Progress
    setProcessingStep(2);
    setProcessingProgress(60);

    // Sync order to Sbuy WooCommerce backend (separate buyer & recipient)
    try {
      const wooRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer: {
            name: bName,
            phone: bPhone,
            email: bEmail,
          },
          customer: {
            name: rName,
            phone: rPhone,
            email: bEmail,
            address: form.address || 'Địa chỉ nhận hàng',
            province: form.province || 'Hà Nội',
            district: form.district || 'Cầu Giấy',
            ward: form.ward || 'Dịch Vọng Hậu',
            note: form.note
          },
          items: items.map(item => ({
            id: item.product?.id || item.id,
            name: item.product?.name || item.name,
            price: item.product?.price || item.price,
            quantity: item.quantity
          })),
          paymentMethod: payment,
          paymentMethodLabel: selectedPayment?.label || 'Thanh toán',
          shippingFee,
          total: finalTotal
        })
      });
      const wooData = await wooRes.json();
      // Lưu WooCommerce Order ID để sync status sau này
      if (wooData?.success && wooData?.wooOrderId) {
        updateOrderWooId(orderId, wooData.wooOrderId);
      }
    } catch (err) {
      console.warn('WooCommerce order push non-fatal warning:', err);
    }

    // Step 3 Progress: Complete
    setProcessingStep(3);
    setProcessingProgress(100);

    // Tech loading display buffer so user feels the smooth progress
    await new Promise(r => setTimeout(r, 700));

    // Clear cart right before router navigation
    clearCart();
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
          const prodImage = item.product?.image_url || item.product?.image || item.image || (item as any).image_url || '/images/cpu-box.jpg';
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
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
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
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
            {finalTotal.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>
    </div>
  );

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    outline: 'none',
    color: '#0f172a',
  };

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
            <div className="checkout-layout-grid" style={{ alignItems: 'flex-start' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* 1. Buyer Info Card (Tự động lấy từ API user / Tài khoản) */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#2563eb" />
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>1. Thông tin người mua</h2>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Thông tin tài khoản đăng nhập đặt đơn hàng</p>
                      </div>
                    </div>
                  </div>

                  <div className="home-grid-2" style={{ gap: '14px' }}>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Họ và tên người mua <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        required
                        placeholder="Họ và tên người mua"
                        value={buyerForm.name}
                        onChange={e => setBuyerForm(p => ({ ...p, name: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Số điện thoại người mua <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        required
                        placeholder="0912 345 678"
                        value={buyerForm.phone}
                        onChange={e => setBuyerForm(p => ({ ...p, phone: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Email người mua <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="email@example.com"
                        value={buyerForm.email}
                        onChange={e => setBuyerForm(p => ({ ...p, email: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Recipient / Shipping Info Card */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Truck size={16} color="#2563eb" />
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>2. Thông tin người nhận hàng</h2>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Địa chỉ và thông tin người trực tiếp nhận kiện hàng</p>
                      </div>
                    </div>

                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="checkbox"
                        checked={sameAsBuyer}
                        onChange={e => handleToggleSameAsBuyer(e.target.checked)}
                        style={{ accentColor: '#2563eb', width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                      Người nhận là người mua (dùng thông tin trên)
                    </label>
                  </div>

                  <div className="home-grid-2" style={{ gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Họ tên người nhận <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        required
                        placeholder="Họ tên người nhận hàng"
                        value={form.name}
                        onChange={e => {
                          setForm(p => ({ ...p, name: e.target.value }));
                          if (sameAsBuyer) setSameAsBuyer(false);
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Số điện thoại nhận hàng <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        required
                        placeholder="0912 345 678"
                        value={form.phone}
                        onChange={e => {
                          setForm(p => ({ ...p, phone: e.target.value }));
                          if (sameAsBuyer) setSameAsBuyer(false);
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Tỉnh / Thành phố <span style={{ color: '#ef4444' }}>*</span></label>
                      <select required value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value, district: '', ward: '' }))} style={inputStyle}>
                        <option value="">Chọn tỉnh/thành phố</option>
                        {VIETNAM_PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Thành phố / Huyện <span style={{ color: '#ef4444' }}>*</span></label>
                      <select required value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value, ward: '' }))} style={inputStyle}>
                        <option value="">Chọn thành phố/huyện</option>
                        {getDistrictsForProvince(form.province).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Phường / Xã <span style={{ color: '#ef4444' }}>*</span></label>
                      <select required value={form.ward} onChange={e => setForm(p => ({ ...p, ward: e.target.value }))} style={inputStyle}>
                        <option value="">Chọn phường/xã</option>
                        {getWardsForDistrict(form.district).map(w => (
                          <option key={w} value={w}>{w}</option>
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
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Nhập mã voucher để nhận ưu đãi cho đơn hàng</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={voucher}
                      onChange={e => { setVoucher(e.target.value.toUpperCase()); setVoucherMessage(''); setVoucherDiscount(0); }}
                      placeholder="Nhập mã giảm giá..."
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button type="button" onClick={() => applyVoucher()} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 18px', fontWeight: 700, cursor: 'pointer' }}>
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
            <div className="checkout-layout-grid" style={{ alignItems: 'flex-start' }}>

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

                        {/* Wallet Balance & Payment Info */}
                        {payment === 'wallet' && m.id === 'wallet' && (
                          <div style={{
                            padding: '18px 20px', background: '#f8fafc',
                            borderTop: `2px dashed ${m.color}40`,
                            display: 'flex', flexDirection: 'column', gap: '12px',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              <div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Mã ví & Tài khoản:</div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                                  {walletCode || '1fb5-82ed-4bac-b971'}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Số dư hiện khả dụng:</div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0284c7' }}>
                                  {walletLoading ? 'Đang tải...' : `${(walletBalance ?? 0).toLocaleString('vi-VN')}₫`}
                                </div>
                              </div>
                            </div>

                            <div style={{
                              padding: '10px 14px', borderRadius: '8px',
                              background: (walletBalance ?? 0) >= finalTotal ? '#ecfdf5' : '#fef2f2',
                              border: `1px solid ${(walletBalance ?? 0) >= finalTotal ? '#a7f3d0' : '#fecaca'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
                            }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: (walletBalance ?? 0) >= finalTotal ? '#16a34a' : '#dc2626' }}>
                                {(walletBalance ?? 0) >= finalTotal
                                  ? `✓ Số dư ví đủ thanh toán (Còn lại sau khi thanh toán: ${((walletBalance ?? 0) - finalTotal).toLocaleString('vi-VN')}₫)`
                                  : `✕ Số dư ví không đủ (Thiếu ${(finalTotal - (walletBalance ?? 0)).toLocaleString('vi-VN')}₫)`}
                              </span>
                              {(walletBalance ?? 0) < finalTotal && (
                                <Link
                                  href="/tai-khoan/vi-dien-tu"
                                  target="_blank"
                                  style={{
                                    fontSize: '11px', fontWeight: 800, color: '#2563eb',
                                    textDecoration: 'none', background: '#eff6ff',
                                    padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe'
                                  }}
                                >
                                  Nạp thêm ngay →
                                </Link>
                              )}
                            </div>
                          </div>
                        )}

                        {/* MoMo QR & Instructions */}
                        {payment === 'momo' && m.id === 'momo' && (
                          <div style={{
                            padding: '20px', background: '#fdf2f8',
                            borderTop: `2px dashed ${m.color}40`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                          }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#a21caf', textAlign: 'center' }}>
                              Quét mã QR MoMo hoặc chuyển đến số điện thoại bên dưới
                            </div>
                            <div style={{
                              width: '150px', height: '150px',
                              background: '#fff', border: '2px solid #f472b6',
                              borderRadius: '12px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 4px 15px rgba(217,70,239,0.15)',
                            }}>
                              <svg width="110" height="110" viewBox="0 0 120 120">
                                <rect width="120" height="120" fill="white"/>
                                <rect x="8" y="8" width="30" height="30" fill="none" stroke="#d946ef" strokeWidth="4" rx="3"/>
                                <rect x="14" y="14" width="18" height="18" fill="#d946ef" rx="2"/>
                                <rect x="82" y="8" width="30" height="30" fill="none" stroke="#d946ef" strokeWidth="4" rx="3"/>
                                <rect x="88" y="14" width="18" height="18" fill="#d946ef" rx="2"/>
                                <rect x="8" y="82" width="30" height="30" fill="none" stroke="#d946ef" strokeWidth="4" rx="3"/>
                                <rect x="14" y="88" width="18" height="18" fill="#d946ef" rx="2"/>
                                {[0,1,2,3,4,5,6].map(r => (
                                  [0,1,2,3,4,5,6].map(c => (
                                    <rect key={`${r}-${c}`} x={45 + c * 5} y={45 + r * 5} width="3.5" height="3.5" fill="#a21caf" rx="0.5"/>
                                  ))
                                ))}
                              </svg>
                            </div>
                            <div style={{ background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #fbcfe8', fontSize: '12px', color: '#475569', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div><strong>Số MoMo:</strong> <span style={{ color: '#d946ef', fontWeight: 800 }}>0912 345 678</span></div>
                              <div><strong>Chủ TK:</strong> PCHUB TECHNOLOGY VIETNAM</div>
                              <div><strong>Số tiền:</strong> <span style={{ color: '#ef4444', fontWeight: 800 }}>{finalTotal.toLocaleString('vi-VN')}₫</span></div>
                            </div>
                          </div>
                        )}

                        {/* ZaloPay QR & Instructions */}
                        {payment === 'zalopay' && m.id === 'zalopay' && (
                          <div style={{
                            padding: '20px', background: '#eff6ff',
                            borderTop: `2px dashed ${m.color}40`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                          }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0369a1', textAlign: 'center' }}>
                              Quét mã ZaloPay QR Đa Năng để hoàn tất thanh toán
                            </div>
                            <div style={{
                              width: '150px', height: '150px',
                              background: '#fff', border: '2px solid #0284c7',
                              borderRadius: '12px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 4px 15px rgba(2,132,199,0.15)',
                            }}>
                              <svg width="110" height="110" viewBox="0 0 120 120">
                                <rect width="120" height="120" fill="white"/>
                                <rect x="8" y="8" width="30" height="30" fill="none" stroke="#0068ff" strokeWidth="4" rx="3"/>
                                <rect x="14" y="14" width="18" height="18" fill="#0068ff" rx="2"/>
                                <rect x="82" y="8" width="30" height="30" fill="none" stroke="#0068ff" strokeWidth="4" rx="3"/>
                                <rect x="88" y="14" width="18" height="18" fill="#0068ff" rx="2"/>
                                <rect x="8" y="82" width="30" height="30" fill="none" stroke="#0068ff" strokeWidth="4" rx="3"/>
                                <rect x="14" y="88" width="18" height="18" fill="#0068ff" rx="2"/>
                                {[0,1,2,3,4,5,6].map(r => (
                                  [0,1,2,3,4,5,6].map(c => (
                                    <rect key={`${r}-${c}`} x={45 + c * 5} y={45 + r * 5} width="3.5" height="3.5" fill="#0068ff" rx="0.5"/>
                                  ))
                                ))}
                              </svg>
                            </div>
                            <div style={{ background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '12px', color: '#475569', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div><strong>Tài khoản ZaloPay:</strong> <span style={{ color: '#0068ff', fontWeight: 800 }}>PCHUB VIETNAM</span></div>
                              <div><strong>Số tiền:</strong> <span style={{ color: '#ef4444', fontWeight: 800 }}>{finalTotal.toLocaleString('vi-VN')}₫</span></div>
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
                    {items.map((item, idx) => {
                      const prodId = item.product?.id || item.id || `order-item-st3-${idx}`;
                      const prodName = item.product?.name || item.name || 'Sản phẩm linh kiện';
                      const prodImage = item.product?.image_url || item.product?.image || item.image || (item as any).image_url || '/images/cpu-box.jpg';
                      const prodPrice = item.product?.price || item.price || 0;
                      const quantity = item.quantity || 1;

                      return (
                        <div key={prodId} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{ width: '48px', height: '48px', flexShrink: 0, background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={prodImage} alt={prodName} style={{ maxWidth: '38px', maxHeight: '38px', objectFit: 'contain' }}
                              onError={e => { (e.target as HTMLImageElement).src = '/images/cpu-box.jpg'; }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {prodName}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>×{quantity}</span>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
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
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
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
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(37,99,235,0.35)'
                      }}
                    >
                      {loading ? 'Đang xử lý đơn hàng...' : '⚡ Xác Nhận Đặt Hàng →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {isProcessing && (
        <TechCheckoutLoader
          progress={processingProgress}
          step={processingStep}
          orderId={createdOrderId}
        />
      )}
    </div>
  );
}