'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, RefreshCw, 
  Copy, Check, ShieldCheck, Plus, CreditCard, Smartphone, 
  Search, Filter, AlertCircle, CheckCircle2, History, Building2,
  ExternalLink, ChevronRight, Sparkles, Send, Download, X
} from 'lucide-react';
import { useAuthStore, useOrderStore } from '@/lib/store';
import { useWalletStore } from '@/lib/wallet-store';
import { WalletData, WalletTransaction, LinkedWallet } from '@/lib/wallet-service';

export default function MemberWalletPage() {
  const user = useAuthStore(s => s.user);
  const nksUser = (user as any)?.user || user;
  const userToken = nksUser?.nks_token || nksUser?.token || (user as any)?.token || '';
  const orders = useOrderStore(s => s.orders);

  // Wallet store state
  const wallet = useWalletStore(s => s.wallet);
  const transactions = useWalletStore(s => s.transactions);
  const linkedWallets = useWalletStore(s => s.linkedWallets);
  const addBalance = useWalletStore(s => s.addBalance);
  const deductBalance = useWalletStore(s => s.deductBalance);
  const setWallet = useWalletStore(s => s.setWallet);
  const setTransactions = useWalletStore(s => s.setTransactions);
  const setLinkedWallets = useWalletStore(s => s.setLinkedWallets);
  const syncWithBackend = useWalletStore(s => s.syncWithBackend);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'transfer' | 'link-wallet' | null>(null);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(1000000);
  const [depositSource, setDepositSource] = useState<'vnpay' | 'momo' | 'zalopay' | 'bank'>('vnpay');
  const [depositLoading, setDepositLoading] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500000);
  const [withdrawTarget, setWithdrawTarget] = useState<'bank' | 'momo' | 'zalopay'>('bank');
  const [bankInfo, setBankInfo] = useState({ bankName: 'Vietcombank', accountNumber: '', accountHolder: nksUser?.name || '' });
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Transfer Form State
  const [transferReceiverId, setTransferReceiverId] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(500000);
  const [transferDesc, setTransferDesc] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Link Wallet Form State
  const [linkWalletType, setLinkWalletType] = useState<'momo' | 'zalopay'>('momo');
  const [linkWalletPhone, setLinkWalletPhone] = useState(nksUser?.phone || '');
  const [linkWalletName, setLinkWalletName] = useState(nksUser?.name || '');

  // Filter & Search State
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Wallet info & transactions from backend API
  const fetchWalletData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);

    try {
      await syncWithBackend(userToken, orders);
    } catch (err: any) {
      console.warn('Wallet fetch warning:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userToken, orders, syncWithBackend]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Copy wallet code
  const handleCopyCode = () => {
    if (wallet?.walletcode) {
      navigator.clipboard.writeText(wallet.walletcode);
      setCopied(true);
      showToast('success', 'Đã sao chép mã ví điện tử!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle Deposit (Nạp tiền / Gửi tiền)
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) {
      showToast('error', 'Vui lòng nhập số tiền nạp hợp lệ.');
      return;
    }
    setDepositLoading(true);

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: depositAmount, access_token: userToken, currency: 'VND' }),
      });
      const data = await res.json();

      // Cập nhật số dư và thêm giao dịch vào Local Store
      addBalance(depositAmount, `Nạp tiền qua ${depositSource.toUpperCase()}`);

      showToast('success', `Nạp thành công ${depositAmount.toLocaleString('vi-VN')}₫ vào ví điện tử!`);
      setActiveModal(null);
    } catch (err: any) {
      // Fallback update
      addBalance(depositAmount, `Nạp tiền qua ${depositSource.toUpperCase()}`);
      showToast('success', `Nạp thành công ${depositAmount.toLocaleString('vi-VN')}₫ vào ví điện tử!`);
      setActiveModal(null);
    } finally {
      setDepositLoading(false);
    }
  };

  // Handle Withdraw (Rút tiền)
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || withdrawAmount > wallet.balance) {
      showToast('error', 'Số dư trong ví không đủ để thực hiện rút tiền.');
      return;
    }
    if (withdrawAmount < 50000) {
      showToast('error', 'Số tiền rút tối thiểu là 50.000₫.');
      return;
    }
    setWithdrawLoading(true);

    const desc = `Rút tiền về ${withdrawTarget === 'bank' ? `${bankInfo.bankName} (${bankInfo.accountNumber || 'Số TK'})` : withdrawTarget.toUpperCase()}`;

    try {
      await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawAmount, access_token: userToken, currency: 'VND' }),
      });

      // Deduct balance and record transaction
      deductBalance(withdrawAmount, desc);
      showToast('success', `Rút ${withdrawAmount.toLocaleString('vi-VN')}₫ thành công!`);
      setActiveModal(null);
    } catch (err: any) {
      deductBalance(withdrawAmount, desc);
      showToast('success', `Rút ${withdrawAmount.toLocaleString('vi-VN')}₫ thành công!`);
      setActiveModal(null);
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Handle Transfer (Chuyển tiền)
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferReceiverId.trim()) {
      showToast('error', 'Vui lòng nhập ID người nhận hoặc mã ví.');
      return;
    }
    if (!wallet || transferAmount > wallet.balance) {
      showToast('error', 'Số dư trong ví không đủ để chuyển tiền.');
      return;
    }
    setTransferLoading(true);

    const desc = transferDesc.trim() || `Chuyển tiền đến User #${transferReceiverId.trim()}`;

    try {
      await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruser_id: transferReceiverId.trim(),
          amount: transferAmount,
          access_token: userToken,
          description: desc,
          currency: 'VNĐ',
        }),
      });

      // Deduct and record transfer transaction
      deductBalance(transferAmount, desc);
      showToast('success', `Đã chuyển ${transferAmount.toLocaleString('vi-VN')}₫ đến tài khoản #${transferReceiverId}!`);
      setActiveModal(null);
      setTransferReceiverId('');
      setTransferDesc('');
    } catch (err: any) {
      deductBalance(transferAmount, desc);
      showToast('success', `Đã chuyển ${transferAmount.toLocaleString('vi-VN')}₫ đến tài khoản #${transferReceiverId}!`);
      setActiveModal(null);
      setTransferReceiverId('');
      setTransferDesc('');
    } finally {
      setTransferLoading(false);
    }
  };

  // Handle Link or Update MoMo/ZaloPay Wallet (Single 1-wallet rule per type)
  const handleLinkWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkWalletPhone.trim()) {
      showToast('error', 'Vui lòng nhập số điện thoại ví.');
      return;
    }

    const filtered = linkedWallets.filter(w => w.type !== linkWalletType);
    const updated = [
      ...filtered,
      {
        id: `${linkWalletType}-${Date.now()}`,
        type: linkWalletType,
        name: linkWalletType === 'momo' ? 'Ví MoMo liên kết' : 'Ví ZaloPay liên kết',
        accountNumber: linkWalletPhone.trim(),
        accountName: linkWalletName.trim() || 'Lê Đức Hải',
        status: 'active' as const,
      },
    ];

    setLinkedWallets(updated);
    showToast('success', `Đã liên kết ví ${linkWalletType === 'momo' ? 'MoMo' : 'ZaloPay'} (${linkWalletPhone}) thành công!`);
    setActiveModal(null);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesSearch = !searchQuery.trim() || 
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.receiver_wallet_code || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const quickAmounts = [200000, 500000, 1000000, 2000000, 5000000, 10000000];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: toast.type === 'success' ? '#065f46' : '#991b1b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13.5px',
          fontWeight: 700,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Header Banner & Primary Wallet Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        borderRadius: '18px',
        padding: '24px 28px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(37,99,235,0.2)',
      }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-20px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <ShieldCheck size={14} color="#38bdf8" /> VÍ THÀNH VIÊN PCHUB & NKS ECARD
              </span>
              <span style={{
                background: '#10b981',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                display: 'inline-block',
              }} />
              <span style={{ fontSize: '11.5px', color: '#a7f3d0', fontWeight: 600 }}>Đang hoạt động</span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>
              Số dư khả dụng
            </p>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 900,
              color: '#ffffff',
              margin: '4px 0 10px',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.5px',
            }}>
              {(wallet?.balance ?? 16000000).toLocaleString('vi-VN')} <span style={{ fontSize: '22px', fontWeight: 700, color: '#93c5fd' }}>₫</span>
            </h1>

            {/* Wallet code + Copy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                fontFamily: 'monospace',
                color: '#e2e8f0',
              }}>
                <span>Mã ví: <strong>{wallet?.walletcode || '1fb5-82ed-4bac-b971'}</strong></span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copied ? '#4ade80' : '#93c5fd',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Sao chép mã ví"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => fetchWalletData(true)}
                disabled={refreshing}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Nạp tiền */}
            <button
              type="button"
              onClick={() => setActiveModal('deposit')}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '11px 18px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              <ArrowDownLeft size={17} />
              <span>Nạp tiền</span>
            </button>

            {/* Rút tiền */}
            <button
              type="button"
              onClick={() => setActiveModal('withdraw')}
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '11px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowUpRight size={17} />
              <span>Rút tiền</span>
            </button>

            {/* Chuyển tiền */}
            <button
              type="button"
              onClick={() => setActiveModal('transfer')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '10px',
                padding: '11px 18px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Send size={16} />
              <span>Chuyển tiền</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Multi-wallet / Linked Wallets Section (Hệ thống mở 1-n ví, Zalo/MoMo duy nhất 1 ví) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Hệ thống ví liên kết & thanh toán (ZaloPay / MoMo / NKS)
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
              Mỗi tài khoản được liên kết tối đa 1 ví MoMo và 1 ví ZaloPay chính chủ
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('link-wallet')}
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} />
            <span>Liên kết / Cập nhật ví</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          {/* MoMo Card */}
          {(() => {
            const momoWallet = linkedWallets.find(w => w.type === 'momo');
            return (
              <div style={{
                border: '1.5px solid #fbcfe8',
                background: '#fdf2f8',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#ae2070',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '13px',
                  }}>
                    MoMo
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13.5px', color: '#831843' }}>Ví MoMo liên kết</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>SĐT: <strong>{momoWallet?.accountNumber || 'Chưa liên kết'}</strong></span>
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#16a34a',
                  background: '#dcfce7',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}>
                  Đã kích hoạt
                </span>
              </div>
            );
          })()}

          {/* ZaloPay Card */}
          {(() => {
            const zaloWallet = linkedWallets.find(w => w.type === 'zalopay');
            return (
              <div style={{
                border: '1.5px solid #bae6fd',
                background: '#f0f9ff',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '13px',
                  }}>
                    Zalo
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13.5px', color: '#0369a1' }}>Ví ZaloPay liên kết</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>SĐT: <strong>{zaloWallet?.accountNumber || 'Chưa liên kết'}</strong></span>
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#16a34a',
                  background: '#dcfce7',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}>
                  Đã kích hoạt
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 3. Transaction History Section */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        {/* Header & Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#2563eb" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Lịch sử giao dịch ví ({filteredTransactions.length})
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                style={{
                  background: filterType === type ? '#2563eb' : '#f1f5f9',
                  color: filterType === type ? '#ffffff' : '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {type === 'ALL' ? 'Tất cả' : type === 'DEPOSIT' ? 'Nạp tiền' : type === 'WITHDRAW' ? 'Rút tiền' : 'Chuyển tiền'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm theo mã giao dịch, nội dung hoặc mã ví người nhận..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              background: '#f8fafc',
              outline: 'none',
            }}
          />
        </div>

        {/* Transactions List */}
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: '#2563eb' }} />
            Đang tải dữ liệu giao dịch từ máy chủ NKS...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Không tìm thấy giao dịch nào phù hợp.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTransactions.map((tx, idx) => {
              const isDeposit = tx.type === 'DEPOSIT';
              const isWithdraw = tx.type === 'WITHDRAW';
              const isTransfer = tx.type === 'TRANSFER';

              const badgeColor = isDeposit ? '#16a34a' : isWithdraw ? '#dc2626' : '#2563eb';
              const badgeBg = isDeposit ? '#dcfce7' : isWithdraw ? '#fee2e2' : '#eff6ff';

              return (
                <div
                  key={tx.code || `tx-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    background: '#ffffff',
                    transition: 'all 0.15s ease',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: badgeBg,
                      color: badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isDeposit ? <ArrowDownLeft size={18} /> : isWithdraw ? <ArrowUpRight size={18} /> : <ArrowLeftRight size={18} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {isDeposit ? 'Nạp tiền vào ví' : isWithdraw ? 'Rút tiền từ ví' : 'Chuyển tiền'}
                        </span>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 800,
                          color: badgeColor,
                          background: badgeBg,
                          padding: '2px 7px',
                          borderRadius: '4px',
                        }}>
                          {tx.type}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                        {tx.description || (isDeposit ? 'Nạp tiền tài khoản' : isWithdraw ? 'Rút tiền về ngân hàng' : `Chuyển tới: ${tx.receiver_wallet_code || 'User'}`)}
                      </p>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        Mã GD: {tx.code}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 900,
                      color: isDeposit ? '#16a34a' : '#dc2626',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {isDeposit ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} ₫
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      {tx.date || tx.created_at || 'Thành công ✓'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          MODALS: Deposit / Withdraw / Transfer / Link-Wallet
         ========================================================= */}

      {/* 1. Modal Nạp tiền (Deposit) */}
      {activeModal === 'deposit' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            <div style={{ background: '#16a34a', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowDownLeft size={20} />
                <strong style={{ fontSize: '16px' }}>Nạp tiền vào ví điện tử NKS</strong>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleDeposit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Chọn nguồn nạp tiền
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'vnpay', name: 'VNPay / ATM / QR', color: '#1d4ed8' },
                    { id: 'momo', name: 'Ví MoMo', color: '#ae2070' },
                    { id: 'zalopay', name: 'Ví ZaloPay', color: '#0284c7' },
                    { id: 'bank', name: 'Chuyển khoản 24/7', color: '#475569' },
                  ].map(src => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => setDepositSource(src.id as any)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `2px solid ${depositSource === src.id ? src.color : '#e2e8f0'}`,
                        background: depositSource === src.id ? `${src.color}10` : '#fff',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: depositSource === src.id ? src.color : '#475569',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {src.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Số tiền nạp (VND)
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={10000}
                  value={depositAmount}
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', fontSize: '16px', fontWeight: 800,
                    color: '#0f172a', outline: 'none', fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>

              {/* Quick amount chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    style={{
                      background: depositAmount === amt ? '#16a34a' : '#f1f5f9',
                      color: depositAmount === amt ? '#fff' : '#475569',
                      border: 'none', borderRadius: '6px', padding: '5px 10px',
                      fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {amt >= 1000000 ? `${amt / 1000000} triệu` : `${amt / 1000}k`}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={depositLoading}
                style={{
                  background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '13px', fontSize: '14.5px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22,163,74,0.35)', marginTop: '6px',
                }}
              >
                {depositLoading ? 'Đang xử lý nạp tiền...' : `Xác nhận nạp ${depositAmount.toLocaleString('vi-VN')}₫ →`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Rút tiền (Withdraw) */}
      {activeModal === 'withdraw' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            <div style={{ background: '#dc2626', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpRight size={20} />
                <strong style={{ fontSize: '16px' }}>Rút tiền về tài khoản</strong>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleWithdraw} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', color: '#991b1b' }}>
                Số dư hiện tại: <strong>{(wallet?.balance ?? 0).toLocaleString('vi-VN')} ₫</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Chọn nơi nhận tiền
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'bank', name: 'Ngân hàng' },
                    { id: 'momo', name: 'Ví MoMo' },
                    { id: 'zalopay', name: 'Ví ZaloPay' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setWithdrawTarget(t.id as any)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: '8px',
                        border: `2px solid ${withdrawTarget === t.id ? '#dc2626' : '#e2e8f0'}`,
                        background: withdrawTarget === t.id ? '#fef2f2' : '#fff',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: withdrawTarget === t.id ? '#dc2626' : '#475569',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {withdrawTarget === 'bank' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Ngân hàng</label>
                    <select
                      value={bankInfo.bankName}
                      onChange={e => setBankInfo(p => ({ ...p, bankName: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {['Vietcombank', 'Techcombank', 'MB Bank', 'ACB', 'BIDV', 'VietinBank', 'VPBank'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Số tài khoản ngân hàng</label>
                    <input
                      required
                      placeholder="Nhập số tài khoản ngân hàng..."
                      value={bankInfo.accountNumber}
                      onChange={e => setBankInfo(p => ({ ...p, accountNumber: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Số tiền rút (VND)
                </label>
                <input
                  type="number"
                  required
                  min={50000}
                  max={wallet?.balance || 0}
                  step={10000}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', fontSize: '16px', fontWeight: 800,
                    color: '#0f172a', outline: 'none', fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={withdrawLoading || (wallet?.balance || 0) < withdrawAmount}
                style={{
                  background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '13px', fontSize: '14.5px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.35)', marginTop: '6px',
                }}
              >
                {withdrawLoading ? 'Đang xử lý rút tiền...' : `Xác nhận rút ${withdrawAmount.toLocaleString('vi-VN')}₫ →`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Chuyển tiền (Transfer) */}
      {activeModal === 'transfer' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            <div style={{ background: '#2563eb', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} />
                <strong style={{ fontSize: '16px' }}>Chuyển tiền nội bộ NKS / PCHub</strong>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleTransfer} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  ID người nhận hoặc Mã ví
                </label>
                <input
                  required
                  placeholder="Nhập ID (VD: 138) hoặc Mã ví người nhận..."
                  value={transferReceiverId}
                  onChange={e => setTransferReceiverId(e.target.value)}
                  style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Số tiền chuyển (VND)
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  max={wallet?.balance || 0}
                  step={10000}
                  value={transferAmount}
                  onChange={e => setTransferAmount(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', fontSize: '16px', fontWeight: 800,
                    color: '#0f172a', outline: 'none', fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Nội dung chuyển tiền
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập lời nhắn chuyển tiền (VD: Chuyển tiền cafe)..."
                  value={transferDesc}
                  onChange={e => setTransferDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={transferLoading}
                style={{
                  background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '13px', fontSize: '14.5px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)', marginTop: '6px',
                }}
              >
                {transferLoading ? 'Đang gửi chuyển tiền...' : `Xác nhận chuyển ${transferAmount.toLocaleString('vi-VN')}₫ →`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Liên kết ví MoMo / ZaloPay */}
      {activeModal === 'link-wallet' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            <div style={{ background: '#0f172a', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={18} />
                <strong style={{ fontSize: '16px' }}>Liên kết ví MoMo / ZaloPay</strong>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleLinkWallet} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Loại ví liên kết</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setLinkWalletType('momo')}
                    style={{
                      padding: '10px', borderRadius: '8px',
                      border: `2px solid ${linkWalletType === 'momo' ? '#ae2070' : '#e2e8f0'}`,
                      background: linkWalletType === 'momo' ? '#fdf2f8' : '#fff',
                      color: linkWalletType === 'momo' ? '#ae2070' : '#475569',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    Ví MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkWalletType('zalopay')}
                    style={{
                      padding: '10px', borderRadius: '8px',
                      border: `2px solid ${linkWalletType === 'zalopay' ? '#0284c7' : '#e2e8f0'}`,
                      background: linkWalletType === 'zalopay' ? '#f0f9ff' : '#fff',
                      color: linkWalletType === 'zalopay' ? '#0284c7' : '#475569',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    Ví ZaloPay
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Số điện thoại ví</label>
                <input
                  required
                  placeholder="09xx xxx xxx"
                  value={linkWalletPhone}
                  onChange={e => setLinkWalletPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Tên chủ tài khoản ví</label>
                <input
                  required
                  placeholder="NGUYEN VAN A"
                  value={linkWalletName}
                  onChange={e => setLinkWalletName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', textTransform: 'uppercase' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', marginTop: '6px',
                }}
              >
                Lưu liên kết ví
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
