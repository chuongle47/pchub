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
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0
            }}>
              <CreditCard style={{ color: '#2563eb' }} size={20} />
              Thẻ NKS E-Card
            </h2>

            {hasEcard ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* NKS Real Estate Card Design */}
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3730a3 100%)',
                  padding: '20px',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <p style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#bfdbfe',
                        fontWeight: '600',
                        margin: 0
                      }}>BẤT ĐỘNG SẢN NKS</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#4ade80',
                          borderRadius: '50%'
                        }}></div>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#86efac'
                        }}>VERIFIED</span>
                      </div>
                    </div>
                    {cardAvatar ? (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}>
                        <img
                          src={cardAvatar}
                          alt="Avatar"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Shield size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <p style={{
                        fontSize: '10px',
                        color: '#bfdbfe',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        margin: '0 0 4px 0'
                      }}>Tên thành viên</p>
                      <p style={{
                        fontWeight: 'bold',
                        fontSize: '18px',
                        letterSpacing: '0.5px',
                        margin: 0
                      }}>{cardName}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <p style={{
                          fontSize: '9px',
                          color: '#bfdbfe',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          margin: '0 0 4px 0'
                        }}>Loại thành viên</p>
                        <p style={{ fontSize: '12px', fontWeight: '500', margin: 0 }}>THÀNH VIÊN TÌM KIẾM BĐS</p>
                      </div>
                      <div>
                        <p style={{
                          fontSize: '9px',
                          color: '#bfdbfe',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          margin: '0 0 4px 0'
                        }}>Giới tính</p>
                        <p style={{ fontSize: '12px', fontWeight: '500', margin: 0 }}>{cardGender}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <p style={{
                          fontSize: '9px',
                          color: '#bfdbfe',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          margin: '0 0 4px 0'
                        }}>Ngày sinh</p>
                        <p style={{ fontSize: '12px', fontWeight: '500', margin: 0 }}>{cardDob}</p>
                      </div>
                      <div>
                        <p style={{
                          fontSize: '9px',
                          color: '#bfdbfe',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          margin: '0 0 4px 0'
                        }}>Quê quán</p>
                        <p style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{cardPob}</p>
                      </div>
                    </div>

                    <div style={{
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{
                            fontSize: '9px',
                            color: '#bfdbfe',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            margin: '0 0 4px 0'
                          }}>Member ID</p>
                          <p style={{
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            margin: 0
                          }}>{memberId}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontSize: '9px',
                            color: '#bfdbfe',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            margin: '0 0 4px 0'
                          }}>Ngày tham gia</p>
                          <p style={{ fontSize: '12px', fontWeight: '500', margin: 0 }}>{joinDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      backgroundColor: '#22c55e',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={12} />
                      ĐÃ XÁC MINH
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Trạng thái thẻ:</span>
                    <span style={{
                      fontWeight: '600',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={14} /> Đã kết nối
                    </span>
                  </div>

                  <a
                    href="/ecard"
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: '16px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    }}
                  >
                    Quản lý thông tin Ecard
                  </a>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 0',
                textAlign: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}>
                  <CreditCard size={32} />
                </div>
                <div>
                  <p style={{
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: '0 0 4px 0'
                  }}>Chưa kết nối Thẻ E-Card</p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px',
                    maxWidth: '220px',
                    margin: '4px auto 0'
                  }}>
                    Kết nối tài khoản NKS để nhận thẻ thành viên điện tử và nhiều ưu đãi đặc quyền.
                  </p>
                </div>

                <a
                  href="/ecard"
                  style={{
                    display: 'block',
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '10px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    marginTop: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
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