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

export function formatProductDetail(product: any): ProductDetailData {
  if (!product) return getFallbackDetail();

  const specsObj = product.specs || {};
  const specsArray = Object.entries(specsObj).map(([key, val]) => ({
    label: key.replace(/_/g, ' ').toUpperCase(),
    val: Array.isArray(val) ? val.join(', ') : String(val),
    isHighlight: key.includes('socket') || key.includes('vram') || key.includes('clock')
  }));

  const mainImage = product.image_url || '/images/cpu-box.jpg';
  const priceNum = Number(product.price || 0);

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
    soldCount: 120 + (Number(product.stock) || 5) * 4,
    stockCount: Number(product.stock ?? 10),
    rating: 5,
    reviewCount: 48,
    badges: [product.brand_name || 'CHÍNH HÃNG', 'HOT', 'MỚI'],
    mainImage: mainImage,
    thumbnails: [mainImage, '/images/hero-pc.jpg', '/images/gpu-white.jpg'],
    aiMatchText: `Linh kiện ${product.name} tương thích hoàn hảo với hệ thống PC chuẩn mới. AI kiểm tra công suất và chuẩn kết nối đạt 100%.`,
    specs: specsArray.length ? specsArray : [
      { label: 'Thương hiệu', val: product.brand_name || 'Chính hãng' },
      { label: 'Mã SKU', val: product.sku || 'N/A' },
      { label: 'Bảo hành', val: '36 Tháng' }
    ],
    radarData: [
      { label: 'Hiệu năng', score: 95 },
      { label: 'Đa nhiệm', score: 90 },
      { label: 'Nhiệt độ', score: 88 },
      { label: 'Điện năng', score: 85 },
      { label: 'Giá trị', score: 92 }
    ],
    pros: [
      'Hiệu năng tối ưu cho công việc sáng tạo & gaming',
      'Độ bền cao, linh kiện cao cấp từ thương hiệu lớn',
      'Bảo hành chính hãng 36 tháng'
    ],
    cons: [
      'Nên kết hợp với bộ nguồn công suất thực tối thiểu 550W'
    ],
    description: `Sản phẩm ${product.name} đáp ứng tốt mọi yêu cầu sử dụng từ chơi game AAA đến xử lý đồ họa chuyên nghiệp.`
  };
}

function getFallbackDetail(): ProductDetailData {
  return {
    id: 'intel-core-i9-14900k',
    slug: 'intel-core-i9-14900k',
    name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng, 36MB Cache, LGA 1700)',
    brand: 'Intel',
    category: 'Vi xử lý (CPU)',
    categorySlug: 'cpu',
    price: 13990000,
    oldPrice: 16490000,
    sku: 'BX8071514900K',
    soldCount: 1204,
    stockCount: 47,
    rating: 5,
    reviewCount: 128,
    badges: ['Intel', 'NEW', 'HOT'],
    mainImage: '/images/cpu-box.jpg',
    thumbnails: ['/images/cpu-box.jpg', '/images/gpu-white.jpg', '/images/hero-pc.jpg'],
    aiMatchText: 'Bộ vi xử lý flagship tương thích tốt với bo mạch chủ LGA1700.',
    specs: [
      { label: 'Thương hiệu', val: 'Intel' },
      { label: 'Socket', val: 'LGA1700', isHighlight: true },
      { label: 'Số nhân / luồng', val: '24 Cores / 32 Threads' }
    ],
    radarData: [
      { label: 'Hiệu năng', score: 98 },
      { label: 'Đa nhiệm', score: 95 },
      { label: 'Nhiệt độ', score: 70 },
      { label: 'Điện năng', score: 68 },
      { label: 'Giá trị', score: 85 }
    ],
    pros: ['Hiệu năng đơn nhân & đa nhân cực mạnh', 'Xung nhịp 6.0GHz'],
    cons: ['Tiêu thụ điện năng lớn'],
    description: 'Bộ vi xử lý Intel Core i9-14900K mang lại sức mạnh đỉnh cao.'
  };
}

export function getProductData(idOrSlug: string): ProductDetailData {
  return getFallbackDetail();
}
