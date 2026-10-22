import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${wpBase}/wp-json/pchub/v1/flash-sale`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      next: { revalidate: 0 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { success: false, error: 'WP Flash Sale API returned non-200', products: [] },
      { status: res.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error fetching flash sale products', products: [] },
      { status: 500 }
    );
  }
}
