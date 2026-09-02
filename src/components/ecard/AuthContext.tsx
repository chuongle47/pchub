'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanyApiService } from './api';

// --- Lightweight cookie helpers (no external dependency) ---
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// --- Types ---
interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from cookie on mount
  useEffect(() => {
    async function initAuth() {
      const savedToken = getCookie('nks_token');
      if (savedToken) {
        setToken(savedToken);
        const res = await CompanyApiService.getProfile(savedToken);
        if (res.success && res.user) {
          setUser(res.user);
          const userJson = JSON.stringify(res.user);
          setCookie('pchub-user', userJson, 30);
        } else {
          // Token expired or invalid – clear silently
          removeCookie('nks_token');
          removeCookie('pchub-user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await CompanyApiService.login(email, password);
      if (res.success && res.token) {
        setCookie('nks_token', res.token, 7);
        setToken(res.token);
        setUser(res.user);
        if (res.user) {
          setCookie('pchub-user', JSON.stringify(res.user), 30);
        }

        // Persist account history for quick-login cards
        try {
          const accountsJson = localStorage.getItem('nks_saved_accounts');
          let accounts: any[] = [];
          try { accounts = JSON.parse(accountsJson || '[]') || []; } catch { accounts = []; }
          if (!Array.isArray(accounts)) accounts = [];

          const emailLower = email.toLowerCase();
          const avatarUrl =
            res.user?.avatar ??
            res.user?.avatar_url ??
            '';
          const name =
            res.user?.name ?? res.user?.username ?? email.split('@')[0];

          const existIdx = accounts.findIndex((acc) => acc.email?.toLowerCase() === emailLower);
          if (existIdx > -1) {
            accounts[existIdx].name = name;
            accounts[existIdx].avatar = avatarUrl;
          } else {
            accounts.push({ email: emailLower, name, avatar: avatarUrl });
          }
          localStorage.setItem('nks_saved_accounts', JSON.stringify(accounts));
          localStorage.setItem('nks_last_user_email', emailLower);
        } catch (e) {
          console.error('Error saving account history', e);
        }

        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, message: res.message || 'Đăng nhập không thành công.' };
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Lỗi kết nối.' };
    }
  };

  const logout = () => {
    removeCookie('nks_token');
    removeCookie('pchub-user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    const res = await CompanyApiService.getProfile(token);
    if (res.success) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
