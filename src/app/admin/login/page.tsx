'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    urlError === 'forbidden'
      ? 'Tài khoản của bạn không có quyền truy cập quản trị (chỉ dành cho nhân viên / admin).'
      : null
  );
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 mb-4 border border-blue-400/30">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            PCHub Admin Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Hệ thống quản trị bán lẻ linh kiện & build PC
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email quản trị viên
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pchub.vn"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực quyền...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập Quản trị</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                Tài khoản mẫu:
              </span>
              <span className="text-[11px] text-slate-500">Bấm để điền nhanh</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@pchub.vn', 'admin123456')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-blue-900/30 border border-slate-700/60 hover:border-blue-500/50 text-left text-xs transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-blue-300 flex items-center justify-between">
                  <span>Admin</span>
                  <Sparkles className="w-3 h-3 text-amber-400 opacity-70" />
                </div>
                <div className="text-[11px] text-slate-400 truncate">admin@pchub.vn</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('support@pchub.vn', 'support123456')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-blue-900/30 border border-slate-700/60 hover:border-blue-500/50 text-left text-xs transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-blue-300">Support</div>
                <div className="text-[11px] text-slate-400 truncate">support@pchub.vn</div>
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
            >
              Quay lại cửa hàng PCHub
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          © {new Date().getFullYear()} PCHub Retail System. Phiên bản quản trị bảo mật 2FA.
        </p>
      </div>
    </div>
  );
}
