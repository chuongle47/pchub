import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';

    const res = await fetch(`${wpBase}/wp-json/pchub/v1/community/builds/${encodeURIComponent(id)}/comments`, {
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
    return NextResponse.json({ success: true, data: [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';

    let wpComment = null;
    try {
      const res = await fetch(`${wpBase}/wp-json/pchub/v1/community/builds/${encodeURIComponent(id)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        wpComment = await res.json();
      }
    } catch (err) {
      console.warn('[COMMUNITY COMMENT API] Forward to WP failed:', err);
    }

    return NextResponse.json({
      success: true,
      data: wpComment?.data || {
        id: `cmt-${Date.now()}`,
        buildId: id,
        user: body.user,
        content: body.content,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi gửi bình luận' }, { status: 500 });
  }
}
