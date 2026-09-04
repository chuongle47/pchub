'use client';

import React, { FormEvent, useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { 
  CheckCircle2, 
  AlertCircle,
  UserRound, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  Save, 
  RotateCcw,
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  CreditCard,
  Upload,
  ShieldCheck,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { CompanyApiService, getNksToken } from '@/lib/auth-api';
import { saveUserToDatabase } from '@/lib/user-service';

type ActiveTab = 'info' | 'password' | 'avatar' | 'cccd';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

export default function ProfilePage() {
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');

  // Alert State
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // --- 1. Tab Update Info ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('Nam');

  // --- 2. Tab Update Pass ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // --- 3. Tab Update Avatar ---
  const [avatarUrl, setAvatarUrl] = useState('');

  // --- 4. Tab Update CCCD ---
  const [cccdNumber, setCccdNumber] = useState('');
  const [cccdIssueDate, setCccdIssueDate] = useState('');
  const [cccdIssuePlace, setCccdIssuePlace] = useState('');
  const [cccdFrontImage, setCccdFrontImage] = useState('');
  const [cccdBackImage, setCccdBackImage] = useState('');

  // Initialize data on mount / user change
  useEffect(() => {
    if (user) {
      const nksUser = (user as any).user || user;
      
      // Name
      if (nksUser.firstname || nksUser.lastname) {
        setFirstName(nksUser.firstname || '');
        setLastName(nksUser.lastname || '');
      } else {
        const fullName = user.name ?? 'Khách hàng';
        const nameParts = fullName.trim().split(/\s+/);
        const first = nameParts.slice(0, -1).join(' ') || fullName;
        const last = nameParts.at(-1) || '';
        setFirstName(first);
        setLastName(last);
      }
      
      // Email & Phone
      setEmail(nksUser.email ?? user.email ?? '');
      setPhone(nksUser.phone ?? user.phone ?? '');
      
      // Birthday
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
      
      // Gender
      if (nksUser.gender !== undefined) {
        const genderMap: Record<number | string, string> = { 0: 'Nam', 1: 'Nữ', 2: 'Khác', 'Nam': 'Nam', 'Nữ': 'Nữ', 'Khác': 'Khác' };
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

      // Avatar
      setAvatarUrl(nksUser.avatar || user.avatar || '');

      // CCCD
      setCccdNumber(nksUser.cccd || user.cccd || '');
      setCccdIssueDate(nksUser.cccd_issue_date || user.cccd_issue_date || '');
      setCccdIssuePlace(nksUser.cccd_issue_place || user.cccd_issue_place || '');
      setCccdFrontImage(nksUser.cccd_front_image || user.cccd_front_image || '');
      setCccdBackImage(nksUser.cccd_back_image || user.cccd_back_image || '');

      // Load extra CCCD from local storage if available
      try {
        const savedCccd = localStorage.getItem('pchub-cccd-extra');
        if (savedCccd) {
          const extra = JSON.parse(savedCccd);
          if (!cccdNumber && extra.cccd) setCccdNumber(extra.cccd);
          if (!cccdIssueDate && extra.issue_date) setCccdIssueDate(extra.issue_date);
          if (!cccdIssuePlace && extra.issue_place) setCccdIssuePlace(extra.issue_place);
          if (!cccdFrontImage && extra.front_image) setCccdFrontImage(extra.front_image);
          if (!cccdBackImage && extra.back_image) setCccdBackImage(extra.back_image);
        }
      } catch (e) {}
    }
  }, [user]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Helper to persist state updates locally
  const syncLocalUserState = (updatedFields: Partial<typeof user>) => {
    if (!user) return;
    const newProfile = { ...user, ...updatedFields };
    setUser(newProfile as any);
    document.cookie = `pchub-user=${encodeURIComponent(JSON.stringify(newProfile))}; path=/; max-age=2592000; SameSite=Lax`;
  };

  // --- SUBMIT 1: nks/user/updateInfo ---
  const handleUpdateInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    const token = getNksToken();
    const fullName = `${firstName} ${lastName}`.trim();
    const genderMap: Record<string, number> = { 'Nam': 0, 'Nữ': 1, 'Khác': 2 };

    const payload = {
      firstname: firstName,
      lastname: lastName,
      name: fullName,
      phone,
      email,
      dob: birthday,
      gender: genderMap[gender] ?? 0,
    };

    // Call NKS API: nks/user/updateInfo
    const res = await CompanyApiService.updateInfo(token, payload);

    if (res.success) {
      syncLocalUserState({
        name: fullName,
        firstname: firstName,
        lastname: lastName,
        phone,
        email,
        dob: birthday,
        gender: genderMap[gender] ?? 0,
      });

      localStorage.setItem('pchub-profile-extra', JSON.stringify({ birthday, gender }));

      if (email) {
        await saveUserToDatabase({
          email,
          name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone,
          dob: birthday,
          gender,
        });
      }

      // Try fetching updated profile directly from NKS
      if (token) {
        const freshProfile = await CompanyApiService.getProfile(token);
        if (freshProfile.success && freshProfile.user) {
          syncLocalUserState(freshProfile.user);
        }
      }

      showNotification('success', res.message || 'Cập nhật thông tin tài khoản thành công!');
    } else {
      showNotification('error', res.message || 'Cập nhật thông tin thất bại từ máy chủ NKS.');
    }
    setLoading(false);
  };

  // --- SUBMIT 2: nks/user/updatePass ---
  const handleUpdatePass = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!oldPassword) {
      showNotification('error', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showNotification('error', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', 'Mật khẩu mới và nhập lại mật khẩu không trùng khớp.');
      return;
    }

    setLoading(true);
    const token = getNksToken();

    const payload = {
      old_password: oldPassword,
      password: newPassword,
    };

    // Call NKS API: nks/user/updatePass
    const res = await CompanyApiService.updatePass(token, payload);

    if (res.success) {
      showNotification('success', res.message || 'Cập nhật mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showNotification('error', res.message || 'Cập nhật mật khẩu thất bại.');
    }
    setLoading(false);
  };

  // --- SUBMIT 3: nks/user/updateAvatar ---
  const handleUpdateAvatar = async (e: FormEvent) => {
    e.preventDefault();
    if (!avatarUrl) {
      showNotification('error', 'Vui lòng chọn hoặc dán đường dẫn ảnh đại diện.');
      return;
    }

    setLoading(true);
    setMessage(null);
    const token = getNksToken();

    // Call NKS API: nks/user/updateAvatar (avatar parameter receives Base64 or image string)
    const res = await CompanyApiService.updateAvatar(token, avatarUrl);

    if (res.success) {
      syncLocalUserState({ avatar: avatarUrl });

      if (user?.email) {
        await saveUserToDatabase({
          email: user.email,
          avatar_url: avatarUrl,
        });
      }

      showNotification('success', res.message || 'Cập nhật avatar thành công!');
    } else {
      showNotification('error', res.message || 'Cập nhật avatar thất bại từ máy chủ NKS.');
    }
    setLoading(false);
  };

  // File Upload Helper for Avatar
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- SUBMIT 4: nks/user/updateCccd ---
  const handleUpdateCccd = async (e: FormEvent) => {
    e.preventDefault();
    if (!cccdNumber) {
      showNotification('error', 'Vui lòng nhập số CCCD / CMND.');
      return;
    }

    setLoading(true);
    setMessage(null);
    const token = getNksToken();

    // Match exact NKS API Spec: front, back, number, date, place
    const payload = {
      front: cccdFrontImage,
      back: cccdBackImage,
      number: cccdNumber,
      date: cccdIssueDate,
      place: cccdIssuePlace,
    };

    // Call NKS API: nks/user/updateCccd
    const res = await CompanyApiService.updateCccd(token, payload);

    if (res.success) {
      syncLocalUserState({
        cccd: cccdNumber,
        cccd_issue_date: cccdIssueDate,
        cccd_issue_place: cccdIssuePlace,
        cccd_front_image: cccdFrontImage,
        cccd_back_image: cccdBackImage,
      });

      localStorage.setItem('pchub-cccd-extra', JSON.stringify(payload));

      if (user?.email) {
        await saveUserToDatabase({
          email: user.email,
          cccd: cccdNumber,
          cccd_issue_date: cccdIssueDate,
          cccd_issue_place: cccdIssuePlace,
          cccd_front_image: cccdFrontImage,
          cccd_back_image: cccdBackImage,
        });
      }

      showNotification('success', res.message || 'Cập nhật CCCD thành công!');
    } else {
      showNotification('error', res.message || 'Cập nhật CCCD thất bại từ máy chủ NKS.');
    }
    setLoading(false);
  };

  // CCCD File Upload Helpers
  const handleCccdFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setCccdFrontImage(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCccdBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setCccdBackImage(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetInfo = () => {
    if (user) {
      const nksUser = (user as any).user || user;
      if (nksUser.firstname || nksUser.lastname) {
        setFirstName(nksUser.firstname || '');
        setLastName(nksUser.lastname || '');
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
        const genderMap: Record<number | string, string> = { 0: 'Nam', 1: 'Nữ', 2: 'Khác', 'Nam': 'Nam', 'Nữ': 'Nữ', 'Khác': 'Khác' };
        setGender(genderMap[nksUser.gender] || 'Nam');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Thông tin cá nhân</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
          Quản lý tài khoản, cập nhật mật khẩu, ảnh đại diện và thông tin Căn cước công dân (CCCD)
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '2px',
        overflowX: 'auto',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'info' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'info' ? '#eff6ff' : 'transparent',
            color: activeTab === 'info' ? '#2563eb' : '#64748b',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <UserRound size={16} />
          <span>Thông tin tài khoản</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'password' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'password' ? '#eff6ff' : 'transparent',
            color: activeTab === 'password' ? '#2563eb' : '#64748b',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <KeyRound size={16} />
          <span>Đổi mật khẩu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('avatar')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'avatar' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'avatar' ? '#eff6ff' : 'transparent',
            color: activeTab === 'avatar' ? '#2563eb' : '#64748b',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Camera size={16} />
          <span>Cập nhật Avatar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cccd')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'cccd' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'cccd' ? '#eff6ff' : 'transparent',
            color: activeTab === 'cccd' ? '#2563eb' : '#64748b',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <CreditCard size={16} />
          <span>Cập nhật CCCD</span>
        </button>
      </div>

      {/* Global Alert */}
      {message && (
        <div style={{
          padding: '14px 18px',
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#065f46' : '#dc2626',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#dc2626" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Container Content */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        
        {/* ================= TAB 1: UPDATE INFO (nks/user/updateInfo) ================= */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <UserRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cập nhật thông tin tài khoản</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* First name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserRound size={15} color="#2563eb" /> Họ & Tên đệm (First Name)
                </label>
                <input 
                  type="text"
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn"
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
                  <UserRound size={15} color="#2563eb" /> Tên (Last Name)
                </label>
                <input 
                  type="text"
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Ví dụ: An"
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
                  placeholder="email@domain.com"
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
                  placeholder="0912345678"
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
                onClick={handleResetInfo}
                disabled={loading}
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
                disabled={loading}
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                <Save size={15} /> {loading ? 'Đang lưu...' : 'Cập nhật thông tin tài khoản'}
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 2: UPDATE PASS (nks/user/updatePass) ================= */}
        {activeTab === 'password' && (
          <form onSubmit={handleUpdatePass} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cập nhật mật khẩu tài khoản</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '520px' }}>
              
              {/* Old Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Mật khẩu hiện tại
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword} 
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đang sử dụng"
                    required
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Mật khẩu mới
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Xác nhận mật khẩu mới
                </label>
                <input 
                  type="password"
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
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
              justifyContent: 'flex-start',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              marginTop: '8px',
            }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 24px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                <KeyRound size={15} /> {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 3: UPDATE AVATAR (nks/user/updateAvatar) ================= */}
        {activeTab === 'avatar' && (
          <form onSubmit={handleUpdateAvatar} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <Camera size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cập nhật Ảnh đại diện (Avatar)</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
              {/* Preview Circle */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  border: '4px solid #3b82f6',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserRound size={60} color="#94a3b8" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload"
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    background: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                  title="Tải ảnh lên từ thiết bị"
                >
                  <Upload size={18} />
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarFileUpload} 
                  style={{ display: 'none' }}
                />
              </div>

              <span style={{ fontSize: '12.5px', color: '#64748b', textAlign: 'center' }}>
                Hỗ trợ định dạng JPG, PNG, WEBP (tối đa 5MB)
              </span>
            </div>



            {/* Manual URL Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                Đường dẫn Avatar (URL)
              </label>
              <input 
                type="url"
                value={avatarUrl} 
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
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

            {/* Submit */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
            }}>
              <button 
                type="submit" 
                disabled={loading}
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                <Save size={15} /> {loading ? 'Đang lưu...' : 'Lưu Avatar'}
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 4: UPDATE CCCD (nks/user/updateCccd) ================= */}
        {activeTab === 'cccd' && (
          <form onSubmit={handleUpdateCccd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <CreditCard size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cập nhật Căn cước công dân (CCCD)</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* CCCD Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color="#2563eb" /> Số CCCD / Định danh cá nhân (12 chữ số)
                </label>
                <input 
                  type="text"
                  value={cccdNumber} 
                  onChange={e => setCccdNumber(e.target.value)}
                  placeholder="Ví dụ: 001200012345"
                  maxLength={12}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Issue Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="#2563eb" /> Ngày cấp
                </label>
                <input 
                  type="date"
                  value={cccdIssueDate} 
                  onChange={e => setCccdIssueDate(e.target.value)}
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

              {/* Issue Place */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck2 size={15} color="#2563eb" /> Nơi cấp
                </label>
                <input 
                  type="text"
                  value={cccdIssuePlace} 
                  onChange={e => setCccdIssuePlace(e.target.value)}
                  placeholder="Cục Cảnh sát Quản lý hành chính về trật tự xã hội"
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

              {/* Front Image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Ảnh mặt trước CCCD
                </label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '140px',
                  position: 'relative',
                }}>
                  {cccdFrontImage ? (
                    <img src={cccdFrontImage} alt="Mặt trước CCCD" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <Upload size={24} color="#94a3b8" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Tải ảnh mặt trước</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCccdFrontUpload}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              </div>

              {/* Back Image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Ảnh mặt sau CCCD
                </label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '140px',
                  position: 'relative',
                }}>
                  {cccdBackImage ? (
                    <img src={cccdBackImage} alt="Mặt sau CCCD" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <Upload size={24} color="#94a3b8" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Tải ảnh mặt sau</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCccdBackUpload}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
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
                type="submit" 
                disabled={loading}
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                <Save size={15} /> {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin CCCD'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}