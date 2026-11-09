'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Pencil,
  Download,
  Upload,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  Square,
  AlertTriangle,
  Loader2,
  Package,
} from 'lucide-react';
import {
  deleteProductAction,
  duplicateProductAction,
  bulkUpdateProductsAction,
} from '@/lib/actions/admin-products';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  is_active: boolean;
  is_hot: boolean;
  images: string[];
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
}

interface DataTableProps {
  products: ProductItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export function ProductDataTable({
  products,
  totalCount,
  page,
  pageSize,
  categories,
  brands,
}: DataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Search & Filter state from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [stockFilter, setStockFilter] = useState(searchParams.get('stock') || '');
  const [saleFilter, setSaleFilter] = useState(searchParams.get('sale') === 'true');

  // Selected checkboxes for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Apply filters to URL
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedCat) params.set('cat', selectedCat);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (stockFilter) params.set('stock', stockFilter);
    if (saleFilter) params.set('sale', 'true');
    params.set('page', '1');

    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Actions
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    setActionLoading(id);
    try {
      await deleteProductAction(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa sản phẩm');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setActionLoading(`dup-${id}`);
    try {
      await duplicateProductAction(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi nhân bản sản phẩm');
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`)) {
        return;
      }
    }

    setActionLoading('bulk');
    try {
      await bulkUpdateProductsAction(selectedIds, action);
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi thực hiện thao tác hàng loạt');
    } finally {
      setActionLoading(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tên sản phẩm', 'SKU', 'Danh mục', 'Hãng', 'Giá niêm yết', 'Giá sale', 'Tồn kho', 'Trạng thái'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku || '',
      p.category?.name || '',
      p.brand?.name || '',
      p.price,
      p.sale_price || '',
      p.stock,
      p.is_active ? 'Hiển thị' : 'Ẩn',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PCHub_Products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý Sản Phẩm</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tổng cộng: <span className="font-semibold text-blue-400">{totalCount}</span> linh kiện trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Tìm theo tên sản phẩm, SKU..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả hãng</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả tồn kho</option>
              <option value="in_stock">Còn hàng (&gt; 0)</option>
              <option value="low_stock">Sắp hết hàng (≤ 5)</option>
              <option value="out_of_stock">Hết hàng (= 0)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={saleFilter}
              onChange={(e) => setSaleFilter(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-amber-500 bg-slate-950 border-slate-700"
            />
            <span>Chỉ hiện sản phẩm đang Sale</span>
          </label>

          <button
            onClick={applyFilters}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
            <span>Áp dụng bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Banner (Visible when items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md text-[11px]">
              {selectedIds.length}
            </span>
            <span>sản phẩm đã chọn</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px]"
            >
              Hiện tất cả
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-[11px]"
            >
              Ẩn tất cả
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 font-semibold text-[11px]"
            >
              Xóa đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4 w-10 text-center">
                  <button onClick={handleSelectAll} className="p-1 text-slate-400 hover:text-white">
                    {selectedIds.length === products.length && products.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Danh mục & Hãng</th>
                <th className="p-4">Giá bán</th>
                <th className="p-4 text-center">Tồn kho</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.length > 0 ? (
                products.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isActionLoading = actionLoading === p.id || actionLoading === `dup-${p.id}`;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleSelectOne(p.id)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Product Name & SKU */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.images && p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-semibold text-white hover:text-blue-400 transition-colors truncate block text-xs"
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                SKU: {p.sku || (p.id ? `PCH-${p.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}` : 'PCH-PROD')}
                              </span>
                              {p.is_hot && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                                  HOT
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="p-4">
                        <div className="font-medium text-slate-200">
                          {p.category?.name || 'Chưa phân loại'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.brand?.name || 'Khác'}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        {p.sale_price && p.sale_price < p.price ? (
                          <div>
                            <div className="font-bold text-amber-400 text-xs">
                              {Number(p.sale_price).toLocaleString('vi-VN')} ₫
                            </div>
                            <div className="text-[10px] text-slate-500 line-through">
                              {Number(p.price).toLocaleString('vi-VN')} ₫
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-white text-xs">
                            {Number(p.price).toLocaleString('vi-VN')} ₫
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock === 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : p.stock <= 5
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock}`}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.is_active
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {p.is_active ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View on storefront */}
                          <Link
                            href={`/san-pham/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Xem trên Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(p.id)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="Nhân bản sản phẩm"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Trang <span className="font-bold text-white">{page}</span> / {totalPages} (Tổng số {totalCount} sản phẩm)
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href={`/admin/products?page=${Math.max(page - 1, 1)}`}
                className={`p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors ${
                  page <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/products?page=${Math.min(page + 1, totalPages)}`}
                className={`p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors ${
                  page >= totalPages ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}