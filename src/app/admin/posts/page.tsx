import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { PostList } from '@/components/admin/posts/PostList';

export const revalidate = 0;

export default async function AdminPostsPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, cover_url, type, status, published_at, created_at, author:profiles!author_id(full_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin posts:', error);
  }

  const formattedPosts = (posts || []).map((p: any) => ({
    ...p,
    author: Array.isArray(p.author) ? p.author[0] : p.author,
  }));

  return <PostList posts={formattedPosts} />;
}