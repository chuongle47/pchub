'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================================================
// 1. POSTS ACTIONS
// ============================================================================

export async function createPostAction(data: {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_url?: string | null;
  type: 'review' | 'guide' | 'roundup';
  status: 'draft' | 'scheduled' | 'published';
  seo_title?: string | null;
  seo_description?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!data.title || !data.slug || !data.content) {
    throw new Error('Vui lòng nhập tiêu đề, đường dẫn và nội dung bài viết');
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      ...data,
      author_id: user?.id || null,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/admin/posts');
  revalidatePath('/blog');
  revalidatePath('/articles');
  return { success: true, id: post.id };
}

export async function updatePostAction(
  id: string,
  data: {
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    cover_url?: string | null;
    type: 'review' | 'guide' | 'roundup';
    status: 'draft' | 'scheduled' | 'published';
    seo_title?: string | null;
    seo_description?: string | null;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('posts')
    .update({
      ...data,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/posts');
  revalidatePath(`/admin/posts/${id}`);
  revalidatePath('/blog');
  revalidatePath('/articles');
  return { success: true };
}

export async function deletePostAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/posts');
  revalidatePath('/blog');
  return { success: true };
}

// ============================================================================
// 2. REVIEWS ACTIONS
// ============================================================================

export async function moderateReviewAction(id: string, status: 'approved' | 'hidden' | 'pending') {
  const supabase = await createClient();
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/reviews');
  revalidatePath('/admin');
  return { success: true };
}

export async function replyReviewAction(id: string, reply: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('reviews').update({ reply }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/reviews');
  return { success: true };
}

// ============================================================================
// 3. CONTACTS ACTIONS
// ============================================================================

export async function updateContactStatusAction(id: string, status: 'new' | 'read' | 'replied') {
  const supabase = await createClient();
  const { error } = await supabase.from('contacts').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/contacts');
  return { success: true };
}

export async function deleteContactAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/contacts');
  return { success: true };
}

// ============================================================================
// 4. AI SETTINGS & CONVERSATIONS
// ============================================================================

export async function updateAiSettingsAction(data: {
  enabled: boolean;
  system_prompt: string;
  model: string;
  daily_token_limit: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from('ai_settings').upsert({
    id: 1,
    enabled: data.enabled,
    system_prompt: data.system_prompt,
    model: data.model,
    daily_token_limit: Number(data.daily_token_limit),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin/ai-advisor');
  return { success: true };
}

export async function flagAiConversationAction(id: string, flagged: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from('ai_conversations').update({ flagged }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/ai-advisor');
  return { success: true };
}
export async function deleteReviewAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/reviews');
  return { success: true };
}

export async function toggleVoucherSentAction(id: string, voucher_sent: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from('newsletter_subscribers').update({ voucher_sent }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/contacts');
  return { success: true };
}

export async function deleteSubscriberAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/contacts');
  return { success: true };
}
