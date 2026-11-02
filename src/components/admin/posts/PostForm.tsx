'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Globe, FileText, Image as ImageIcon, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { createPostAction, updatePostAction } from '@/lib/actions/admin-content';

interface Props {
  initialData?: any;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function PostForm({ initialData }: Props) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url || '');
  const [type, setType] = useState<'review' | 'guide' | 'roundup'>(initialData?.type || 'guide');
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'published');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        cover_url: coverUrl.trim() || null,
        type,
        status,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
      };

      if (isEditing) {
        await updatePostAction(initialData.id, payload);
      } else {
        await createPostAction(payload);
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu bài viết');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isEditing ? `Chỉnh sửa: ${initialData.title}` : 'Soạn Thảo Bài Viết Mới'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cập nhật nội dung cẩm nang build máy, đánh giá sản phẩm và tối ưu SEO
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isEditing ? 'Lưu bài viết' : 'Xuất bản bài viết'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Tiêu đề bài viết *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ví dụ: Hướng dẫn chọn nguồn máy tính PSU chuẩn nhất cho game thủ 2026"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Đường dẫn (Slug) *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Chuyên mục
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="guide">Hướng dẫn build PC</option>
              <option value="review">Đánh giá linh kiện</option>
              <option value="roundup">Tổng hợp công nghệ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              URL Ảnh bìa đại diện
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Trạng thái xuất bản
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="published">Xuất bản công khai</option>
              <option value="draft">Lưu bản nháp</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Tóm tắt ngắn (Excerpt)
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Tóm tắt 1-2 câu ngắn gọn xuất hiện trên danh sách bài viết..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Nội dung bài viết (Markdown / Text) *
          </label>
          <textarea
            rows={12}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung bài viết chi tiết..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white font-sans leading-relaxed focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* SEO Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Tối ưu hóa SEO Google</span>
        </h2>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            SEO Title
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm Google"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            SEO Meta Description
          </label>
          <textarea
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Đoạn trích dẫn mô tả dưới tiêu đề trên Google (tối đa 160 ký tự)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </form>
  );
}