'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Bạn cần đồng ý với điều khoản dịch vụ');
      return;
    }

    setLoading(true);

    try {
      // For now, redirect to login since we don't have a register API
      // In production, this would call a registration API
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1000);
    } catch (err) {
      setError('Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '8px'
          }}>
            Tạo tài khoản mới 🎉
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.5' }}>
            Đăng ký để trải nghiệm mua sắm linh kiện PC tuyệt vời
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Full Name */}
          <div>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '11px 38px 11px 42px',
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

          {/* Confirm Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '11px 38px 11px 42px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({...formData, agreeTerms: e.target.checked})}
              required
              style={{ width: '16px', height: '16px', accentColor: '#2563eb', marginTop: '2px' }}
            />
            <span>
              Tôi đồng ý với <Link href="/terms" style={{ color: '#2563eb', textDecoration: 'none' }}>Điều khoản dịch vụ</Link> và <Link href="/privacy" style={{ color: '#2563eb', textDecoration: 'none' }}>Chính sách bảo mật</Link>
            </span>
          </label>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#94a3b8' : '#0055d4',
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
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px'
            }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
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
          <span style={{ padding: '0 14px' }}>HOẶC ĐĂNG KÝ VỚI MẠNG XÃ HỘI</span>
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
            Đăng ký với Google
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
            Đăng ký với Facebook
          </button>
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
            Đăng nhập ngay
          </Link>
        </div>

      </div>
    </div>
  );
}