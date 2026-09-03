import Link from 'next/link';
import ProductGrid from '@/components/shop/ProductGrid';

type Props = { searchParams: Promise<{ q?: string; search?: string }> };

async function fetchProducts(search: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products?search=${encodeURIComponent(search)}&limit=20`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q ?? params.search ?? '').trim();
  const products = query ? await fetchProducts(query) : [];
  const mappedProducts = products.map((product: any) => ({
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
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5"><Link href="/">Trang chủ</Link><span>»</span><span>Tìm kiếm</span></div>
        <h1 className="text-2xl font-bold text-gray-900">{query ? `Kết quả tìm kiếm cho "${query}"` : 'Tìm kiếm sản phẩm'}</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">{query ? `Tìm thấy ${products.length} sản phẩm` : 'Nhập từ khóa để tìm kiếm CPU, GPU, RAM và linh kiện.'}</p>
        {query ? <ProductGrid products={mappedProducts} /> : <div className="bg-white border rounded-xl p-12 text-center text-gray-500">Hãy nhập từ khóa trong ô tìm kiếm phía trên.</div>}
      </div>
    </div>
  );
}
