'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  Lock,
  Mail,
  Cpu,
  Sparkles,
  Zap,
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
      ? 'Tài khoản của bạn không có quyền truy cập khu vực quản trị.'
      : null
  );
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    try {
      document.documentElement.classList.remove('dark');
    } catch {}

    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const formatted = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
        now.getSeconds()
      )} • ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
      setTimestamp(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
      setError(err.message || 'Đã có lỗi xảy ra khi xác thực tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/90 overflow-hidden flex flex-col md:flex-row transition-all animate-in fade-in zoom-in-95 duration-300">
      {/* 2. Cột bên trái (Dark Theme - Thông tin hệ thống) */}
      <div className="md:w-5/12 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle tech grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

        {/* Ambient glow effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Brand Identity & Highlights */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 ring-1 ring-white/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">PCHub</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 rounded uppercase tracking-wider">
                  Admin Pro
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">Hệ thống quản trị bán lẻ v2.4</span>
            </div>
          </div>

          {/* Title & Description with improved line-height */}
          <div className="mt-8 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              Trung Tâm Điều Hành & Quản Trị Hệ Thống
            </h2>
            <p className="text-xs text-slate-300/90 leading-relaxed font-normal">
              Nền tảng kiểm soát kho linh kiện, vận hành đơn hàng và tối ưu doanh số bán lẻ thời gian thực.
            </p>
          </div>

          {/* Feature Cards with Glassmorphism */}
          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:bg-white/15">
              <div className="w-7 h-7 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-white text-xs block truncate">Quản lý kho & Đơn hàng tự động</span>
                <span className="text-[10px] text-slate-300/80 block truncate">Đồng bộ tức thì với website cửa hàng</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:bg-white/15">
              <div className="w-7 h-7 rounded-lg bg-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-white text-xs block truncate">AI Advisor tư vấn cấu hình PC</span>
                <span className="text-[10px] text-slate-300/80 block truncate">Tích hợp Gemini 2.5 Pro chốt đơn</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:bg-white/15">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-white text-xs block truncate">Bảo mật đa tầng & Phân quyền</span>
                <span className="text-[10px] text-slate-300/80 block truncate">Audit Log giám sát mọi thao tác nội bộ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Trái: Gọn gàng, tinh tế */}
        <div className="mt-8 pt-4 border-t border-white/10 relative z-10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-300">Máy chủ: Trực tuyến</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">{timestamp || 'Live'}</span>
        </div>
      </div>

      {/* 3. Cột bên phải (Light Theme - Form Đăng nhập) */}
      <div className="md:w-7/12 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
        <div>
          {/* Header Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Đăng nhập Quản trị viên
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Vui lòng nhập email và mật khẩu được cấp quyền để tiếp tục.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field with clean white background & modern border */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email / Tài khoản quản trị <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center w-full h-12 bg-white border border-gray-200 rounded-lg px-4 gap-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pchub.vn"
                  className="flex-1 h-full bg-transparent border-0 outline-none p-0 text-sm text-slate-900 placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Password Field with clean white background & modern border */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center w-full h-12 bg-white border border-gray-200 rounded-lg px-4 gap-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị"
                  className="flex-1 h-full bg-transparent border-0 outline-none p-0 text-sm text-slate-900 placeholder:text-gray-400 font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-700 transition-colors p-1 shrink-0 cursor-pointer focus:outline-none"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-500 hover:text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Ghi nhớ phiên</span>
              </label>
              <span className="text-gray-400 cursor-default">Hỗ trợ 24/7</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors font-medium group"
          >
            <Store className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span>← Quay lại cửa hàng</span>
          </Link>

          <span className="flex items-center gap-1.5 text-gray-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bảo mật 2 lớp SSL 256-bit</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Form Container */}
      <div className="w-full relative z-10 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-4xl h-[520px] bg-white rounded-2xl p-8 flex items-center justify-center shadow-lg border border-slate-200">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
