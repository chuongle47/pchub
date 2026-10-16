import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';
    let wpLikes = null;

    try {
      const res = await fetch(`${wpBase}/wp-json/pchub/v1/community/builds/${encodeURIComponent(id)}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        wpLikes = json.likes;
      }
    } catch (err) {
      console.warn('[COMMUNITY LIKE API] Forward to WP failed:', err);
    }

    return NextResponse.json({
      success: true,
      likes: wpLikes,
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
