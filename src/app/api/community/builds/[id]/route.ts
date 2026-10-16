import { NextResponse } from 'next/server';
import { INITIAL_COMMUNITY_BUILDS, CommunityBuild } from '@/data/community-data';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';

    // 1. Try fetching directly from WordPress REST API
    try {
      const res = await fetch(`${wpBase}/wp-json/pchub/v1/community/builds/${encodeURIComponent(id)}`, {
        next: { revalidate: 15 },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return NextResponse.json({
            success: true,
            source: 'wordpress',
            data: json.data,
          });
        }
      }
    } catch (wpErr) {
      console.warn('[COMMUNITY DETAIL API] WP fetch error:', wpErr);
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
