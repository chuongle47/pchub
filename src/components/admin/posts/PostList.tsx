'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  FileText,
  Clock,
  Eye,
} from 'lucide-react';
import { deletePostAction } from '@/lib/actions/admin-content';

interface PostItem {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  type: string;
  status: string;
  published_at: string | null;
  created_at: string;
  author?: { full_name: string } | null;
}

interface Props {
  posts: PostItem[];
}

const typeMap: Record<string, string> = {
  guide: 'Hướng dẫn build máy',
  review: 'Đánh giá linh kiện',
  roundup: 'Tổng hợp công nghệ',
};

export function PostList({ posts }: Props) {
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bài viết "${title}"?`)) return;
    try {
      await deletePostAction(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa bài viết');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            <span>Bài Viết & Cẩm Nang PC</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các bài đánh giá linh kiện, cẩm nang hướng dẫn build máy và tin tức
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex-shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Viết bài mới</span>
        </Link>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Bài viết</th>
              <th className="px-5 py-3.5">Chuyên mục</th>
              <th className="px-5 py-3.5">Tác giả</th>
              <th className="px-5 py-3.5 text-center">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 max-w-md">
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block text-sm"
                      >
                        {p.title}
                      </Link>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                        /blog/{p.slug}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-slate-700">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                    {typeMap[p.type] || p.type}
                  </span>
                </td>

                <td className="px-5 py-4 text-slate-600 text-xs font-medium">
                  {p.author?.full_name || 'Admin PCHub'}
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      p.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Xem bài viết"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/posts/${p.id}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                  Chưa có bài viết nào trong hệ thống.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
