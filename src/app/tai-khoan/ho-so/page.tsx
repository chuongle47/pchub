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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Thông tin cá nhân</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Quản lý và cập nhật thông tin hồ sơ tài khoản của bạn</p>
      </div>

      {saved && (
        <div style={{
          padding: '14px 18px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 700,
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>Đã lưu cập nhật thông tin cá nhân thành công!</span>
        </div>
      )}

      {/* Form Container */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* First name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserRound size={15} color="#2563eb" /> Họ & Tên đệm
              </label>
              <input 
                type="text"
                value={firstName} 
                onChange={e => setFirstName(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Last name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserRound size={15} color="#2563eb" /> Tên
              </label>
              <input 
                type="text"
                value={lastName} 
                onChange={e => setLastName(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} color="#2563eb" /> Địa chỉ Email
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} color="#2563eb" /> Số điện thoại
              </label>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            {/* Gender */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={15} color="#2563eb" /> Giới tính
              </label>
              <select 
                value={gender} 
                onChange={e => setGender(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Birthday */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#2563eb" /> Ngày sinh
              </label>
              <input 
                type="date" 
                value={birthday} 
                onChange={e => setBirthday(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            marginTop: '8px',
          }}>
            <button 
              type="button" 
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} /> Khôi phục
            </button>
            <button 
              type="submit" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 22px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}
            >
              <Save size={15} /> Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}