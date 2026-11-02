'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface GeneralSettingsData {
  store_name: string;
  hotline: string;
  zalo: string;
  email: string;
  address: string;
  opening_hours: string;
  logo_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  maintenance_mode?: boolean;
}

export interface SeoSettingsData {
  site_title: string;
  site_description: string;
  keywords: string;
  og_image_url?: string;
}

export async function updateGeneralSettingsAction(data: GeneralSettingsData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('settings').upsert({
    key: 'general',
    value: data,
    description: 'Thông tin liên hệ, nhận diện và chế độ hoạt động',
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  // Record audit log
  await supabase.from('audit_logs').insert({
    actor_id: user?.id || null,
    action: 'UPDATE_SETTINGS',
    entity: 'settings',
    entity_id: 'general',
    diff: data,
  });

  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function updateSeoSettingsAction(data: SeoSettingsData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('settings').upsert({
    key: 'seo',
    value: data,
    description: 'Cấu hình thẻ tiêu đề, mô tả và chia sẻ mạng xã hội mặc định',
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  // Record audit log
  await supabase.from('audit_logs').insert({
    actor_id: user?.id || null,
    action: 'UPDATE_SETTINGS',
    entity: 'settings',
    entity_id: 'seo',
    diff: data,
  });

  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function addStaffRoleAction(email: string, role: 'admin' | 'manager' | 'editor' | 'support') {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const adminSupabase = createAdminClient();

  // Find user by email in profiles
  const { data: profile, error: pError } = await adminSupabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (pError || !profile) {
    throw new Error(`Không tìm thấy tài khoản người dùng có email: ${email}. Người dùng cần đăng ký tài khoản trước.`);
  }

  const { error: uError } = await adminSupabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', profile.id);

  if (uError) throw new Error(uError.message);

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id: currentUser?.id || null,
    action: 'ASSIGN_STAFF_ROLE',
    entity: 'profiles',
    entity_id: profile.id,
    diff: { email, previous_role: profile.role, new_role: role },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/admin/customers');
  return { success: true, profile };
}

export async function revokeStaffRoleAction(userId: string) {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from('profiles')
    .update({ role: 'customer', updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id: currentUser?.id || null,
    action: 'REVOKE_STAFF_ROLE',
    entity: 'profiles',
    entity_id: userId,
    diff: { new_role: 'customer' },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/admin/customers');
  return { success: true };
}

export async function clearOldAuditLogsAction(olderThanDays: number = 90) {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from('audit_logs').delete().lt('created_at', cutoff);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/audit-logs');
  return { success: true };
}