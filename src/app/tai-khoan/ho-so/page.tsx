'use client';

import React, { FormEvent, useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { CheckCircle2, UserRound, Mail, Phone, Calendar, UserCheck, Save, RotateCcw } from 'lucide-react';
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

  // Sync initial user details from NKS API data
  useEffect(() => {
    if (user) {
      const nksUser = (user as any).user || user;
      
      if (nksUser.firstname && nksUser.lastname) {
        setFirstName(nksUser.firstname);
        setLastName(nksUser.lastname);
      } else {
        const fullName = user.name ?? 'Khách hàng';
        const nameParts = fullName.trim().split(/\s+/);
        const first = nameParts.slice(0, -1).join(' ') || fullName;
        const last = nameParts.at(-1) || '';
        setFirstName(first);
        setLastName(last);
      }
      
      setEmail(nksUser.email ?? user.email ?? '');
      setPhone(nksUser.phone ?? user.phone ?? '');
      
      if (nksUser.dob) {
        setBirthday(nksUser.dob);
      } else {
        try {
          const savedProfile = localStorage.getItem('pchub-profile-extra');
          if (savedProfile) {
            const extra = JSON.parse(savedProfile);
            if (extra.birthday) setBirthday(extra.birthday);
          }
        } catch (e) {}
      }
      
      if (nksUser.gender !== undefined) {
        const genderMap: Record<number, string> = { 0: 'Nam', 1: 'Nữ', 2: 'Khác' };
        setGender(genderMap[nksUser.gender] || 'Nam');
      } else {
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

  const handleReset = () => {
    if (user) {
      const nksUser = (user as any).user || user;
      if (nksUser.firstname && nksUser.lastname) {
        setFirstName(nksUser.firstname);
        setLastName(nksUser.lastname);
      } else {
        const fullName = user.name ?? 'Khách hàng';
        const nameParts = fullName.trim().split(/\s+/);
        setFirstName(nameParts.slice(0, -1).join(' ') || fullName);
        setLastName(nameParts.at(-1) || '');
      }
      setEmail(nksUser.email ?? user.email ?? '');
      setPhone(nksUser.phone ?? user.phone ?? '');
      if (nksUser.dob) setBirthday(nksUser.dob);
      if (nksUser.gender !== undefined) {
        const genderMap: Record<number, string> = { 0: 'Nam', 1: 'Nữ', 2: 'Khác' };
        setGender(genderMap[nksUser.gender] || 'Nam');
      }
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const fullName = `${firstName} ${lastName}`.trim();
    const nksUser = (user as any).user || user;
    const genderMap: Record<string, number> = { 'Nam': 0, 'Nữ': 1, 'Khác': 2 };
    
    const updatedUser = {
      ...user,
      name: fullName,
      email,
      phone,
      ...(nksUser.firstname && { firstname: firstName }),
      ...(nksUser.lastname && { lastname: lastName }),
      ...(nksUser.dob !== undefined && { dob: birthday }),
      ...(nksUser.gender !== undefined && { gender: genderMap[gender] || 0 })
    };

    setUser(updatedUser);
    document.cookie = `pchub-user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=2592000; SameSite=Lax`;
    localStorage.setItem('pchub-profile-extra', JSON.stringify({ birthday, gender }));

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Thông tin cá nhân</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và cập nhật thông tin hồ sơ tài khoản của bạn</p>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Đã lưu cập nhật thông tin cá nhân thành công!</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserRound size={14} className="text-blue-600" /> Họ & Tên đệm
              </span>
              <input 
                type="text"
                value={firstName} 
                onChange={e => setFirstName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 font-semibold text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserRound size={14} className="text-blue-600" /> Tên
              </span>
              <input 
                type="text"
                value={lastName} 
                onChange={e => setLastName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 font-semibold text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </label>

            <label className="block space-y-1.5 md:col-span-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail size={14} className="text-blue-600" /> Địa chỉ Email
              </span>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 font-semibold text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone size={14} className="text-blue-600" /> Số điện thoại
              </span>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 font-semibold text-xs font-mono outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck size={14} className="text-blue-600" /> Giới tính
              </span>
              <select 
                value={gender} 
                onChange={e => setGender(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 font-semibold text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="Nam" className="bg-white text-slate-900">Nam</option>
                <option value="Nữ" className="bg-white text-slate-900">Nữ</option>
                <option value="Khác" className="bg-white text-slate-900">Khác</option>
              </select>
            </label>

            <label className="block space-y-1.5 md:col-span-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600" /> Ngày sinh
              </span>
              <input 
                type="date" 
                value={birthday} 
                onChange={e => setBirthday(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 font-semibold text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-bold transition-all"
            >
              <RotateCcw size={14} /> Khôi phục
            </button>
            <button 
              type="submit" 
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
            >
              <Save size={14} /> Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}