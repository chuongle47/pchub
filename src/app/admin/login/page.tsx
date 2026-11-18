'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(
    urlError === 'forbidden'
      ? 'Tài khoản của bạn không có quyền truy cập quản trị (chỉ dành cho nhân sự được phân quyền).'
      : null
  );
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Email hoặc mật khẩu không chính xác.');
      }

      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra khi xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] relative z-10 mx-auto">
      {/* Brand & Security Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 mb-4 border border-blue-400/30">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          PCHub Admin Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          Cổng quản trị & vận hành bán lẻ linh kiện PC
        </p>

        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Hệ thống bảo mật RBAC & SSL 256-bit
        </div>
      </div>

      {/* Main Login Card */}
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/80">
        {error && (
          <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field with flex layout - icon can NEVER overlap text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Email quản trị viên
            </label>
            <div className="flex items-center w-full h-12 rounded-xl bg-slate-950 border border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 px-3.5 gap-3 transition-all">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pchub.vn"
                style={{ padding: 0, margin: 0, background: 'transparent', color: '#ffffff' }}
                className="flex-1 h-full bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 admin-login-input focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Password field with flex layout and eye toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mật khẩu
              </label>
            </div>
            <div className="flex items-center w-full h-12 rounded-xl bg-slate-950 border border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 px-3.5 gap-3 transition-all">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{ padding: 0, margin: 0, background: 'transparent', color: '#ffffff' }}
                className="flex-1 h-full bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 font-mono tracking-wider admin-login-input focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 shrink-0 focus:outline-none cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Options: Remember me & Help */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-slate-400 hover:text-slate-300">
                Ghi nhớ đăng nhập
              </span>
            </label>

            <a
              href="mailto:support@pchub.vn"
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Hỗ trợ kỹ thuật?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực thông tin...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập Quản trị</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Return to store link */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Quay lại trang chủ PCHub Store</span>
          </Link>
        </div>
      </div>

      {/* Security Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500 mt-6">
        <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span>© 2026 PCHub Management Portal. Truy cập chỉ dành cho nhân sự được phân quyền.</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-slate-100 p-4 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
