import { NextResponse } from 'next/server';
import { fetchSbuyWooCommerceReviews, createSbuyWooCommerceReview } from '@/lib/sbuy';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const reviews = await fetchSbuyWooCommerceReviews(productId || undefined);
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews API:', error);
    return NextResponse.json({ success: false, reviews: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, reviewer, reviewerEmail, review, rating = 5 } = body;

    if (!productId || !review || !reviewer || !reviewerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng điền đầy đủ Họ tên, Email và Nội dung đánh giá!'
      }, { status: 400 });
    }

    const result = await createSbuyWooCommerceReview({
      product_id: Number(productId),
      reviewer: String(reviewer).trim(),
      reviewer_email: String(reviewerEmail).trim(),
      review: String(review).trim(),
      rating: Number(rating) || 5
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        review: result.review,
        message: 'Gửi đánh giá thành công! Đã đồng bộ lên WooCommerce.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Không thể gửi đánh giá lên WooCommerce'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error posting review API:', error);
    return NextResponse.json({
      success: false,
      error: 'Lỗi gửi đánh giá. Vui lòng thử lại sau.'
    }, { status: 500 });
  }
}
