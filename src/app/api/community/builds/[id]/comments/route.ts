import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    return NextResponse.json({
      success: true,
      data: {
        id: `cmt-${Date.now()}`,
        buildId: id,
        user: body.user || { name: 'Thành viên PCHub' },
        content: body.content,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi gửi bình luận' }, { status: 500 });
  }
}
