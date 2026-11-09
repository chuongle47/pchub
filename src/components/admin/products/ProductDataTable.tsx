'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Copy,
  Pencil,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
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

  // Local Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedStock, setSelectedStock] = useState(searchParams.get('stock') || '');
  const [isSaleOnly, setIsSaleOnly] = useState(searchParams.get('sale') === 'true');

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedCat) params.set('cat', selectedCat);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (selectedStock) params.set('stock', selectedStock);
    if (isSaleOnly) params.set('sale', 'true');
    params.set('page', '1');

    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCat('');
    setSelectedBrand('');
    setSelectedStock('');
    setIsSaleOnly(false);
    startTransition(() => {
      router.push('/admin/products');
    });
  };

  // Bulk Selection
  const toggleSelectAll = () => {
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Sản Phẩm</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng: <span className="font-semibold text-blue-600">{totalCount}</span> linh kiện trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất CSV</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
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
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
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
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            >
              <option value="">Tất cả tồn kho</option>
              <option value="in_stock">Còn hàng (&gt; 0)</option>
              <option value="low_stock">Sắp hết hàng (≤ 5)</option>
              <option value="out_of_stock">Hết hàng (= 0)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Sale checkbox & Filter Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={isSaleOnly}
              onChange={(e) => setIsSaleOnly(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Chỉ hiện sản phẩm đang Sale</span>
          </label>

          <div className="flex items-center gap-2">
            {(searchTerm || selectedCat || selectedBrand || selectedStock || isSaleOnly) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}

            <button
              type="button"
              onClick={applyFilters}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isPending ? 'Đang lọc...' : 'Áp dụng bộ lọc'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (When items are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
            <span>Đã chọn {selectedIds.length} sản phẩm</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={actionLoading === 'bulk'}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hiển thị
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              disabled={actionLoading === 'bulk'}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Ẩn đi
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={actionLoading === 'bulk'}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa đã chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Data Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Chọn tất cả"
                  >
                    {selectedIds.length === products.length && products.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4 min-w-[320px]">Sản phẩm</th>
                <th className="p-4 min-w-[160px]">Danh mục & Hãng</th>
                <th className="p-4 min-w-[130px]">Giá bán</th>
                <th className="p-4 text-center min-w-[100px]">Tồn kho</th>
                <th className="p-4 text-center min-w-[100px]">Trạng thái</th>
                <th className="p-4 text-right min-w-[120px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isActionLoading = actionLoading === p.id || actionLoading === `dup-${p.id}`;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleSelectOne(p.id)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Product Name & Large Spacious Image */}
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                            {p.images && p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-md">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-xs sm:text-sm line-clamp-2 leading-snug"
                              title={p.name}
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                SKU: {p.sku || (p.id ? `PCH-${p.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}` : 'PCH-PROD')}
                              </span>
                              {p.is_hot && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                  🔥 HOT
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {p.category?.name || 'Chưa phân loại'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          {p.brand?.name || 'Khác'}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        {p.sale_price && p.sale_price < p.price ? (
                          <div>
                            <div className="font-bold text-amber-600 text-xs sm:text-sm">
                              {Number(p.sale_price).toLocaleString('vi-VN')} ₫
                            </div>
                            <div className="text-[10px] text-slate-400 line-through mt-0.5">
                              {Number(p.price).toLocaleString('vi-VN')} ₫
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {Number(p.price).toLocaleString('vi-VN')} ₫
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            p.stock === 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : p.stock <= 5
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock}`}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            p.is_active
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {p.is_active ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View on storefront */}
                          <Link
                            href={`/san-pham/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Xem trên Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(p.id)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Nhân bản sản phẩm"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Trang <span className="font-bold text-slate-800">{page}</span> / {totalPages} (Tổng số {totalCount} sản phẩm)
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/products?page=${Math.max(page - 1, 1)}`}
                className={`p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors ${
                  page <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/products?page=${Math.min(page + 1, totalPages)}`}
                className={`p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors ${
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
