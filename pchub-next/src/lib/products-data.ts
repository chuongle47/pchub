export interface ProductDetailData {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice: number;
  sku: string;
  soldCount: number;
  stockCount: number;
  rating: number;
  reviewCount: number;
  badges: string[];
  mainImage: string;
  thumbnails: string[];
  aiMatchText: string;
  specs: { label: string; val: string; isHighlight?: boolean }[];
  radarData: { label: string; score: number }[];
  pros: string[];
  cons: string[];
  description: string;
}

export function formatProductDetail(product: any): ProductDetailData | null {
  if (!product) return null;

  const specsObj = product.specs || {};
  const specsArray = Object.entries(specsObj).map(([key, val]) => ({
    label: key.replace(/_/g, ' ').toUpperCase(),
    val: Array.isArray(val) ? val.join(', ') : String(val),
    isHighlight: key.includes('socket') || key.includes('vram') || key.includes('clock')
  }));

  const mainImage = product.image_url || '/images/cpu-box.jpg';
  const priceNum = Number(product.price || 0);
  const stockCount = Number(product.stock ?? 0);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand_name || product.brand || 'Chính hãng',
    category: product.category_name || product.category || 'Linh kiện PC',
    categorySlug: product.category_slug || 'cpu',
    price: priceNum,
    oldPrice: Math.round(priceNum * 1.15),
    sku: product.sku || ('SKU-' + (product.id ? product.id.substring(0, 6) : '001')),
    soldCount: Math.max(0, stockCount * 4),
    stockCount,
    rating: 5,
    reviewCount: 0,
    badges: [product.brand_name || 'CHÍNH HÃNG'].filter(Boolean),
    mainImage: mainImage,
    thumbnails: [mainImage],
    aiMatchText: `${product.name} — kiểm tra tương thích với cấu hình của bạn trước khi đặt hàng.`,
    specs: specsArray.length ? specsArray : [
      { label: 'Thương hiệu', val: product.brand_name || 'Chính hãng' },
      { label: 'Mã SKU', val: product.sku || 'N/A' },
      { label: 'Tồn kho', val: String(stockCount) }
    ],
    radarData: [],
    pros: [],
    cons: [],
    description: product.description || `${product.name}. Thương hiệu ${product.brand_name || ''}. SKU ${product.sku || ''}.`
  };
}

export function getProductData(_idOrSlug: string): ProductDetailData | null {
  return null;
}
