import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_COMMUNITY_BUILDS } from '@/data/community-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Tìm trong Supabase community_builds
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from('community_builds').select('*');
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('id', id);
    }

    const { data: b, error } = await query.maybeSingle();

    if (b) {
      // Tăng view bất đồng bộ
      supabase.from('community_builds').update({ views: (b.views || 0) + 1 }).eq('id', b.id).then();

      return NextResponse.json({
        success: true,
        source: 'supabase',
        data: {
          id: b.id,
          title: b.title,
          description: b.description || '',
          author: b.author_name || 'Thành viên PCHub',
          totalPrice: Number(b.total_price || 0),
          components: b.items || [],
          likes: b.likes || 0,
          views: (b.views || 0) + 1,
          status: b.status,
          date: new Date(b.created_at).toLocaleDateString('vi-VN'),
        },
      });
    }

    // 2. Fallback to local static builds
    const localBuild = INITIAL_COMMUNITY_BUILDS.find(b => b.id === id || b.slug === id);
    if (localBuild) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        data: localBuild,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Không tìm thấy cấu hình này.' },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi lấy chi tiết cấu hình.' },
      { status: 500 }
    );
  }
}
