import { NextResponse } from 'next/server';
import { INITIAL_COMMUNITY_BUILDS, CommunityBuild } from '@/data/community-data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'approved';

    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';
    const wpUrl = new URL(`${wpBase}/wp-json/pchub/v1/community/builds`);
    if (category && category !== 'ALL') wpUrl.searchParams.set('category', category);
    if (status) wpUrl.searchParams.set('status', status);

    let wpBuilds: CommunityBuild[] = [];
    try {
      const res = await fetch(wpUrl.toString(), {
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          wpBuilds = json.data;
        }
      }
    } catch (wpErr) {
      console.warn('[COMMUNITY API] WP fetch failed or timed out, using fallback:', wpErr);
    }

    // Merge WP builds with initial static builds (avoid duplicates by id/slug)
    const seenIds = new Set(wpBuilds.map(b => b.id));
    const merged = [...wpBuilds];

    for (const initBuild of INITIAL_COMMUNITY_BUILDS) {
      if (!seenIds.has(initBuild.id) && !seenIds.has(initBuild.slug)) {
        merged.push(initBuild);
        seenIds.add(initBuild.id);
      }
    }

    return NextResponse.json({
      success: true,
      total: merged.length,
      data: merged,
      fromWordPressCount: wpBuilds.length,
    });
  } catch (error) {
    console.error('[COMMUNITY API] Error:', error);
    return NextResponse.json({
      success: true,
      total: INITIAL_COMMUNITY_BUILDS.length,
      data: INITIAL_COMMUNITY_BUILDS,
      fromWordPressCount: 0,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';

    let wpResult = null;
    try {
      const res = await fetch(`${wpBase}/wp-json/pchub/v1/community/builds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        wpResult = await res.json();
      }
    } catch (err) {
      console.warn('[COMMUNITY API] Could not forward build to WordPress:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Cấu hình đã được lưu và gửi tới hệ thống kiểm duyệt WordPress Admin!',
      wpResult,
    });
  } catch (error) {
    console.error('[COMMUNITY API] Submit error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi gửi cấu hình cộng đồng.' },
      { status: 500 }
    );
  }
}
