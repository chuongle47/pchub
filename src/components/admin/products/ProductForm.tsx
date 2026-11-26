'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Tag,
  DollarSign,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { createProductAction, updateProductAction } from '@/lib/actions/admin-products';
import { ProductSpecsForm } from './ProductSpecsForm';
import { ProductImageUploader } from './ProductImageUploader';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  initialData?: any;
  categories: Category[];
  brands: Brand[];
}

export function ProductForm({ initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [brandId, setBrandId] = useState(initialData?.brand_id || '');
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [salePrice, setSalePrice] = useState<number | ''>(initialData?.sale_price ?? '');
  const [stock, setStock] = useState<number>(initialData?.stock ?? 10);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(initialData?.warranty_months ?? 36);
  const [description, setDescription] = useState(initialData?.description || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [specs, setSpecs] = useState<Record<string, any>>(initialData?.specs || {});
  const [isHot, setIsHot] = useState<boolean>(initialData?.is_hot ?? false);
  const [isActive, setIsActive] = useState<boolean>(initialData?.is_active ?? true);

  // Auto-generate slug from name if not manually edited
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  };

  const selectedCat = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        name,
        slug,
        sku: sku ? sku.trim() : null,
        category_id: categoryId || null,
        brand_id: brandId || null,
        price: Number(price),
        sale_price: salePrice ? Number(salePrice) : null,
        stock: Number(stock),
        warranty_months: Number(warrantyMonths),
        description: description ? description.trim() : null,
        images,
        specs,
        is_hot: isHot,
        is_active: isActive,
      };

      const res = isEditing
        ? await updateProductAction(initialData.id, payload)
        : await createProductAction(payload);

      if (!res.success) {
        setError(res.error || 'Đã có lỗi xảy ra khi lưu sản phẩm.');
        setSaving(false);
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {isEditing ? `Chỉnh sửa: ${initialData.name}` : 'Thêm sản phẩm mới'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật thông tin linh kiện, hình ảnh và thông số kỹ thuật Build PC
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Basic Info & Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Name, Description, Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Thông tin chung
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ví dụ: CPU Intel Core i7-14700K"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Đường dẫn (Slug) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="intel-core-i7-14700k"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mã SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="CPU-INTEL-14700K"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 uppercase font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả thông tin, hiệu năng, đặc điểm nổi bật..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Dynamic Specs Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <ProductSpecsForm
              categorySlug={selectedCat?.slug}
              specs={specs}
              onChange={setSpecs}
            />
          </div>

          {/* Media Images Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hình ảnh sản phẩm (Upload Storage)
              </h2>
            </div>
            <ProductImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* Right Column: Pricing, Category, Brand, Inventory */}
        <div className="space-y-6">
          {/* Organization: Category & Brand */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Phân loại
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Danh mục linh kiện *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hãng sản xuất (Brand)
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">-- Chọn hãng sản xuất --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Giá & Tồn kho
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Giá niêm yết (VNĐ) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="10000000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <span className="text-[11px] font-medium text-blue-600 mt-1 block">
                {Number(price || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Giá khuyến mãi / Sale (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="Bỏ trống nếu không sale"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-amber-600 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {Boolean(salePrice && Number(salePrice) < Number(price || 0)) && (
                <span className="text-[11px] font-medium text-amber-600 mt-1 block">
                  Giảm {Math.round((1 - Number(salePrice) / Number(price || 1)) * 100)}% ({Number(salePrice).toLocaleString('vi-VN')} ₫)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tồn kho
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bảo hành (tháng)
                </label>
                <input
                  type="number"
                  min={0}
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Status & Highlights */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Tag className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Trạng thái hiển thị
              </h2>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div>
                <div className="text-xs font-semibold text-slate-900">Hiển thị trên website</div>
                <div className="text-[11px] text-slate-500">Khách hàng có thể tìm kiếm và mua</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-amber-600 border-slate-300 focus:ring-amber-500"
              />
              <div>
                <div className="text-xs font-semibold text-slate-900">Sản phẩm Nổi bật (HOT)</div>
                <div className="text-[11px] text-slate-500">Ưu tiên hiển thị tại trang chủ & đề xuất</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
