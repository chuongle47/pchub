import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PostForm } from '@/components/admin/posts/PostForm';

export const revalidate = 0;

export const metadata = {
  title: 'Chỉnh sửa bài viết | PCHub Admin',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  return <PostForm initialData={post} />;
}