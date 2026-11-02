import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ReviewDataTable, ReviewItem } from '@/components/admin/reviews/ReviewDataTable';

export const revalidate = 0;

export const metadata = {
  title: 'Quản lý đánh giá | PCHub Admin',
};

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, product_id, customer_name, rating, content, status, reply, created_at, product:products!product_id(id, name, slug, images)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
  }

  const formattedReviews: ReviewItem[] = (reviews || []).map((r: any) => ({
    ...r,
    product: Array.isArray(r.product) ? r.product[0] : r.product,
  }));

  return <ReviewDataTable initialReviews={formattedReviews} />;
}