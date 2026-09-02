'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { CompanyApiService } from './api';
import { Modal } from '@/components/ui/modal';
import AvatarCropper from '@/components/AvatarCropper';
import {
  User,
  CreditCard,
  Image as ImageIcon,
  LogOut,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings,
  Smartphone,
  Share2,
  Camera,
  Crop,
  QrCode,
  ExternalLink,
  ArrowLeft,
  Pencil,
  X,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

/* ─────────────────────────── Toast ─────────────────────────── */
interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN SCREEN (inline – shown when no token)
═══════════════════════════════════════════════════════════════ */
function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem('nks_saved_accounts');
      if (data) setSavedAccounts(JSON.parse(data) || []);
      const last = localStorage.getItem('nks_last_user_email');
      if (last) setEmail(last);
    } catch { /* ignore */ }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Vui lòng nhập đầy đủ email và mật khẩu.'); return; }
    setError('');
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    if (!res.success) {
      setError(res.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  const handleQuickLogin = async (acc: any) => {
    setEmail(acc.email);
    setError('');
    setIsLoading(true);
    // Quick-login only pre-fills email; user still needs to input password
    setIsLoading(false);
    setEmail(acc.email);
  };

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '24px',
        padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(99,102,241,0.08)',
      }} className="dark:bg-gray-900 dark:border-gray-700">

        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
          }}>
            <CreditCard size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }} className="dark:text-white">
            Đăng nhập NKS
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }} className="dark:text-gray-400">
            Đăng nhập để quản lý Ecard của bạn
          </p>
        </div>

        {/* Quick-login cards */}
        {savedAccounts.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tài khoản đã lưu
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    background: email === acc.email ? '#f0f0ff' : '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    borderColor: email === acc.email ? '#6366f1' : '#e5e7eb',
                  }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                >
                  {acc.avatar ? (
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e5e7eb' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={16} color="#6366f1" />
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }} className="dark:text-white">{acc.name}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }} className="dark:text-gray-400">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ height: '1px', background: '#f3f4f6', margin: '16px 0' }} className="dark:bg-gray-700" />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }} className="dark:text-gray-300">
              Email / Tên đăng nhập
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#111827',
                background: '#fff',
              }}
              className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }} className="dark:text-gray-300">
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 44px 0 14px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#111827',
                  background: '#fff',
                }}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPass ? <Eye size={17} /> : <KeyRound size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '46px',
              background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '15px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE (shown when token exists)
═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, token, loading, logout, refreshProfile } = useAuth();
  const [ecards, setEcards] = useState<any[]>([]);
  const [selectedEcard, setSelectedEcard] = useState<any | null>(null);
  const [qrModalCard, setQrModalCard] = useState<any | null>(null);

  const [activeSection, setActiveSection] = useState<'basic' | 'theme' | 'social' | 'info' | 'bank' | 'assets' | null>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [avatarCropperSrc, setAvatarCropperSrc] = useState<string | null>(null);
  const [bannerCropperSrc, setBannerCropperSrc] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Form Fields State
  const [formFields, setFormFields] = useState<Record<string, any>>({
    title: '',
    firstname: '',
    lastname: '',
    slogan: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    geolocation: '',
    color: '#6366f1',
    type: 'personal',
    isPersonal: 1,
    style: 'SBC000',
  });

  const [socialLinks, setSocialLinks] = useState<{ social: string; link: string }[]>([]);
  const [infoFields, setInfoFields] = useState<{ label: string; content: string; url: string }[]>([]);
  const [bankAccounts, setBankAccounts] = useState<{ bank: string; account: string; number: string }[]>([]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // ── Load ecards when token becomes available ──
  useEffect(() => {
    if (token) {
      const searchParams = new URLSearchParams(window.location.search);
      const queryCode = searchParams.get('code') || undefined;
      loadEcards(queryCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Helpers ──
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  const loadEcards = async (selectCode?: string) => {
    if (!token) return;
    try {
      const res = await CompanyApiService.getEcards(token);
      if (res.success) {
        const cards = res.ecards || [];
        setEcards(cards);
        if (cards.length > 0) {
          const codeToSelect = selectCode || cards[0].code;
          handleSelectEcard(codeToSelect, cards);
        }
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast('Lỗi tải Ecard: ' + err.message, 'error');
    }
  };

  const populateForm = (card: any) => {
    setFormFields({
      title: card.title || '',
      firstname: card.firstname || '',
      lastname: card.lastname || '',
      slogan: card.slogan || '',
      company: card.company || '',
      position: card.position || '',
      email: card.email || '',
      phone: card.phone || '',
      website: card.website || '',
      address: card.address || '',
      geolocation: card.geolocation || '',
      color: card.color || '#6366f1',
      type: card.type || 'personal',
      isPersonal: card.isPersonal !== undefined ? card.isPersonal : 1,
      style: card.style || 'SBC000',
    });

    // Social
    let parsedSocial: any[] = [];
    if (typeof card.social === 'string') { try { parsedSocial = JSON.parse(card.social); } catch { parsedSocial = []; } }
    else if (Array.isArray(card.social)) { parsedSocial = card.social; }
    setSocialLinks((parsedSocial || []).map((item: any) => ({
      social: item.social || item.type || 'Facebook',
      link: item.link || item.url || item.label || '',
    })));

    // Info
    let parsedInfo: any[] = [];
    if (typeof card.info === 'string') { try { parsedInfo = JSON.parse(card.info); } catch { parsedInfo = []; } }
    else if (Array.isArray(card.info)) { parsedInfo = card.info; }
    setInfoFields(parsedInfo || []);

    // Bank
    let parsedBank: any[] = [];
    if (typeof card.bank === 'string') { try { parsedBank = JSON.parse(card.bank); } catch { parsedBank = []; } }
    else if (Array.isArray(card.bank)) { parsedBank = card.bank; }
    setBankAccounts(parsedBank || []);
  };

  const handleSelectEcard = async (code: string, cardsList: any[] = ecards) => {
    if (!token) return;
    const localCard = cardsList.find((c) => c.code === code);
    if (localCard) { setSelectedEcard(localCard); populateForm(localCard); }

    setIsLoadingDetails(true);
    try {
      const res = await CompanyApiService.getEcardDetails(token, code);
      if (res.success && res.ecard) { setSelectedEcard(res.ecard); populateForm(res.ecard); }
      else console.warn('API getEcardDetails error:', res.message);
    } catch (err: any) {
      console.warn('API getEcardDetails failed:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // ── Ecard text update ──
  const handleUpdateEcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedEcard) return;
    setIsSubmitting(true);
    try {
      const formattedSocial = socialLinks.map((item) => ({
        social: item.social,
        link: item.link,
        type: item.social.toLowerCase(),
        label: item.link,
        url: item.link,
      }));

      const payload = {
        ...formFields,
        title: formFields.title || selectedEcard.title || 'Ecard',
        social: JSON.stringify(formattedSocial),
        info: JSON.stringify(infoFields),
        bank: JSON.stringify(bankAccounts),
      };

      const res = await CompanyApiService.updateEcard(token, selectedEcard.code, payload);
      if (res.success) {
        showToast('Đã lưu thông tin Ecard thành công!');
        await loadEcards(selectedEcard.code);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast('Lỗi cập nhật: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Avatar & Banner ──
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) setAvatarCropperSrc(ev.target.result as string); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  const handleAvatarCropComplete = async (base64Data: string) => {
    if (!token || !selectedEcard) return;
    setAvatarCropperSrc(null);
    setIsUploadingAvatar(true);
    try {
      const res = await CompanyApiService.updateEcardAvatar(token, selectedEcard.code, base64Data);
      if (res.success) { showToast('Cập nhật ảnh đại diện Ecard thành công!'); await loadEcards(selectedEcard.code); }
      else showToast(res.message, 'error');
    } catch (err: any) { showToast('Lỗi tải ảnh: ' + err.message, 'error'); }
    finally { setIsUploadingAvatar(false); }
  };

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) setBannerCropperSrc(ev.target.result as string); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  const handleBannerCropComplete = async (base64Data: string) => {
    if (!token || !selectedEcard) return;
    setBannerCropperSrc(null);
    setIsUploadingBanner(true);
    try {
      const res = await CompanyApiService.updateEcardBanner(token, selectedEcard.code, base64Data);
      if (res.success) { showToast('Cập nhật ảnh bìa Ecard thành công!'); await loadEcards(selectedEcard.code); }
      else showToast(res.message, 'error');
    } catch (err: any) { showToast('Lỗi tải ảnh bìa: ' + err.message, 'error'); }
    finally { setIsUploadingBanner(false); }
  };

  // ── Dynamic list helpers ──
  const addSocialLink = () => setSocialLinks([...socialLinks, { social: 'Facebook', link: '' }]);
  const removeSocialLink = (idx: number) => setSocialLinks(socialLinks.filter((_, i) => i !== idx));
  const updateSocialLink = (idx: number, field: string, value: string) => {
    const u = [...socialLinks]; u[idx] = { ...u[idx], [field]: value }; setSocialLinks(u);
  };
  const addInfoField = () => setInfoFields([...infoFields, { label: 'bio', content: '', url: '' }]);
  const removeInfoField = (idx: number) => setInfoFields(infoFields.filter((_, i) => i !== idx));
  const updateInfoField = (idx: number, field: string, value: string) => {
    const u = [...infoFields]; u[idx] = { ...u[idx], [field]: value }; setInfoFields(u);
  };
  const addBankAccount = () => setBankAccounts([...bankAccounts, { bank: 'TienPhongBank', account: '', number: '' }]);
  const removeBankAccount = (idx: number) => setBankAccounts(bankAccounts.filter((_, i) => i !== idx));
  const updateBankAccount = (idx: number, field: string, value: string) => {
    const u = [...bankAccounts]; u[idx] = { ...u[idx], [field]: value }; setBankAccounts(u);
  };

  const getAvatarUrl = (path?: string) => {
    if (!path || path.includes('default.png')) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `https://account.nks.vn/storage/${path}`;
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-brand-500" />
      </div>
    );
  }

  /* ── Not logged in → show inline login ── */
  if (!token) {
    return <LoginScreen />;
  }

  /* ── Main dashboard ── */
  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white dark:bg-gray-800 transition-all duration-300 ${
              t.type === 'error'
                ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            }`}
          >
            {t.type === 'success' ? <CheckCircle size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-500" />}
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── User Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white/[0.03] p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {user?.avatar || user?.avatar_url ? (
            <img
              src={getAvatarUrl(user.avatar || user.avatar_url)}
              alt={user.name || user.username}
              className="rounded-full object-cover border-2 border-brand-200"
              style={{ width: '40px', height: '40px', minWidth: '40px', maxWidth: '40px', flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div
              className="rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-base"
              style={{ width: '40px', height: '40px', minWidth: '40px', maxWidth: '40px', flexShrink: 0 }}
            >
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
              {user?.name || user?.username || 'Người dùng NKS'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshProfile}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold transition-all"
            title="Tải lại thông tin hồ sơ"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 text-xs font-semibold transition-all border border-red-100 dark:border-red-900/40"
          >
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-500" />
            {selectedEcard ? `Thiết Kế & Chỉnh Sửa Ecard (${selectedEcard.code})` : 'Dashboard Ecard'}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {selectedEcard
              ? 'Tùy chỉnh nội dung hiển thị và xem trước trực tiếp qua Iframe công khai.'
              : 'Danh sách tất cả Ecard của bạn (hiển thị dạng GRID).'}
          </p>
        </div>
        {selectedEcard && (
          <button
            onClick={() => setSelectedEcard(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold transition-all shrink-0"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        )}
      </div>

      {/* ── Mode 1: GRID View ── */}
      {!selectedEcard && (
        <div className="space-y-6">
          {ecards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecards.map((card) => (
                <div
                  key={card.code}
                  className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Banner */}
                  <div className="h-28 bg-gradient-to-r from-brand-500 to-indigo-600 relative overflow-hidden">
                    {card.banner && (
                      <img src={getAvatarUrl(card.banner)} alt="Banner" className="w-full h-full object-cover" />
                    )}
                  </div>
                  {/* Body */}
                  <div className="px-5 pt-0 pb-5 flex-1 flex flex-col relative">
                    <div className="-mt-10 mb-3 flex items-end justify-between">
                      <img
                        src={getAvatarUrl(card.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent((card.lastname || '') + ' ' + (card.firstname || ''))}&background=6366f1&color=fff`}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent('NKS')}&background=6366f1&color=fff`;
                        }}
                      />
                      <span className="text-xs font-mono bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-lg font-bold border border-brand-200 dark:border-brand-800">
                        {card.code}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {card.lastname || ''} {card.firstname || ''}
                    </h3>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium truncate mt-0.5">
                      {card.position || 'Chưa cập nhật chức vụ'} {card.company ? `• ${card.company}` : ''}
                    </p>
                    {card.slogan && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2 mt-2">
                        &ldquo;{card.slogan}&rdquo;
                      </p>
                    )}
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/60 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleSelectEcard(card.code)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-all shadow-xs"
                      >
                        <Pencil size={13} /> Sửa
                      </button>
                      <a
                        href={`/c/${card.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all"
                      >
                        <Eye size={13} /> Xem
                      </a>
                      <button
                        onClick={() => setQrModalCard(card)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all"
                      >
                        <QrCode size={13} /> QR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 p-12 text-center bg-white dark:bg-white/[0.03]">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bạn chưa có chiếc Ecard nào được đăng ký trên hệ thống.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Mode 2: EDIT Workspace ── */}
      {selectedEcard && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left: Iframe Preview */}
          <div className="xl:col-span-5 xl:sticky xl:top-24 flex flex-col items-center bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="w-full mb-3 flex items-center justify-between text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-brand-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Iframe Live Preview</span>
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">LIVE</span>
            </div>
            {/* URL bar */}
            <div className="w-full flex items-center justify-between p-2.5 mb-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
              <span className="font-mono text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                https://secard.io.vn/{selectedEcard.code}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(`https://secard.io.vn/${selectedEcard.code}`); showToast('Đã sao chép đường link Ecard!'); }}
                  className="px-2 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 text-gray-700 dark:text-gray-200 text-xs font-medium transition-colors"
                >
                  Sao chép
                </button>
                <a href={`/c/${selectedEcard.code}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md text-gray-500 hover:text-brand-500 transition-colors" title="Mở tab mới">
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <div className="w-full h-[680px] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white">
              <iframe
                src={`/c/${selectedEcard.code}`}
                key={selectedEcard.code}
                className="w-full h-full border-0"
                title="Ecard Live Preview"
              />
            </div>
          </div>

          {/* Right: Editor */}
          <div className="xl:col-span-7 flex flex-col gap-6">

            {/* WORKFLOW 1: Text & layout */}
            <form onSubmit={handleUpdateEcard} className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thiết kế Ecard ({selectedEcard.code})
                </h2>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-all cursor-pointer shadow-md shadow-brand-500/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Lưu thông tin
                </button>
              </div>

              {isLoadingDetails ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <Loader2 size={32} className="animate-spin text-brand-500" />
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Section 1: Basic */}
                  <SectionWrapper
                    label="Thông tin liên hệ"
                    icon={<User size={18} className="text-brand-500" />}
                    isOpen={activeSection === 'basic'}
                    onToggle={() => setActiveSection(activeSection === 'basic' ? null : 'basic')}
                  >
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="Danh xưng" placeholder="Mr/Ms" value={formFields.title} onChange={(v) => setFormFields({ ...formFields, title: v })} />
                        <InputField label="Họ / Tên đệm" placeholder="Nguyễn" value={formFields.lastname} onChange={(v) => setFormFields({ ...formFields, lastname: v })} required />
                        <InputField label="Tên" placeholder="Văn A" value={formFields.firstname} onChange={(v) => setFormFields({ ...formFields, firstname: v })} required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <InputField label="Slogan cá nhân / Châm ngôn" placeholder="Kết nối sức mạnh - Dẫn bước thành công" value={formFields.slogan} onChange={(v) => setFormFields({ ...formFields, slogan: v })} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Loại tài khoản</label>
                          <select
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-300 focus:outline-none dark:border-gray-800"
                            value={formFields.type}
                            onChange={(e) => setFormFields({ ...formFields, type: e.target.value })}
                          >
                            <option value="personal">Cá nhân</option>
                            <option value="business">Doanh nghiệp</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Công ty" placeholder="NKS Group" value={formFields.company} onChange={(v) => setFormFields({ ...formFields, company: v })} />
                        <InputField label="Chức vụ / Vị trí" placeholder="Giám đốc công nghệ" value={formFields.position} onChange={(v) => setFormFields({ ...formFields, position: v })} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Email hiển thị" placeholder="email@domain.com" type="email" value={formFields.email} onChange={(v) => setFormFields({ ...formFields, email: v })} />
                        <InputField label="Số điện thoại liên hệ" placeholder="0912345678" type="tel" value={formFields.phone} onChange={(v) => setFormFields({ ...formFields, phone: v })} />
                      </div>
                      <InputField label="Website" placeholder="https://nks.vn" value={formFields.website} onChange={(v) => setFormFields({ ...formFields, website: v })} />
                      <InputField label="Địa chỉ làm việc" placeholder="123 Đường ABC, Quận 1, TP. HCM" value={formFields.address} onChange={(v) => setFormFields({ ...formFields, address: v })} />
                    </div>
                  </SectionWrapper>

                  {/* Section 2: Theme */}
                  <SectionWrapper
                    label="Giao diện & Chủ đề"
                    icon={<Settings size={18} className="text-brand-500" />}
                    isOpen={activeSection === 'theme'}
                    onToggle={() => setActiveSection(activeSection === 'theme' ? null : 'theme')}
                  >
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Chọn phong cách thiết kế</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['SBC000', 'SBC001', 'SBC002'] as const).map((s) => (
                            <div
                              key={s}
                              className={`p-4 rounded-xl border text-center text-sm font-medium cursor-pointer transition-all duration-200 ${
                                formFields.style === s
                                  ? 'bg-brand-50 border-brand-500 text-brand-500 dark:bg-brand-500/10'
                                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                              }`}
                              onClick={() => setFormFields({ ...formFields, style: s })}
                            >
                              {s === 'SBC000' ? 'SBC000 (Đơn giản)' : s === 'SBC001' ? 'SBC001 (Gradient)' : 'SBC002 (Glow)'}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Màu sắc chủ đề chính</label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="color"
                            className="h-10 w-16 p-0 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer bg-transparent"
                            value={formFields.color}
                            onChange={(e) => setFormFields({ ...formFields, color: e.target.value })}
                          />
                          <span className="text-sm font-mono font-semibold">{formFields.color}</span>
                        </div>
                      </div>
                    </div>
                  </SectionWrapper>

                  {/* Section 3: Social */}
                  <SectionWrapper
                    label="Liên kết mạng xã hội"
                    icon={<Share2 size={18} className="text-brand-500" />}
                    isOpen={activeSection === 'social'}
                    onToggle={() => setActiveSection(activeSection === 'social' ? null : 'social')}
                  >
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col gap-3">
                        {socialLinks.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <select
                              className="h-11 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-300 focus:outline-none dark:border-gray-800"
                              style={{ width: '130px' }}
                              value={item.social}
                              onChange={(e) => updateSocialLink(idx, 'social', e.target.value)}
                            >
                              {['Facebook', 'Instagram', 'LinkedIn', 'Zalo', 'YouTube', 'TikTok', 'Twitter', 'Website'].map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              className="h-11 flex-1 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-800 dark:text-white/90"
                              placeholder="Link hoặc số điện thoại..."
                              value={item.link}
                              onChange={(e) => updateSocialLink(idx, 'link', e.target.value)}
                            />
                            <button
                              type="button"
                              className="flex items-center justify-center h-11 w-11 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-all cursor-pointer dark:border-red-900/30 dark:hover:bg-red-950/20"
                              onClick={() => removeSocialLink(idx)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-all cursor-pointer py-1"
                        onClick={addSocialLink}
                      >
                        <Plus size={14} /> Thêm liên kết mạng xã hội
                      </button>
                    </div>
                  </SectionWrapper>

                  {/* Section 4: Info */}
                  <SectionWrapper
                    label="Các mục giới thiệu (Bio / Dịch vụ)"
                    icon={<Globe size={18} className="text-brand-500" />}
                    isOpen={activeSection === 'info'}
                    onToggle={() => setActiveSection(activeSection === 'info' ? null : 'info')}
                  >
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col gap-4">
                        {infoFields.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-white/[0.01]">
                            <div className="flex justify-between items-center">
                              <input
                                type="text"
                                className="h-9 rounded-lg border border-gray-200 bg-transparent px-3 text-sm font-semibold text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-800 dark:text-white/90"
                                placeholder="Nhãn (ví dụ: bio, Dịch vụ)"
                                value={item.label}
                                onChange={(e) => updateInfoField(idx, 'label', e.target.value)}
                                style={{ width: '220px' }}
                              />
                              <button
                                type="button"
                                className="flex items-center justify-center h-9 w-9 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-all cursor-pointer dark:border-red-900/30 dark:hover:bg-red-950/20"
                                onClick={() => removeInfoField(idx)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <textarea
                              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-800 dark:text-white/90"
                              placeholder="Nội dung hiển thị chi tiết..."
                              rows={2}
                              value={item.content}
                              onChange={(e) => updateInfoField(idx, 'content', e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-all cursor-pointer py-1"
                        onClick={addInfoField}
                      >
                        <Plus size={14} /> Thêm mục giới thiệu
                      </button>
                    </div>
                  </SectionWrapper>

                  {/* Section 5: Bank */}
                  <SectionWrapper
                    label="Tài khoản ngân hàng (Nhận tiền)"
                    icon={<CreditCard size={18} className="text-brand-500" />}
                    isOpen={activeSection === 'bank'}
                    onToggle={() => setActiveSection(activeSection === 'bank' ? null : 'bank')}
                  >
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col gap-4">
                        {bankAccounts.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-white/[0.01]">
                            <div className="flex justify-between items-center">
                              <select
                                className="h-9 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 px-3 text-sm font-semibold text-gray-800 dark:text-white/90 focus:border-brand-300 focus:outline-none dark:border-gray-800"
                                style={{ width: '180px' }}
                                value={item.bank}
                                onChange={(e) => updateBankAccount(idx, 'bank', e.target.value)}
                              >
                                {['TienPhongBank', 'Agribank', 'Vietcombank', 'Techcombank', 'MBBank', 'Vietinbank', 'BIDV', 'ACB'].map((b) => (
                                  <option key={b} value={b}>{b === 'TienPhongBank' ? 'TPBank' : b}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="flex items-center justify-center h-9 w-9 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-all cursor-pointer dark:border-red-900/30 dark:hover:bg-red-950/20"
                                onClick={() => removeBankAccount(idx)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                className="h-10 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-800 dark:text-white/90"
                                placeholder="Chủ tài khoản (IN HOA KHÔNG DẤU)"
                                value={item.account}
                                onChange={(e) => updateBankAccount(idx, 'account', e.target.value.toUpperCase())}
                                required
                              />
                              <input
                                type="text"
                                className="h-10 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-800 dark:text-white/90"
                                placeholder="Số tài khoản"
                                value={item.number}
                                onChange={(e) => updateBankAccount(idx, 'number', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-all cursor-pointer py-1"
                        onClick={addBankAccount}
                      >
                        <Plus size={14} /> Thêm tài khoản ngân hàng
                      </button>
                    </div>
                  </SectionWrapper>

                </div>
              )}
            </form>

            {/* WORKFLOW 2: Avatar */}
            <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                <ImageIcon size={18} className="text-brand-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Ảnh đại diện Ecard (Avatar)</h3>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 flex items-center justify-center">
                  <img
                    src={getAvatarUrl(selectedEcard.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent((selectedEcard.lastname || '') + ' ' + (selectedEcard.firstname || ''))}&background=6366f1&color=fff&size=112`}
                    alt="Current Avatar"
                    className="w-full h-full object-cover"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Thay đổi ảnh đại diện Ecard</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Chọn ảnh mới để cắt tỷ lệ 1:1. Ảnh sẽ được tự động đồng bộ lên sau khi xác nhận.</p>
                  <input type="file" ref={avatarInputRef} onChange={handleAvatarFileSelect} accept="image/*" className="hidden" disabled={isUploadingAvatar} />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md shadow-brand-500/10"
                    disabled={isUploadingAvatar}
                  >
                    <Camera size={16} /> Chọn và cắt ảnh đại diện
                  </button>
                </div>
              </div>
            </div>

            {/* WORKFLOW 3: Banner */}
            <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                <ImageIcon size={18} className="text-brand-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Ảnh bìa Ecard (Banner)</h3>
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 flex items-center justify-center">
                  {selectedEcard.banner ? (
                    <img src={getAvatarUrl(selectedEcard.banner)} alt="Current Banner" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">Chưa có ảnh bìa</span>
                  )}
                  {isUploadingBanner && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 size={32} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Thay đổi ảnh bìa Ecard</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Chọn ảnh theo tỷ lệ 2:1 (chữ nhật ngang) làm banner cho Ecard.</p>
                  <input type="file" ref={bannerInputRef} onChange={handleBannerFileSelect} accept="image/*" className="hidden" disabled={isUploadingBanner} />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md shadow-brand-500/10"
                    disabled={isUploadingBanner}
                  >
                    <Crop size={16} /> Chọn và cắt ảnh bìa
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Croppers */}
      {avatarCropperSrc && (
        <AvatarCropper
          imageSrc={avatarCropperSrc}
          onCropComplete={handleAvatarCropComplete}
          onClose={() => setAvatarCropperSrc(null)}
          aspectRatio={1}
          title="Cắt ảnh đại diện Ecard"
        />
      )}
      {bannerCropperSrc && (
        <AvatarCropper
          imageSrc={bannerCropperSrc}
          onCropComplete={handleBannerCropComplete}
          onClose={() => setBannerCropperSrc(null)}
          aspectRatio={2}
          title="Cắt ảnh bìa (Banner) Ecard"
        />
      )}

      {/* QR Modal */}
      {qrModalCard && (
        <Modal isOpen={!!qrModalCard} onClose={() => setQrModalCard(null)}>
          <div className="p-6 text-center space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Mã QR: {qrModalCard.lastname} {qrModalCard.firstname}
              </h3>
              <button onClick={() => setQrModalCard(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 inline-block shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`https://secard.io.vn/${qrModalCard.code}`)}`}
                alt="QR Code"
                className="w-52 h-52 mx-auto"
              />
            </div>
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
              https://secard.io.vn/{qrModalCard.code}
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => { navigator.clipboard.writeText(`https://secard.io.vn/${qrModalCard.code}`); showToast('Đã sao chép link!'); }}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Sao chép Link
              </button>
              <button
                onClick={() => setQrModalCard(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────── Shared sub-components ─────────────────────────── */
function SectionWrapper({
  label,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
      <div
        className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 dark:text-white py-2"
        onClick={onToggle}
      >
        <span className="flex items-center gap-2 text-base">
          {icon} {label}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {isOpen && children}
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-800 dark:text-white/90 dark:focus:border-brand-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
