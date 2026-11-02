import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status = body?.status || 'approved';

    const supabase = await createClient();
    await supabase
      .from('community_builds')
      .update({ status })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      id,
      status,
      message: status === 'approved' ? 'Đã duyệt cấu hình thành công!' : 'Đã từ chối cấu hình.',
    });
  } catch (error) {
    console.error('[MODERATE API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật trạng thái kiểm duyệt.' },
      { status: 500 }
    );
  }
}
