import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CategoryFeatured from '@/components/shop/CategoryFeatured';
import CategoryDropdownMenu from '@/components/layout/CategoryDropdownMenu';
import ProductGrid from '@/components/shop/ProductGrid';
import { getCategories, getProducts } from '@/lib/db';
import { ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hang?: string; sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(item => item.slug === slug);
  return category
    ? {
        title: `${category.name} chính hãng | PCHub`,
        description: `Mua ${category.name} chính hãng, giá tốt nhất tại PCHub. Đa dạng mẫu mã từ các thương hiệu Intel, AMD, ASUS, MSI, Gigabyte...`,
      }
    : {};
}

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'name_asc', label: 'Tên A → Z' },
  { value: 'name_desc', label: 'Tên Z → A' },
];

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const categories = await getCategories();
  const category = categories.find(item => item.slug === slug);
  if (!category && slug !== 'tat-ca') notFound();

  const categoryId = category?.id;
  const currentSort = query.sort || 'price_asc';
  const currentPage = parseInt(query.page || '1', 10);

  const result = await getProducts({
    category_id: categoryId,
    sort: currentSort,
    page: currentPage,
    limit: 20,
  });

  const title = category?.name ?? 'Tất cả sản phẩm';
  const totalProducts = result.pagination.total;
  const totalPages = result.pagination.totalPages;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px 0' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href="/search" style={{ color: '#64748b', textDecoration: 'none' }}>Sản phẩm</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{title}</span>
        </div>

        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0 }}>
              {totalProducts > 0 ? `${totalProducts} sản phẩm chính hãng` : 'Đang tải sản phẩm...'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <CategoryDropdownMenu />
            <Link
              href="/danh-muc/tat-ca"
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                background: slug === 'tat-ca' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                color: slug === 'tat-ca' ? '#fff' : '#cbd5e1',
                border: `1px solid ${slug === 'tat-ca' ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Tất cả
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: cat.slug === slug ? '#2563eb' : 'rgba(255,255,255,0.1)',
                  color: cat.slug === slug ? '#fff' : '#cbd5e1',
                  border: `1px solid ${cat.slug === slug ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.name.split(' - ')[0].split(' (')[0]}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        <CategoryFeatured
          categorySlug={slug}
          categoryName={title}
          products={result.products}
        />

        {/* Sort & Filter Bar */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #f1f5f9',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
            <SlidersHorizontal size={15} />
            <span>Hiển thị <strong style={{ color: '#0f172a' }}>{result.products.length}</strong> / {totalProducts} sản phẩm</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={15} color="#64748b" />
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Sắp xếp:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {SORT_OPTIONS.map(opt => (
                <Link
                  key={opt.value}
                  href={`/danh-muc/${slug}?sort=${opt.value}`}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    background: currentSort === opt.value ? '#2563eb' : '#f8fafc',
                    color: currentSort === opt.value ? '#fff' : '#475569',
                    border: `1px solid ${currentSort === opt.value ? '#2563eb' : '#e2e8f0'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {result.products.length > 0 ? (
          <ProductGrid products={result.products.map(product => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            nameVi: product.name,
            category: product.category_name || title,
            brand: product.brand_name || 'Chính hãng',
            price: Number(product.price),
            originalPrice: Number(product.original_price ?? Math.round(Number(product.price) * 1.13)),
            images: [product.image_url || '/images/cpu-box.jpg'],
            rating: 5,
            reviewCount: 0,
            stock: Number(product.stock ?? 10),
            specs: product.specs || {},
            tags: [],
            badge: undefined,
            warrantyMonths: 24,
          }))} />
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '60px 24px',
            textAlign: 'center',
            border: '1px solid #f1f5f9',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Chưa có sản phẩm
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
              Danh mục này chưa có sản phẩm hoặc đang cập nhật.
            </p>
            <Link
              href="/search"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: '#2563eb',
                color: '#fff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '36px', flexWrap: 'wrap' }}>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={`/danh-muc/${slug}?sort=${currentSort}&page=${p}`}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: p === currentPage ? '#2563eb' : '#fff',
                  color: p === currentPage ? '#fff' : '#475569',
                  border: `1px solid ${p === currentPage ? '#2563eb' : '#e2e8f0'}`,
                  boxShadow: p === currentPage ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                {p}
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
