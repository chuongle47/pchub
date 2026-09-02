'use client';

import React, { FormEvent, useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { CreditCard, QrCode, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('Nam');
  
  const [saved, setSaved] = useState(false);
  const [hasEcard, setHasEcard] = useState(false);
  const [ecardDetails, setEcardDetails] = useState<any>(null);

  // Sync initial user details from NKS API data
  useEffect(() => {
    if (user) {
      // Check if user has NKS data structure
      const nksUser = (user as any).user || user;
      
      // Use NKS fields if available, otherwise fallback to legacy format
      if (nksUser.firstname && nksUser.lastname) {
        setFirstName(nksUser.firstname);
        setLastName(nksUser.lastname);
      } else {
        // Legacy format: split full name
        const fullName = user.name ?? 'Khách hàng';
        const nameParts = fullName.trim().split(/\s+/);
        const first = nameParts.slice(0, -1).join(' ') || fullName;
        const last = nameParts.at(-1) || '';
        setFirstName(first);
        setLastName(last);
      }
      
      setEmail(nksUser.email ?? user.email ?? '');
      setPhone(nksUser.phone ?? user.phone ?? '');
      
      // Use NKS dob field if available
      if (nksUser.dob) {
        setBirthday(nksUser.dob);
      } else {
        // Load from localStorage as fallback
        try {
          const savedProfile = localStorage.getItem('pchub-profile-extra');
          if (savedProfile) {
            const extra = JSON.parse(savedProfile);
            if (extra.birthday) setBirthday(extra.birthday);
          }
        } catch (e) {}
      }
      
      // Map NKS gender: 0 = Nam, 1 = Nữ, 2 = Khác
      if (nksUser.gender !== undefined) {
        const genderMap: Record<number, string> = {
          0: 'Nam',
          1: 'Nữ',
          2: 'Khác'
        };
        setGender(genderMap[nksUser.gender] || 'Nam');
      } else {
        // Load from localStorage as fallback
        try {
          const savedProfile = localStorage.getItem('pchub-profile-extra');
          if (savedProfile) {
            const extra = JSON.parse(savedProfile);
            if (extra.gender) setGender(extra.gender);
          }
        } catch (e) {}
      }
    }
  }, [user]);

  // Check NKS Ecard association
  useEffect(() => {
    function checkEcard() {
      // Check nks_token cookie
      const cookies = document.cookie.split(';');
      const nksTokenCookie = cookies.find(c => c.trim().startsWith('nks_token='));
      const pchubUserCookie = cookies.find(c => c.trim().startsWith('pchub-user='));
      
      if (nksTokenCookie) {
        setHasEcard(true);
        if (pchubUserCookie) {
          try {
            const rawUser = decodeURIComponent(pchubUserCookie.split('=')[1]);
            const parsed = JSON.parse(rawUser);
            setEcardDetails(parsed);
          } catch (e) {}
        }
      }
    }
    checkEcard();
  }, []);

  const handleReset = () => {
    if (user) {
      const nksUser = (user as any).user || user;
      
      // Use NKS fields if available
      if (nksUser.firstname && nksUser.lastname) {
        setFirstName(nksUser.firstname);
        setLastName(nksUser.lastname);
      } else {
        // Legacy format: split full name
        const fullName = user.name ?? 'Khách hàng';
        const nameParts = fullName.trim().split(/\s+/);
        setFirstName(nameParts.slice(0, -1).join(' ') || fullName);
        setLastName(nameParts.at(-1) || '');
      }
      
      setEmail(nksUser.email ?? user.email ?? '');
      setPhone(nksUser.phone ?? user.phone ?? '');
      
      // Reset birthday from NKS data if available
      if (nksUser.dob) {
        setBirthday(nksUser.dob);
      }
      
      // Reset gender from NKS data if available
      if (nksUser.gender !== undefined) {
        const genderMap: Record<number, string> = {
          0: 'Nam',
          1: 'Nữ',
          2: 'Khác'
        };
        setGender(genderMap[nksUser.gender] || 'Nam');
      }
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const fullName = `${firstName} ${lastName}`.trim();
    
    // Check if user has NKS data structure
    const nksUser = (user as any).user || user;
    
    // Map gender back to NKS format: Nam = 0, Nữ = 1, Khác = 2
    const genderMap: Record<string, number> = {
      'Nam': 0,
      'Nữ': 1,
      'Khác': 2
    };
    
    const updatedUser = {
      ...user,
      name: fullName,
      email,
      phone,
      // If NKS structure exists, update those fields too
      ...(nksUser.firstname && { firstname: firstName }),
      ...(nksUser.lastname && { lastname: lastName }),
      ...(nksUser.dob !== undefined && { dob: birthday }),
      ...(nksUser.gender !== undefined && { gender: genderMap[gender] || 0 })
    };

    // Save to Zustand store
    setUser(updatedUser);

    // Save to cookie so server side can read it
    document.cookie = `pchub-user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=2592000; SameSite=Lax`;

    // Save extra profile details to localStorage (for legacy support)
    localStorage.setItem('pchub-profile-extra', JSON.stringify({ birthday, gender }));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="profile-page">
      <div className="profile-header-row mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h1>
        <p className="text-gray-500 text-sm">Quản lý và cập nhật thông tin tài khoản của bạn</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={submit} className="profile-form-box bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="profile-form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="field flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Họ & Tên đệm</span>
                <input 
                  type="text"
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-transparent dark:text-white outline-none focus:border-blue-500 transition-colors"
                />
              </label>

              <label className="field flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tên</span>
                <input 
                  type="text"
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-transparent dark:text-white outline-none focus:border-blue-500 transition-colors"
                />
              </label>

              <label className="field flex flex-col gap-1.5 md:col-span-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</span>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-transparent dark:text-white outline-none focus:border-blue-500 transition-colors"
                />
              </label>

              <label className="field flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Số điện thoại</span>
                <input 
                  type="text"
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-transparent dark:text-white outline-none focus:border-blue-500 transition-colors"
                />
              </label>

              <label className="field flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ngày sinh</span>
                <input 
                  type="date" 
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-transparent dark:text-white outline-none focus:border-blue-500 transition-colors"
                />
              </label>

              <label className="field flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Giới tính</span>
                <select 
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-transparent dark:text-white outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </label>
            </div>

            <div className="profile-actions-row flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Đặt lại
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>

            {saved && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={16} />
                Đã lưu thông tin cá nhân thành công.
              </div>
            )}
          </form>
        </div>

        {/* NKS E-Card Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="text-blue-600" size={20} />
              Thẻ NKS E-Card
            </h2>

            {hasEcard ? (
              <div className="flex flex-col gap-4">
                {/* 3D Glassmorphic Card View */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-lg aspect-[1.586/1] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 pointer-events-none"></div>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-indigo-100 font-semibold">NKS Member Card</p>
                      <h3 className="font-bold text-lg mt-1 tracking-wide">PCHUB COLLABORATION</h3>
                    </div>
                    {ecardDetails?.avatar ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/30">
                        <img 
                          src={ecardDetails.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <Shield size={20} />
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-indigo-100/80">Chủ thẻ</p>
                      <p className="font-bold text-base tracking-wide uppercase mt-0.5">{ecardDetails?.name || user?.name || 'MEMBER'}</p>
                      <p className="text-[10px] text-indigo-200 mt-2 font-mono">{ecardDetails?.email || user?.email}</p>
                      {ecardDetails?.phone && (
                        <p className="text-[10px] text-indigo-200 mt-1 font-mono">{ecardDetails.phone}</p>
                      )}
                    </div>
                    <div className="bg-white p-1.5 rounded-lg flex items-center justify-center shadow-md">
                      <QrCode size={40} className="text-gray-900" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <span className="text-gray-500">Trạng thái thẻ:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Đã kết nối
                    </span>
                  </div>
                  
                  <a 
                    href="/ecard" 
                    className="w-full mt-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    Quản lý thông tin Ecard
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                  <CreditCard size={32} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Chưa kết nối Thẻ E-Card</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[220px]">
                    Kết nối tài khoản NKS để nhận thẻ thành viên điện tử và nhiều ưu đãi đặc quyền.
                  </p>
                </div>
                
                <a 
                  href="/ecard" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all mt-2"
                >
                  Kết nối ngay
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}