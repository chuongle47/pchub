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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-400" />
            <span>Bài Viết & Cẩm Nang PC</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý các bài đánh giá linh kiện, cẩm nang hướng dẫn build máy và tin tức
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Viết bài mới</span>
        </Link>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Bài viết</th>
              <th className="p-4">Chuyên mục</th>
              <th className="p-4">Tác giả</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0 max-w-md">
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="font-bold text-white hover:text-blue-400 transition-colors truncate block text-xs"
                      >
                        {p.title}
                      </Link>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                        /blog/{p.slug}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
                    {typeMap[p.type] || p.type}
                  </span>
                </td>

                <td className="p-4 text-slate-400">
                  {p.author?.full_name || 'Admin PCHub'}
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      p.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Xem bài viết"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/admin/posts/${p.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
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