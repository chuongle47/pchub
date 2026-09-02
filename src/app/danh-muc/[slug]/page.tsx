import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGrid from '@/components/shop/ProductGrid';
import { getCategories, getProducts } from '@/lib/db';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hang?: string; sort?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(item => item.slug === slug);
  return category ? { title: `${category.name} | PCHub`, description: `Mua ${category.name} chính hãng tại PCHub.` } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const categories = await getCategories();
  const category = categories.find(item => item.slug === slug);
  if (!category && slug !== 'tat-ca') notFound();

  const categoryId = category?.id;
  const result = await getProducts({
    category_id: categoryId,
    sort: query.sort || 'price_asc',
    page: 1,
    limit: 20,
  });
  const title = category?.name ?? 'Tất cả sản phẩm';

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link href="/">Trang chủ</Link><span>»</span><span className="text-gray-900">{title}</span>
        </div>
        <div className="bg-white border rounded-xl p-5 mb-5">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">Tìm thấy {result.pagination.total} sản phẩm</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['ban-chay', 'moi-nhat', 'gia-tang', 'gia-giam'].map(sort => (
              <Link key={sort} href={`/danh-muc/${slug}?sort=${sort}`} className={`px-3 py-1.5 rounded-lg border text-sm ${query.sort === sort ? 'bg-blue-600 text-white border-blue-600' : 'hover:border-blue-500'}`}>
                {sort === 'ban-chay' ? 'Bán chạy' : sort === 'moi-nhat' ? 'Mới nhất' : sort === 'gia-tang' ? 'Giá thấp đến cao' : 'Giá cao đến thấp'}
              </Link>
            ))}
          </div>
        </div>
        <ProductGrid products={result.products.map(product => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          nameVi: product.name,
          category: product.category_name || 'Danh mục',
          brand: product.brand_name || 'Thương hiệu',
          price: Number(product.price),
          originalPrice: Number(product.original_price ?? product.price),
          images: [product.image_url || '/images/placeholder.png'],
          rating: 5,
          reviewCount: 0,
          stock: Number(product.stock ?? 0),
          specs: product.specs || {},
          tags: [],
          badge: 'new' as const,
          warrantyMonths: 12,
        }))} />
      </div>
    </div>
  );
}
