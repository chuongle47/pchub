'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateCustomerRoleAction(userId: string, role: 'customer' | 'admin' | 'manager' | 'editor' | 'support') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Chua dang nh?p');

  // Use admin client to ensure role update permissions
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/customers');
  return { success: true };
}

export async function updateCustomerAction(
  userId: string,
  data: { full_name?: string; phone?: string; address?: string }
) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/customers');
  return { success: true };
}
