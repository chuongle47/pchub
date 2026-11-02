import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Lấy danh sách đánh giá của sản phẩm từ Supabase
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName') || undefined;

    if (!productId && !productName) {
      return NextResponse.json({ success: true, reviews: [] });
    }

    const supabase = await createClient();

    // 1. Xác định product UUID chính xác
    let resolvedProductId = productId;
    const isUuid = productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);

    if (!isUuid && productId) {
      // Tìm bằng slug hoặc sku
      const { data: p } = await supabase
        .from('products')
        .select('id')
        .or(`slug.eq.${productId},sku.eq.${productId}`)
        .maybeSingle();

      if (p) {
        resolvedProductId = p.id;
      }
    }

    if (!resolvedProductId && productName) {
      const { data: p } = await supabase
        .from('products')
        .select('id')
        .ilike('name', `%${productName}%`)
        .limit(1)
        .maybeSingle();

      if (p) {
        resolvedProductId = p.id;
      }
    }

    if (!resolvedProductId) {
      return NextResponse.json({ success: true, reviews: [] });
    }

    // 2. Lấy đánh giá đã được duyệt (status = 'approved') từ bảng reviews Supabase
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, content, customer_name, reply, created_at, status')
      .eq('product_id', resolvedProductId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi truy vấn reviews Supabase:', error.message);
      return NextResponse.json({ success: true, reviews: [] });
    }

    // Map sang format component ProductDetailView mong đợi
    const mapped = (reviews || []).map((r: any) => ({
      id: r.id,
      rating: r.rating,
      reviewer: r.customer_name || 'Khách hàng',
      review: r.content,
      date_created: r.created_at,
      reply: r.reply || null,
    }));

    return NextResponse.json({
      success: true,
      reviews: mapped,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Error fetching reviews API:', error);
    return NextResponse.json({ success: false, reviews: [], error: error.message }, { status: 500 });
  }
}

// POST: Người dùng gửi đánh giá mới lên Supabase (chờ Admin duyệt)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, reviewer, reviewerEmail, review, rating = 5 } = body;

    if (!productId || !review || !reviewer) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng điền đầy đủ Họ tên và Nội dung đánh giá!'
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Xác định UUID của sản phẩm
    let targetProductId = productId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    if (!isUuid) {
      const { data: prod } = await supabase
        .from('products')
        .select('id')
        .or(`slug.eq.${productId},sku.eq.${productId}`)
        .maybeSingle();

      if (prod) {
        targetProductId = prod.id;
      }
    }

    // Lấy thông tin user hiện tại nếu có đăng nhập
    const { data: { user } } = await supabase.auth.getUser();

    // Insert vào bảng reviews trên Supabase
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert({
        product_id: targetProductId,
        user_id: user?.id || null,
        customer_name: String(reviewer).trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        content: String(review).trim(),
        status: 'pending', // Mặc định chờ quản trị viên duyệt tại /admin/reviews
      })
      .select('id, rating, content, customer_name, created_at')
      .single();

    if (insertError) {
      console.error('Lỗi lưu review vào Supabase:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Không thể lưu đánh giá vào cơ sở dữ liệu. Vui lòng thử lại sau.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      review: {
        id: newReview.id,
        rating: newReview.rating,
        reviewer: newReview.customer_name,
        review: newReview.content,
        date_created: newReview.created_at,
      },
      message: 'Gửi đánh giá thành công! Đánh giá của bạn đang được kiểm duyệt và sẽ hiển thị sau khi được phê duyệt.'
    });

  } catch (error: any) {
    console.error('Error posting review API:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Có lỗi xảy ra khi gửi đánh giá'
    }, { status: 500 });
  }
}
