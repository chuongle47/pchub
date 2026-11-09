'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle,
  EyeOff,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  ExternalLink,
  CornerDownRight,
  Send,
  AlertCircle
} from 'lucide-react';
import {
  moderateReviewAction,
  replyReviewAction,
  deleteReviewAction
} from '@/lib/actions/admin-content';

export interface ReviewItem {
  id: string;
  product_id: string;
  customer_name: string | null;
  rating: number;
  content: string;
  status: 'pending' | 'approved' | 'hidden';
  reply: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
  };
}

interface Props {
  initialReviews: ReviewItem[];
}

export function ReviewDataTable({ initialReviews }: Props) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        !search ||
        (r.customer_name && r.customer_name.toLowerCase().includes(search.toLowerCase())) ||
        (r.product?.name && r.product.name.toLowerCase().includes(search.toLowerCase())) ||
        r.content.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchRating = ratingFilter === 'all' || r.rating === ratingFilter;

      return matchSearch && matchStatus && matchRating;
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const approved = reviews.filter((r) => r.status === 'approved').length;
    const avg = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : '5.0';
    return { total, pending, approved, avg };
  }, [reviews]);

  const handleModerate = async (id: string, newStatus: 'approved' | 'hidden' | 'pending') => {
    setActionLoadingId(id);
    try {
      await moderateReviewAction(id, newStatus);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái đánh giá');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?')) return;
    setActionLoadingId(id);
    try {
      await deleteReviewAction(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa đánh giá');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSavingReply(true);
    try {
      await replyReviewAction(id, replyText.trim());
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: replyText.trim() } : r)));
      setActiveReplyId(null);
      setReplyText('');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi phản hồi');
    } finally {
      setSavingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span>Đánh giá sản phẩm</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm duyệt phản hồi từ khách hàng và gửi câu trả lời chính thức từ PCHub.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng đánh giá</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chờ duyệt</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">{stats.pending}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã hiển thị</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">{stats.approved}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Điểm trung bình</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.avg} / 5.0</div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, sản phẩm, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
            {(['all', 'pending', 'approved', 'hidden'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {st === 'all'
                  ? 'Tất cả'
                  : st === 'pending'
                  ? 'Chờ duyệt'
                  : st === 'approved'
                  ? 'Đã duyệt'
                  : 'Đã ẩn'}
              </button>
            ))}
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả số sao</option>
            <option value="5">5 sao ★★★★★</option>
            <option value="4">4 sao ★★★★☆</option>
            <option value="3">3 sao ★★★☆☆</option>
            <option value="2">2 sao ★★☆☆☆</option>
            <option value="1">1 sao ★☆☆☆☆</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-sm">
            Không có đánh giá nào phù hợp với bộ lọc.
          </div>
        ) : (
          filtered.map((rev) => {
            const isLoading = actionLoadingId === rev.id;
            return (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-200 shadow-sm space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    {rev.product?.images?.[0] && (
                      <img
                        src={rev.product.images[0]}
                        alt=""
                        className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 shadow-xs flex-shrink-0"
                      />
                    )}
                    <div>
                      <Link
                        href={`/products/${rev.product?.slug || rev.product_id}`}
                        target="_blank"
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                      >
                        {rev.product?.name || 'Sản phẩm PCHub'}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Ngày gửi: {new Date(rev.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        rev.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : rev.status === 'hidden'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}
                    >
                      {rev.status === 'approved'
                        ? 'Đã duyệt hiển thị'
                        : rev.status === 'hidden'
                        ? 'Đang ẩn'
                        : 'Chờ kiểm duyệt'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      {rev.customer_name || 'Khách hàng ẩn danh'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    {rev.content}
                  </p>
                </div>

                {rev.reply && (
                  <div className="ml-4 pl-3 border-l-4 border-blue-600 bg-blue-50/60 p-3.5 rounded-r-xl space-y-1">
                    <div className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5" /> Phản hồi từ PCHub:
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.reply}</p>
                  </div>
                )}

                {activeReplyId === rev.id && (
                  <div className="ml-4 pl-3 border-l-4 border-slate-300 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Nhập nội dung phản hồi chính thức cho đánh giá này..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendReply(rev.id)}
                        disabled={savingReply || !replyText.trim()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {savingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Gửi phản hồi
                      </button>
                      <button
                        onClick={() => {
                          setActiveReplyId(null);
                          setReplyText('');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    {rev.status !== 'approved' && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleModerate(rev.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Duyệt hiển thị
                      </button>
                    )}

                    {rev.status !== 'hidden' && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleModerate(rev.id, 'hidden')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Ẩn đánh giá
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveReplyId(activeReplyId === rev.id ? null : rev.id);
                        setReplyText(rev.reply || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> {rev.reply ? 'Sửa phản hồi' : 'Viết phản hồi'}
                    </button>
                  </div>

                  <button
                    disabled={isLoading}
                    onClick={() => handleDelete(rev.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa vĩnh viễn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
