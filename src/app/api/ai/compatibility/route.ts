import { NextRequest, NextResponse } from 'next/server';
import { analyzeBuildCompatibility, ComponentItem } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const components: ComponentItem[] = Array.isArray(body?.components) ? body.components : [];

    const report = await analyzeBuildCompatibility(components);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/compatibility:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Lỗi xử lý phân tích tương thích AI',
      },
      { status: 500 }
    );
  }
}
