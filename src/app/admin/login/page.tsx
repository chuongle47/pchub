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
  Globe,
  ChevronDown,
  ChevronRight,
  Store,
  Layers,
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
  const [error, setError] = useState<string | null>(
    urlError === 'forbidden'
      ? 'Tài khoản của bạn không có quyền truy cập quản trị.'
      : null
  );
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
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
      setError(err.message || 'Đã có lỗi xảy ra khi xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px]">
      {/* Pristine White Login Card (DirectAdmin Reference Style) */}
      <div className="bg-white rounded-[32px] shadow-[0_25px_60px_-15px_rgba(2,132,199,0.35)] border border-white/80 p-8 sm:p-11 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-800 leading-none flex items-center gap-1">
              <span>PCHub</span>
              <span className="font-extrabold text-[#0284c7]">Admin</span>
            </div>
            <div className="text-xs font-normal text-slate-400 tracking-wider lowercase mt-1">
              web control panel
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username / Email field */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Username
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter username"
              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
            />
          </div>

          {/* Password field with eye toggle */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <div className="flex items-center w-full h-12 bg-white border border-slate-200 rounded-xl px-4 gap-2 focus-within:border-[#0284c7] focus-within:ring-2 focus-within:ring-[#0284c7]/20 transition-all">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Please enter your password"
                className="flex-1 h-full bg-transparent border-0 outline-none p-0 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 shrink-0 cursor-pointer focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-3 rounded-xl bg-[#38bdf8] hover:bg-[#0ea5e9] active:bg-[#0284c7] text-white font-semibold text-sm transition-all shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Language selector & Return to storefront */}
        <div className="mt-7 pt-4 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Language:</span>
            <span className="font-medium text-slate-600">Tiếng Việt</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#0284c7] transition-colors mt-1"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Quay lại cửa hàng PCHub</span>
          </Link>

          {/* Timestamp footer (matching reference image) */}
          <div className="text-[11px] font-mono text-slate-300 mt-2 select-none">
            {timestamp || '2026-11-18 20:06:45'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-[#5ec0ee] via-[#3aa9e3] to-[#2081c7] selection:bg-[#0284c7] selection:text-white">
      {/* Low-poly crystalline geometric background facets */}
      <svg
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30 mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <polygon points="0,0 480,240 240,600 0,900" fill="#ffffff" opacity="0.15" />
        <polygon points="480,240 960,180 800,540 240,600" fill="#ffffff" opacity="0.08" />
        <polygon points="960,180 1440,0 1440,480 800,540" fill="#ffffff" opacity="0.2" />
        <polygon points="800,540 1440,480 1440,900 600,900" fill="#ffffff" opacity="0.12" />
        <polygon points="240,600 800,540 600,900 0,900" fill="#ffffff" opacity="0.18" />
      </svg>

      {/* Ambient soft glow bubbles */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container: 2-column layout on Desktop, centered on mobile */}
      <div className="w-full max-w-6xl relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Side: Brand Watermark (matching KnownHost in reference screenshot) */}
        <div className="hidden lg:flex flex-col justify-end self-end mb-6">
          <div className="flex items-center gap-3.5 bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-lg shadow-black/5">
            <div className="w-12 h-12 rounded-xl bg-white/25 border border-white/40 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-white text-lg tracking-wider uppercase drop-shadow-xs">
                PCHub
              </div>
              <div className="text-white/80 text-xs font-medium tracking-wide">
                Retail & Workstation Platform
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Login Card */}
        <div className="w-full flex justify-center lg:justify-end">
          <Suspense
            fallback={
              <div className="w-full max-w-[460px] h-[480px] bg-white rounded-[32px] p-8 flex items-center justify-center shadow-2xl">
                <Loader2 className="w-8 h-8 text-[#0284c7] animate-spin" />
              </div>
            }
          >
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
