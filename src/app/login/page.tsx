'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { normalizeUser } from '@/lib/auth';
import { CompanyApiService } from '@/lib/auth-api';

function encodeUserToken(user: object): string {
  const encoded = encodeURIComponent(JSON.stringify(user));
  const binary = encoded.replace(/%([0-9A-F]{2})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
  return btoa(binary);
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore(state => state.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // Load saved email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    const lastUserEmail = localStorage.getItem('nks_last_user_email');
    
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    } else if (lastUserEmail) {
      setEmail(lastUserEmail);
    }
    
    // Try to load from database
    fetch('/api/remembered-emails')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.accounts.length > 0) {
          const latestAccount = data.accounts[0];
          setEmail(prev => prev || latestAccount.email);
          if (!rememberedEmail && !lastUserEmail) {
            setRememberMe(true);
          }
        }
      })
      .catch(err => console.error('Error loading remembered emails:', err));
  }, []);

  const completeLogin = async (loginEmail: string, loginPassword: string) => {
    const result = await CompanyApiService.login(loginEmail, loginPassword);

    if (!result.success || !result.token) {
      setError(result.message || 'Đăng nhập không thành công.');
      return false;
    }

    const profileResult = await CompanyApiService.getProfile(result.token);
    const rawUser = profileResult.success && profileResult.user ? profileResult.user : result.user;
    const user = normalizeUser(rawUser);

    if (!user) {
      setError('Đăng nhập thành công nhưng không lấy được thông tin người dùng từ API.');
      return false;
    }

    setUser(user);

    const serializedUser = JSON.stringify(user);
    document.cookie = `pchub-user=${encodeURIComponent(serializedUser)}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `pchub-token=${encodeUserToken(user)}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `nks_token=${encodeURIComponent(result.token)}; path=/; max-age=2592000; SameSite=Lax`;

    if (rememberMe) {
      localStorage.setItem('remembered_email', loginEmail);
    }

    // Save to Supabase database
    if (user.email) {
      try {
        const { saveUserToDatabase } = await import('@/lib/user-service');
        await saveUserToDatabase({
          email: user.email,
          name: user.name,
          first_name: user.firstname,
          last_name: user.lastname,
          phone: user.phone,
          dob: user.dob,
          gender: user.gender !== undefined ? (user.gender === 0 ? 'Nam' : user.gender === 1 ? 'Nữ' : 'Khác') : undefined,
          avatar_url: user.avatar,
          nks_user_id: user.id?.toString(),
          nks_token: result.token,
          remember_me: rememberMe
        });
      } catch (error) {
        console.error('Error saving to database:', error);
      }
    }

    router.push(searchParams.get('next') || '/tai-khoan');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await completeLogin(email, password);
  };

  return (
    <div style={{
      background: '#edf0f5',
      minHeight: 'calc(100vh - 68px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        padding: '40px 44px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '8px'
          }}>
            Chào mừng trở lại 👋
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.5' }}>
            Đăng nhập để tiếp tục tối ưu hóa hiệu suất thiết bị của bạn.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '12px 14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 38px 11px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
              />
              <span>Ghi nhớ tôi</span>
            </label>
            <Link href="/forgot-password" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              background: '#0055d4',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginTop: '4px',
              transition: 'background 0.2s'
            }}
          >
            Đăng nhập
            <ArrowRight size={16} />
          </button>

        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.6px',
          margin: '28px 0 20px 0'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          <span style={{ padding: '0 14px' }}>HOẶC ĐĂNG NHẬP VỚI MẠNG XÃ HỘI</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        {/* Social Buttons (Vertically Stacked BELOW Form) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button 
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '11px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Tiếp tục với Google
          </button>
          
          <button 
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '11px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Tiếp tục với Facebook
          </button>
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
            Đăng ký miễn phí
          </Link>
        </div>

      </div>
    </div>
  );
}

