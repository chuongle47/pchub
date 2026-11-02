import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');

    const supabase = await createClient();

    let query = supabase
      .from('posts')
      .select('id, slug, title, excerpt, content, cover_url, type, status, published_at, created_at, author:profiles!author_id(full_name, avatar_url)')
      .eq('status', 'published');

    if (slug) {
      query = query.eq('slug', slug);
      const { data: post, error } = await query.maybeSingle();
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, post });
    }

    if (type) {
      query = query.eq('type', type);
    }

    query = query.order('published_at', { ascending: false }).limit(limit);

    const { data: posts, error } = await query;

    if (error) {
      console.error('Lỗi lấy bài viết posts Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

