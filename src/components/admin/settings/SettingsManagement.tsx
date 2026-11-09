'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  Share2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  ExternalLink,
  Shield,
  UserPlus,
  Trash2,
  Store,
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';
import {
  GeneralSettingsData,
  SeoSettingsData,
  updateGeneralSettingsAction,
  updateSeoSettingsAction,
  addStaffRoleAction,
  revokeStaffRoleAction
} from '@/lib/actions/admin-settings';

export interface StaffMember {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'manager' | 'editor' | 'support' | 'customer';
  avatar_url: string | null;
  created_at?: string;
}

interface SettingsManagementProps {
  initialGeneral?: GeneralSettingsData;
  initialSeo?: SeoSettingsData;
  initialStaff?: StaffMember[];
}

export function SettingsManagement({
  initialGeneral,
  initialSeo,
  initialStaff = [],
}: SettingsManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'general';

  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'staff'>(
    tabParam === 'seo' || tabParam === 'staff' ? tabParam : 'general'
  );

  const [generalForm, setGeneralForm] = useState<GeneralSettingsData>({
    store_name: initialGeneral?.store_name || 'PCHub - High Performance PC Store',
    hotline: initialGeneral?.hotline || '1900 6868',
    zalo: initialGeneral?.zalo || '0988 888 888',
    email: initialGeneral?.email || 'support@pchub.vn',
    address: initialGeneral?.address || 'Tầng 5, Tòa nhà Tech Tower, Cầu Giấy, Hà Nội',
    opening_hours: initialGeneral?.opening_hours || '08:30 - 21:30 hàng ngày',
    logo_url: initialGeneral?.logo_url || '',
    facebook_url: initialGeneral?.facebook_url || 'https://facebook.com/pchub.vn',
    tiktok_url: initialGeneral?.tiktok_url || 'https://tiktok.com/@pchub.vn',
    youtube_url: initialGeneral?.youtube_url || 'https://youtube.com/@pchub-vn',
    maintenance_mode: Boolean(initialGeneral?.maintenance_mode),
  });

  const [seoForm, setSeoForm] = useState<SeoSettingsData>({
    site_title: initialSeo?.site_title || 'PCHub - Chuyên Linh Kiện PC & Build Máy Tính Chuyên Nghiệp',
    site_description: initialSeo?.site_description || 'Hệ thống bán lẻ linh kiện máy tính CPU, VGA, RAM, SSD chuyên nghiệp...',
    keywords: initialSeo?.keywords || 'build pc, linh kien may tinh, rtx 4090, pchub',
    og_image_url: initialSeo?.og_image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80',
  });

  const [staffList, setStaffList] = useState<StaffMember[]>(
    initialStaff.length > 0
      ? initialStaff
      : [
          { id: '1', full_name: 'Quản Trị Viên PCHub', email: 'admin@pchub.vn', role: 'admin', avatar_url: null },
          { id: '2', full_name: 'Quản Lý Cửa Hàng PCHub', email: 'manager@pchub.vn', role: 'manager', avatar_url: null },
          { id: '3', full_name: 'Nhân Viên Hỗ Trợ PCHub', email: 'support@pchub.vn', role: 'support', avatar_url: null },
        ]
  );

  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'admin' | 'manager' | 'editor' | 'support'>('support');

  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === 'general' || tabParam === 'seo' || tabParam === 'staff') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'general' | 'seo' | 'staff') => {
    setActiveTab(tab);
    router.push(`/admin/settings?tab=${tab}`, { scroll: false });
  };

  const handleSaveGeneral = () => {
    setErrorMessage(null);
    setSaveSuccess(null);
    startTransition(async () => {
      try {
        await updateGeneralSettingsAction(generalForm);
        setSaveSuccess('Đã lưu cấu hình thông tin cửa hàng thành công!');
        setTimeout(() => setSaveSuccess(null), 3000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi khi lưu cài đặt cửa hàng.');
      }
    });
  };

  const handleSaveSeo = () => {
    setErrorMessage(null);
    setSaveSuccess(null);
    startTransition(async () => {
      try {
        await updateSeoSettingsAction(seoForm);
        setSaveSuccess('Đã lưu cấu hình SEO & Meta thành công!');
        setTimeout(() => setSaveSuccess(null), 3000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi khi lưu cấu hình SEO.');
      }
    });
  };

  const handleAddStaff = () => {
    if (!newStaffEmail.trim()) return;
    setErrorMessage(null);
    setSaveSuccess(null);
    startTransition(async () => {
      try {
        const res = await addStaffRoleAction(newStaffEmail, newStaffRole);
        if (res.profile) {
          setStaffList((prev) => [
            {
              id: res.profile.id,
              full_name: res.profile.full_name,
              email: res.profile.email,
              role: res.profile.role as any,
              avatar_url: null,
            },
            ...prev.filter((p) => p.email !== newStaffEmail),
          ]);
        }
        setNewStaffEmail('');
        setSaveSuccess(`Đã phân quyền ${newStaffRole} cho ${newStaffEmail}!`);
        setTimeout(() => setSaveSuccess(null), 3000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi khi thêm nhân sự.');
      }
    });
  };

  const handleRevokeStaff = (userId: string, email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn thu hồi quyền quản trị của ${email}?`)) return;
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await revokeStaffRoleAction(userId);
        setStaffList((prev) => prev.filter((p) => p.id !== userId));
        setSaveSuccess(`Đã thu hồi quyền quản trị của ${email} thành công!`);
        setTimeout(() => setSaveSuccess(null), 3000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi khi thu hồi quyền.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cài đặt hệ thống</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                PCHUB RETAIL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình thương hiệu, tối ưu SEO tìm kiếm và phân quyền ban quản trị.
            </p>
          </div>
        </div>

        {/* Tab switcher & Primary Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => handleTabChange('general')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Cửa hàng</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('seo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'seo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>SEO & Meta</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('staff')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Nhân sự ({staffList.length})</span>
            </button>
          </div>

          {activeTab !== 'staff' && (
            <button
              type="button"
              onClick={activeTab === 'general' ? handleSaveGeneral : handleSaveSeo}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{activeTab === 'general' ? 'Lưu cài đặt cửa hàng' : 'Lưu cấu hình SEO'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-400 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <span className="text-[11px] text-emerald-400/70">Đồng bộ tức thì</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: THÔNG TIN CỬA HÀNG */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column (8 cols): Identity & Showroom */}
          <div className="lg:col-span-8 space-y-6">
            {/* Identity Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="p-2 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Nhận diện thương hiệu & Logo</h3>
                  <p className="text-xs text-slate-400">Hiển thị ở đầu trang, chân trang và tiêu đề hóa đơn</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tên thương hiệu cửa hàng *</label>
                  <input
                    type="text"
                    value={generalForm.store_name}
                    onChange={(e) => setGeneralForm({ ...generalForm, store_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Đường dẫn Logo cửa hàng (URL ảnh PNG / SVG)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {generalForm.logo_url ? (
                        <img src={generalForm.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">PC</div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={generalForm.logo_url || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, logo_url: e.target.value })}
                      placeholder="https://domain.com/logo.png"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Showroom Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="p-2 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/20">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kênh hỗ trợ & Địa chỉ Showroom</h3>
                  <p className="text-xs text-slate-400">Thông tin liên lạc tư vấn trực tiếp cho khách mua hàng</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tổng đài Hotline bán hàng *</span>
                  </label>
                  <input
                    type="text"
                    value={generalForm.hotline}
                    onChange={(e) => setGeneralForm({ ...generalForm, hotline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-blue-400">@</span>
                    <span>Số Zalo tư vấn kỹ thuật *</span>
                  </label>
                  <input
                    type="text"
                    value={generalForm.zalo}
                    onChange={(e) => setGeneralForm({ ...generalForm, zalo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Hòm thư tiếp nhận hỗ trợ *</span>
                  </label>
                  <input
                    type="email"
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Thời gian phục vụ *</span>
                  </label>
                  <input
                    type="text"
                    value={generalForm.opening_hours}
                    onChange={(e) => setGeneralForm({ ...generalForm, opening_hours: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Địa chỉ Showroom trưng bày *</span>
                </label>
                <input
                  type="text"
                  value={generalForm.address}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Side Column (4 cols): Operations & Social */}
          <div className="lg:col-span-4 space-y-6">
            {/* Maintenance Mode Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vận hành Storefront</h3>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-3">
                <div>
                  <div className="text-xs font-bold text-slate-200">Chế độ bảo trì hệ thống</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {generalForm.maintenance_mode ? 'Đang bật: Chỉ admin mới thấy web' : 'Đang tắt: Hoạt động bình thường'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneralForm({ ...generalForm, maintenance_mode: !generalForm.maintenance_mode })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    generalForm.maintenance_mode ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      generalForm.maintenance_mode ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                <span>Xem thử trang ngoài:</span>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Mở Storefront</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Social Channels Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Kênh Mạng Xã Hội</h3>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Fanpage Facebook</label>
                  <input
                    type="text"
                    value={generalForm.facebook_url || ''}
                    onChange={(e) => setGeneralForm({ ...generalForm, facebook_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kênh TikTok</label>
                  <input
                    type="text"
                    value={generalForm.tiktok_url || ''}
                    onChange={(e) => setGeneralForm({ ...generalForm, tiktok_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kênh YouTube</label>
                  <input
                    type="text"
                    value={generalForm.youtube_url || ''}
                    onChange={(e) => setGeneralForm({ ...generalForm, youtube_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveGeneral}
                disabled={isPending}
                className="w-full mt-5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu cài đặt cửa hàng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEO & META */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="p-2 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Thẻ Meta tiêu đề & Mô tả tìm kiếm</h3>
                  <p className="text-xs text-slate-400">Hiển thị khi người dùng tìm kiếm trên Google & Bing</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Tiêu đề SEO trang chủ (Meta Title) *</label>
                    <span className={`text-[11px] ${seoForm.site_title.length > 60 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {seoForm.site_title.length}/60 ký tự
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoForm.site_title}
                    onChange={(e) => setSeoForm({ ...seoForm, site_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Thẻ mô tả tìm kiếm (Meta Description) *</label>
                    <span className={`text-[11px] ${seoForm.site_description.length > 160 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {seoForm.site_description.length}/160 ký tự
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoForm.site_description}
                    onChange={(e) => setSeoForm({ ...seoForm, site_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Từ khóa tìm kiếm chính (cách nhau bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={seoForm.keywords}
                    onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Ảnh chia sẻ Facebook / Zalo (OpenGraph Image URL)</label>
                  <input
                    type="text"
                    value={seoForm.og_image_url || ''}
                    onChange={(e) => setSeoForm({ ...seoForm, og_image_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Previews Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Google Search Snippet Preview */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-white uppercase tracking-wider">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Mô phỏng kết quả Google Tìm Kiếm</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-sans space-y-1.5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                  <span>https://pchub.vn</span>
                  <span>›</span>
                  <span className="text-slate-500">trang-chu</span>
                </div>
                <div className="text-base font-semibold text-blue-400 hover:underline cursor-pointer line-clamp-1">
                  {seoForm.site_title || 'PCHub - High Performance PC Store'}
                </div>
                <div className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {seoForm.site_description || 'Hệ thống bán lẻ linh kiện máy tính CPU, VGA, RAM, SSD chuyên nghiệp...'}
                </div>
              </div>
            </div>

            {/* Social Media Card Preview */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-white uppercase tracking-wider">
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mô phỏng chia sẻ Facebook / Zalo</span>
              </div>
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                <div className="h-40 bg-slate-800 overflow-hidden">
                  <img
                    src={seoForm.og_image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80'}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">PCHUB.VN</div>
                  <div className="text-xs font-bold text-white line-clamp-1">{seoForm.site_title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{seoForm.site_description}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NHÂN SỰ & PHÂN QUYỀN */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Quick Invite Bar */}
          <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quản lý tài khoản Ban Quản Trị</h3>
              <p className="text-xs text-slate-400 mt-0.5">Phân quyền chặt chẽ theo vai trò (Role-Based Access Control - RBAC)</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="nhanvien@pchub.vn"
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="admin">Admin (Toàn quyền)</option>
                <option value="manager">Manager (Quản lý)</option>
                <option value="editor">Editor (Nội dung)</option>
                <option value="support">Support (CSKH)</option>
              </select>
              <button
                type="button"
                onClick={handleAddStaff}
                disabled={isPending || !newStaffEmail.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm nhân sự</span>
              </button>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Thành viên</th>
                    <th className="py-3 px-4">Vai trò quản trị</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {staffList.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-blue-600/20">
                            {(member.full_name || member.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">{member.full_name || 'Nhân sự PCHub'}</div>
                            <div className="text-[11px] text-slate-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                            member.role === 'admin'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : member.role === 'manager'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span className="capitalize">{member.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Đang hoạt động</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {member.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleRevokeStaff(member.id, member.email || '')}
                            disabled={isPending}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Thu hồi quyền quản trị"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Permissions Matrix Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin (Toàn quyền)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Quyền quản trị tối cao: cài đặt hệ thống, quản lý doanh thu, xem nhật ký kiểm toán (audit log) và phân quyền nhân viên.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Manager (Quản lý)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Quản lý kho hàng linh kiện, phê duyệt đơn hàng, xử lý báo giá PC build và thiết lập mã giảm giá khuyến mãi.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Editor (Biên tập)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Soạn thảo và đăng tải bài viết cẩm nang công nghệ, đánh giá linh kiện phần cứng và cập nhật thông tin giới thiệu.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-2">
                <Phone className="w-3.5 h-3.5" />
                <span>Support (CSKH)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tra cứu thông tin đơn hàng, tiếp nhận hòm thư hỗ trợ, phản hồi đánh giá của khách hàng và hỗ trợ kỹ thuật bảo hành.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
