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
    let wpFetched = false;
    try {
      const res = await fetch(wpUrl.toString(), {
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          wpBuilds = json.data.filter((b: CommunityBuild) => b.status === 'approved');
          wpFetched = true;
        }
      }
    } catch (wpErr) {
      console.warn('[COMMUNITY API] WP fetch failed or timed out:', wpErr);
    }

    // Chỉ trả về các cấu hình đã được Admin duyệt từ WordPress
    const finalBuilds = wpFetched ? wpBuilds : [];

    return NextResponse.json({
      success: true,
      total: finalBuilds.length,
      data: finalBuilds,
      fromWordPressCount: wpBuilds.length,
    });
  } catch (error) {
    console.error('[COMMUNITY API] Error:', error);
    return NextResponse.json({
      success: true,
      total: 0,
      data: [],
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
