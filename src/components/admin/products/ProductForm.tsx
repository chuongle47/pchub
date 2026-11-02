'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductImageUploader } from './ProductImageUploader';
import { ProductSpecsForm } from './ProductSpecsForm';
import { createProductAction, updateProductAction } from '@/lib/actions/admin-products';
import { Loader2, ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: any;
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
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

export function ProductForm({ initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [brandId, setBrandId] = useState(initialData?.brand_id || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [price, setPrice] = useState<number>(initialData?.price || 0);
  const [salePrice, setSalePrice] = useState<number | ''>(initialData?.sale_price || '');
  const [stock, setStock] = useState<number>(initialData?.stock ?? 10);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(initialData?.warranty_months ?? 36);
  const [isActive, setIsActive] = useState<boolean>(initialData?.is_active ?? true);
  const [isHot, setIsHot] = useState<boolean>(initialData?.is_hot ?? false);
  const [description, setDescription] = useState(initialData?.description || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [specs, setSpecs] = useState<Record<string, any>>(initialData?.specs || {});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected category slug for dynamic specs
  const selectedCat = categories.find((c) => c.id === categoryId);

  const handleNameChange = (val: string) => {
    setName(val);
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
        name: name.trim(),
        slug: slug.trim(),
        sku: sku.trim() || null,
        brand_id: brandId || null,
        category_id: categoryId || null,
        price: Number(price),
        sale_price: salePrice ? Number(salePrice) : null,
        stock: Number(stock),
        warranty_months: Number(warrantyMonths),
        images,
        description,
        specs,
        is_active: isActive,
        is_hot: isHot,
      };

      if (isEditing) {
        await updateProductAction(initialData.id, payload);
      } else {
        await createProductAction(payload);
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isEditing ? `Chỉnh sửa: ${initialData.name}` : 'Thêm sản phẩm mới'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cập nhật thông tin linh kiện, hình ảnh và thông số kỹ thuật Build PC
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60 cursor-pointer"
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
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Info & Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Name, Description, Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Thông tin chung
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ví dụ: CPU Intel Core i7-14700K"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Đường dẫn (Slug) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="intel-core-i7-14700k"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Mã SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="CPU-INTEL-14700K"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả thông tin, hiệu năng, đặc điểm nổi bật..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Dynamic Specs Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <ProductSpecsForm
              categorySlug={selectedCat?.slug}
              specs={specs}
              onChange={setSpecs}
            />
          </div>

          {/* Media Images Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Hình ảnh sản phẩm (Upload Storage)
            </h2>
            <ProductImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* Right Column: Pricing, Category, Brand, Inventory */}
        <div className="space-y-6">
          {/* Organization: Category & Brand */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Phân loại
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Danh mục linh kiện *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hãng sản xuất (Brand) *
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Giá & Tồn kho
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Giá niêm yết (VNĐ) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="10000000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-blue-400 mt-1 block">
                {Number(price || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Giá khuyến mãi / Sale (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="Bỏ trống nếu không sale"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-semibold focus:outline-none focus:border-blue-500"
              />
              {Boolean(salePrice && Number(salePrice) < price) && (
                <span className="text-[11px] text-amber-400 mt-1 block">
                  Giảm {Math.round((1 - Number(salePrice) / price) * 100)}% ({Number(salePrice).toLocaleString('vi-VN')} ₫)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tồn kho
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bảo hành (tháng)
                </label>
                <input
                  type="number"
                  min={0}
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status & Highlights */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Trạng thái hiển thị
            </h2>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <div>
                <div className="text-xs font-semibold text-white">Hiển thị trên website</div>
                <div className="text-[10px] text-slate-400">Khách hàng có thể tìm kiếm và mua</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
              />
              <div>
                <div className="text-xs font-semibold text-white">Sản phẩm Nổi bật (HOT)</div>
                <div className="text-[10px] text-slate-400">Ưu tiên hiển thị tại trang chủ</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}