import React from 'react';
import { PostForm } from '@/components/admin/posts/PostForm';

export const metadata = {
  title: 'Viết bài mới | PCHub Admin',
};

export default function NewPostPage() {
  return <PostForm />;
}