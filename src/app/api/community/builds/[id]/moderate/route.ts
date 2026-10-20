import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status = body?.status || 'approved';

    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';
    let wpResponse = null;

    try {
      const res = await fetch(`${wpBase}/wp-json/pchub/v1/community/builds/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        wpResponse = await res.json();
      }
    } catch (wpErr) {
      console.warn('[MODERATE API] WP sync warning:', wpErr);
    }

    return NextResponse.json({
      success: true,
      id,
      status,
      message: status === 'approved' ? 'Đã duyệt cấu hình thành công!' : 'Đã từ chối cấu hình.',
      wpResponse,
    });
  } catch (error) {
    console.error('[MODERATE API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật trạng thái kiểm duyệt.' },
      { status: 500 }
    );
  }
}
