import React from 'react';
import { createClient } from '@/lib/supabase/server';
import {
  SettingsManagement,
  StaffMember,
} from '@/components/admin/settings/SettingsManagement';
import { GeneralSettingsData, SeoSettingsData } from '@/lib/actions/admin-settings';

export const revalidate = 0;

export const metadata = {
  title: 'Cài đặt hệ thống | PCHub Admin',
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [{ data: settingsData }, { data: staffData }] = await Promise.all([
    supabase.from('settings').select('*').in('key', ['general', 'seo']),
    supabase
      .from('profiles')
      .select('id, email, full_name, role, avatar_url, created_at')
      .in('role', ['admin', 'manager', 'editor', 'support'])
      .order('created_at', { ascending: false }),
  ]);

  const generalRow = (settingsData || []).find((s) => s.key === 'general');
  const seoRow = (settingsData || []).find((s) => s.key === 'seo');

  const defaultGeneral: GeneralSettingsData = {
    store_name: 'PCHub - High Performance PC Store',
    hotline: '1900 6868',
    zalo: '0988 888 888',
    email: 'support@pchub.vn',
    address: 'Tầng 5, Tòa nhà Tech Tower, Cầu Giấy, Hà Nội',
    opening_hours: '08:30 - 21:30 hàng ngày',
    logo_url: '',
    facebook_url: 'https://facebook.com/pchub.vn',
    tiktok_url: 'https://tiktok.com/@pchub.vn',
    youtube_url: 'https://youtube.com/@pchub-vn',
    maintenance_mode: false,
  };

  const defaultSeo: SeoSettingsData = {
    site_title: 'PCHub - Chuyên Linh Kiện PC & Build Máy Tính Chuyên Nghiệp',
    site_description:
      'Cửa hàng linh kiện máy tính, build PC gaming, đồ họa chính hãng, kiểm tra tương thích AI thông minh, bảo hành tận tâm.',
    keywords: 'build pc, linh kiện máy tính, rtx 4090, ryzen 7, core i7, pchub',
    og_image_url: '',
  };

  return (
    <SettingsManagement
      initialGeneral={(generalRow?.value as GeneralSettingsData) || defaultGeneral}
      initialSeo={(seoRow?.value as SeoSettingsData) || defaultSeo}
      initialStaff={(staffData as StaffMember[]) || []}
    />
  );
}
