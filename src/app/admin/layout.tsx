import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'PCHub Admin Dashboard',
  description: 'Hệ thống quản trị bán lẻ linh kiện máy tính và build PC PCHub',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', user.id)
        .single();
      profile = data;
    }
  } catch {}

  if (!profile) {
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get('pchub_admin_session')?.value;
    if (adminSessionCookie) {
      try {
        const session = JSON.parse(adminSessionCookie);
        profile = {
          id: session.id || 'admin-root',
          email: session.email || 'admin@pchub.vn',
          full_name: session.full_name || 'Quản Trị Viên PCHub',
          role: session.role || 'admin',
          avatar_url: null,
        };
      } catch {}
    }
  }

  return <AdminShell userProfile={profile}>{children}</AdminShell>;
}
