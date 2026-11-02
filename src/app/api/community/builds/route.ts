import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_COMMUNITY_BUILDS } from '@/data/community-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'approved';

    const supabase = await createClient();

    let query = supabase
      .from('community_builds')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: dbBuilds, error } = await query;

    if (!error && dbBuilds && dbBuilds.length > 0) {
      const builds = dbBuilds.map((b: any) => ({
        id: b.id,
        title: b.title,
        description: b.description || '',
        author: b.author_name || 'Thành viên PCHub',
        totalPrice: Number(b.total_price || 0),
        components: b.items || [],
        likes: b.likes || 0,
        views: b.views || 0,
        status: b.status,
        date: new Date(b.created_at).toLocaleDateString('vi-VN'),
        createdAt: b.created_at,
      }));

      return NextResponse.json({
        success: true,
        total: builds.length,
        data: builds,
      });
    }

    // Fallback: nếu DB chưa có bản ghi thì dùng cấu hình mẫu
    return NextResponse.json({
      success: true,
      total: INITIAL_COMMUNITY_BUILDS.length,
      data: INITIAL_COMMUNITY_BUILDS,
    });
  } catch (error: any) {
    console.error('[COMMUNITY API] Error:', error);
    return NextResponse.json({
      success: true,
      total: INITIAL_COMMUNITY_BUILDS.length,
      data: INITIAL_COMMUNITY_BUILDS,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, author, totalPrice, components, items } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập tên cấu hình' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const buildItems = items || components || [];

    const { data: newBuild, error } = await supabase
      .from('community_builds')
      .insert({
        user_id: user?.id || null,
        author_name: author || user?.user_metadata?.full_name || 'Khách hàng',
        title: title.trim(),
        description: description ? description.trim() : '',
        items: buildItems,
        total_price: Number(totalPrice || 0),
        status: 'approved', // Cho phép hiển thị ngay
        likes: 1,
        views: 1,
      })
      .select('id, title, created_at')
      .single();

    if (error) {
      console.error('Lỗi lưu community build Supabase:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng cấu hình thành công!',
      data: newBuild,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
