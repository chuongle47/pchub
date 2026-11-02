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
    const supabase = await createClient();

    const { data: b } = await supabase
      .from('community_builds')
      .select('likes')
      .eq('id', id)
      .maybeSingle();

    let newLikes = (b?.likes || 0) + 1;

    if (b) {
      await supabase
        .from('community_builds')
        .update({ likes: newLikes })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      likes: newLikes,
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
