'use client';

import React, { FormEvent, useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { CreditCard, QrCode, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveUserToDatabase } from '@/lib/user-service';

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

  // Extract NKS user data for card display
  const nksUser = (user as any)?.user || user;
  const cardName = nksUser?.name || user?.name || 'MEMBER';
  const cardAvatar = nksUser?.avatar || null;
  const cardDob = nksUser?.dob ? new Date(nksUser.dob).toLocaleDateString('vi-VN') : '17/08/2004';
  const cardPob = nksUser?.pob || 'Xuân Thọ, Triệu Sơn, Thanh Hóa';
  const cardGender = nksUser?.gender !== undefined ? (nksUser.gender === 0 ? 'Nam' : nksUser.gender === 1 ? 'Nữ' : 'Khác') : 'Nam';
  const memberId = nksUser?.id_number || '0702 **** 1704';
  const joinDate = nksUser?.created_at ? new Date(nksUser.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : 'Tháng 06/2026';

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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
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

    // Save to Supabase database
    if (email) {
      await saveUserToDatabase({
        email,
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        phone,
        dob: birthday,
        gender
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="profile-page">
      <div className="profile-header-row mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h1>
        <p className="text-gray-500 text-sm">Quản lý và cập nhật thông tin tài khoản của bạn</p>
      </div>

      <div className="max-w-4xl">
        {/* Profile Edit Form */}
        <div>
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
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
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

              <label className="field flex flex-col gap-1.5 md:col-span-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ngày sinh</span>
                <input 
                  type="date" 
                  value={birthday} 
                  onChange={e => setBirthday(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-transparent dark:text-white outline-none focus:border-blue-500 transition-colors"
                />
              </label>
            </div>

            <div className="form-actions mt-6 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
      </div>
    </div>
  );
}