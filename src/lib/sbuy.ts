import seed from './seed.json';
import { getProductImage } from './product-ui';

export const SBUY_CONFIG = {
  baseUrl: process.env.SBUY_BASE_URL || 'https://sbuy.io.vn',
  consumerKey: process.env.SBUY_CONSUMER_KEY || 'ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e',
  consumerSecret: process.env.SBUY_CONSUMER_SECRET || 'cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873',
};

export interface SbuyProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface SbuyProductImage {
  id: number;
  src: string;
  name?: string;
  alt?: string;
}

export interface SbuyProductAttribute {
  id: number;
  name: string;
  slug: string;
  options: string[];
}

export interface SbuyRawProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_quantity: number | null;
  stock_status: string;
  categories: SbuyProductCategory[];
  images: SbuyProductImage[];
  attributes: SbuyProductAttribute[];
}

export interface AppProduct {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  brand_id: string;
  sku: string;
  price: number;
  original_price: number;
  originalPrice?: number;
  stock: number;
  specs: Record<string, any>;
  image_url: string;
  images: string[];
  category_name: string;
  category_slug: string;
  brand_name: string;
  brand_slug: string;
  rating?: number;
  reviewCount?: number;
  badge?: 'hot' | 'new' | 'sale';
}

export interface AppCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  product_count: number;
}

export interface AppBrand {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  product_count: number;
}

// Category Mapping from Sbuy Category Slug/ID to Internal Standard Component Slugs
const CATEGORY_MAPPING: Record<string, { id: string; slug: string; name: string; icon: string }> = {
  'cpu': { id: 'c1000000-0000-0000-0000-000000000001', slug: 'cpu', name: 'CPU - Bộ Vi Xử Lý', icon: 'cpu' },
  'mainboard': { id: 'c1000000-0000-0000-0000-000000000002', slug: 'mainboard', name: 'Mainboard - Bo Mạch Chủ', icon: 'circuit-board' },
  'ram': { id: 'c1000000-0000-0000-0000-000000000003', slug: 'ram', name: 'RAM - Bộ Nhớ Trong', icon: 'memory' },
  'vga': { id: 'c1000000-0000-0000-0000-000000000004', slug: 'gpu', name: 'GPU - Card Màn Hình', icon: 'gpu' },
  'gpu': { id: 'c1000000-0000-0000-0000-000000000004', slug: 'gpu', name: 'GPU - Card Màn Hình', icon: 'gpu' },
  'o-cung': { id: 'c1000000-0000-0000-0000-000000000005', slug: 'storage', name: 'SSD / HDD - Ổ Đĩa Cứng', icon: 'hard-drive' },
  'nguon': { id: 'c1000000-0000-0000-0000-000000000006', slug: 'psu', name: 'PSU - Nguồn Máy Tính', icon: 'zap' },
  'case': { id: 'c1000000-0000-0000-0000-000000000007', slug: 'case', name: 'Case - Vỏ Máy Tính', icon: 'box' },
  'tan-nhiet': { id: 'c1000000-0000-0000-0000-000000000008', slug: 'cooling', name: 'Tản Nhiệt (Cooling)', icon: 'fan' },
  'man-hinh': { id: 'c1000000-0000-0000-0000-000000000009', slug: 'monitor', name: 'Màn Hình Máy Tính', icon: 'monitor' },
  'man-hinh-may-tinh': { id: 'c1000000-0000-0000-0000-000000000009', slug: 'monitor', name: 'Màn Hình Máy Tính', icon: 'monitor' },
  'ban-phim': { id: 'c1000000-0000-0000-0000-000000000010', slug: 'keyboard', name: 'Bàn Phím Gaming & Bàn Phím Cơ', icon: 'keyboard' },
  'chuot': { id: 'c1000000-0000-0000-0000-000000000011', slug: 'mouse', name: 'Chuột Gaming & Văn Phòng', icon: 'mouse' },
  'tai-nghe': { id: 'c1000000-0000-0000-0000-000000000012', slug: 'headset', name: 'Tai Nghe Gaming', icon: 'headphones' },
  'loa-may-tinh': { id: 'c1000000-0000-0000-0000-000000000013', slug: 'speaker', name: 'Loa Máy Tính', icon: 'speaker' },
  'laptop': { id: 'c1000000-0000-0000-0000-000000000014', slug: 'laptop', name: 'Laptop Gaming & Văn Phòng', icon: 'laptop' },
  'pc-may-tinh-ban': { id: 'c1000000-0000-0000-0000-000000000098', slug: 'prebuilt', name: 'PC Nguyên Bộ - Máy Tính Bàn', icon: 'monitor' }
};

// Known brands to infer from product names
const KNOWN_BRANDS = [
  { name: 'Intel', slug: 'intel' },
  { name: 'AMD', slug: 'amd' },
  { name: 'Asus', slug: 'asus' },
  { name: 'MSI', slug: 'msi' },
  { name: 'Gigabyte', slug: 'gigabyte' },
  { name: 'Kingston', slug: 'kingston' },
  { name: 'Corsair', slug: 'corsair' },
  { name: 'Logitech', slug: 'logitech' },
  { name: 'Razer', slug: 'razer' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Dell', slug: 'dell' },
  { name: 'LG', slug: 'lg' },
  { name: 'AOC', slug: 'aoc' },
  { name: 'Cooler Master', slug: 'cooler-master' },
  { name: 'Deepcool', slug: 'deepcool' },
  { name: 'Rapoo', slug: 'rapoo' },
  { name: 'Edifier', slug: 'edifier' },
  { name: 'JBL', slug: 'jbl' },
  { name: 'Sony', slug: 'sony' },
  { name: 'HyperX', slug: 'hyperx' },
  { name: 'E-Dra', slug: 'e-dra' },
  { name: 'Hikvision', slug: 'hikvision' },
  { name: 'Santak', slug: 'santak' },
  { name: 'Cisco', slug: 'cisco' }
];

// Helper to infer brand from raw Sbuy product data (brands taxonomy, attributes, name, description)
function inferBrand(raw: SbuyRawProduct): { id: string; name: string; slug: string } {
  const productName = raw.name || '';
  const nameLower = productName.toLowerCase();

  // 1. Check raw.brands taxonomy array if present from Sbuy/WooCommerce Brands plugin
  if (Array.isArray((raw as any).brands) && (raw as any).brands.length > 0) {
    const b = (raw as any).brands[0];
    const bName = b.name || b.slug || '';
    if (bName) {
      const bSlug = (b.slug || bName).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      return {
        id: `b-${bSlug}`,
        name: b.name || bName,
        slug: bSlug
      };
    }
  }

  // 2. Check raw.attributes for Brand / Thương hiệu / Brands
  if (Array.isArray(raw.attributes)) {
    for (const attr of raw.attributes) {
      const attrName = (attr.name || '').toLowerCase();
      if (['brand', 'brands', 'thương hiệu', 'hãng sản xuất', 'hãng'].includes(attrName)) {
        if (attr.options && attr.options.length > 0) {
          const opt = attr.options[0];
          const bSlug = opt.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
          return {
            id: `b-${bSlug}`,
            name: opt,
            slug: bSlug
          };
        }
      }
    }
  }

  // 3. Check KNOWN_BRANDS against product name AND description AND short_description
  const fullText = `${productName} ${(raw.short_description || '')} ${(raw.description || '')}`.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    if (fullText.includes(b.slug) || fullText.includes(b.name.toLowerCase())) {
      return {
        id: `b-${b.slug}`,
        name: b.name,
        slug: b.slug
      };
    }
  }

  return {
    id: 'b-khac',
    name: 'Khác',
    slug: 'khac'
  };
}

// Helper to infer specs from name, attributes, description for PC Builder compatibility
function inferProductSpecs(raw: SbuyRawProduct, categorySlug: string): Record<string, any> {
  const specs: Record<string, any> = {};
  const text = `${raw.name} ${raw.short_description || ''} ${raw.description || ''}`.toLowerCase();

  // Populate specs from Sbuy raw attributes if available
  if (Array.isArray(raw.attributes)) {
    raw.attributes.forEach((attr) => {
      if (attr.name && attr.options && attr.options.length > 0) {
        specs[attr.name] = attr.options.join(', ');
      }
    });
  }

  // Infer PC Builder Specs
  if (categorySlug === 'cpu') {
    if (text.includes('10100') || text.includes('10400') || text.includes('11400')) specs['Socket'] = 'LGA1200';
    else if (text.includes('12400') || text.includes('13400') || text.includes('13600') || text.includes('14700') || text.includes('14900')) specs['Socket'] = 'LGA1700';
    else if (text.includes('5600') || text.includes('5700') || text.includes('5900')) specs['Socket'] = 'AM4';
    else if (text.includes('7600') || text.includes('7700') || text.includes('7800') || text.includes('7900')) specs['Socket'] = 'AM5';
    else specs['Socket'] = text.includes('ryzen') ? 'AM5' : 'LGA1700';

    if (text.includes('i3')) specs['Dòng CPU'] = 'Core i3';
    else if (text.includes('i5')) specs['Dòng CPU'] = 'Core i5';
    else if (text.includes('i7')) specs['Dòng CPU'] = 'Core i7';
    else if (text.includes('i9')) specs['Dòng CPU'] = 'Core i9';
    else if (text.includes('ryzen 5')) specs['Dòng CPU'] = 'Ryzen 5';
    else if (text.includes('ryzen 7')) specs['Dòng CPU'] = 'Ryzen 7';
    else if (text.includes('ryzen 9')) specs['Dòng CPU'] = 'Ryzen 9';
  } else if (categorySlug === 'mainboard') {
    if (text.includes('b760') || text.includes('h610') || text.includes('z790') || text.includes('z690')) specs['Socket'] = 'LGA1700';
    else if (text.includes('h510') || text.includes('b560')) specs['Socket'] = 'LGA1200';
    else if (text.includes('b550') || text.includes('b450')) specs['Socket'] = 'AM4';
    else if (text.includes('b650') || text.includes('x670')) specs['Socket'] = 'AM5';

    if (text.includes('ddr5')) specs['Chuẩn RAM'] = 'DDR5';
    else if (text.includes('ddr4')) specs['Chuẩn RAM'] = 'DDR4';
    else specs['Chuẩn RAM'] = text.includes('b650') || text.includes('z790') ? 'DDR5' : 'DDR4';

    if (text.includes('-m') || text.includes('m-k') || text.includes('m-h')) specs['Kích thước'] = 'Micro-ATX';
    else specs['Kích thước'] = 'ATX';
  } else if (categorySlug === 'ram') {
    if (text.includes('ddr5')) specs['Chuẩn RAM'] = 'DDR5';
    else specs['Chuẩn RAM'] = 'DDR4';

    if (text.includes('32gb')) specs['Dung lượng'] = '32GB';
    else if (text.includes('16gb')) specs['Dung lượng'] = '16GB';
    else if (text.includes('8gb')) specs['Dung lượng'] = '8GB';
    else if (text.includes('64gb')) specs['Dung lượng'] = '64GB';
  } else if (categorySlug === 'gpu') {
    if (text.includes('4090')) specs['VRAM'] = '24GB';
    else if (text.includes('4080')) specs['VRAM'] = '16GB';
    else if (text.includes('4070')) specs['VRAM'] = '12GB';
    else if (text.includes('4060')) specs['VRAM'] = '8GB';
    else specs['VRAM'] = '8GB';

    specs['Công suất khuyến nghị'] = text.includes('4070') || text.includes('4080') ? '750W' : '650W';
  } else if (categorySlug === 'psu') {
    if (text.includes('1000w')) specs['Công suất'] = '1000W';
    else if (text.includes('850w')) specs['Công suất'] = '850W';
    else if (text.includes('750w')) specs['Công suất'] = '750W';
    else if (text.includes('650w')) specs['Công suất'] = '650W';
    else if (text.includes('550w')) specs['Công suất'] = '550W';
    else specs['Công suất'] = '650W';
  }

  return specs;
}

const FALLBACK_CATEGORY = {
  id: 'c1000000-0000-0000-0000-000000000099',
  slug: 'linh-kien',
  name: 'Linh kiện PC',
  icon: 'box'
};

function inferCategory(raw: SbuyRawProduct): { id: string; slug: string; name: string; icon: string } {
  const name = (raw.name || '').toLowerCase();

  // 0. Check if Prebuilt PC system
  if (name.startsWith('pc ') || name.startsWith('pc-') || (raw.categories || []).some(c => (c.slug || '').toLowerCase() === 'pc-may-tinh-ban')) {
    return CATEGORY_MAPPING['pc-may-tinh-ban'];
  }

  // 1. Try matching against Sbuy product categories (excluding generic non-component categories)
  if (Array.isArray(raw.categories) && raw.categories.length > 0) {
    for (const cat of raw.categories) {
      const catSlug = (cat.slug || '').toLowerCase();
      if (['linh-kien-may-tinh', 'uncategorized', 'giai-phap-doanh-nghiep', 'hang-thanh-ly', 'dien-may', 'loai-camera'].includes(catSlug)) {
        continue;
      }
      if (CATEGORY_MAPPING[catSlug]) {
        return CATEGORY_MAPPING[catSlug];
      }
    }
  }

  // 2. Infer from product Name with strict component criteria
  if (name.includes('cpu ') || name.startsWith('cpu') || name.includes('bộ vi xử lý')) {
    return CATEGORY_MAPPING['cpu'];
  }
  if (name.includes('mainboard') || name.includes('bo mạch')) {
    return CATEGORY_MAPPING['mainboard'];
  }
  if (name.includes('ram')) {
    return CATEGORY_MAPPING['ram'];
  }
  if (name.includes('vga') || name.includes('card màn hình')) {
    return CATEGORY_MAPPING['gpu'];
  }
  if (name.includes('ổ cứng') || name.includes('ssd') || name.includes('hdd')) {
    return CATEGORY_MAPPING['o-cung'];
  }
  if (name.includes('nguồn máy tính') || name.includes('nguồn seasonic') || name.includes('nguồn corsair')) {
    return CATEGORY_MAPPING['nguon'];
  }
  if (name.includes('case máy tính')) {
    return CATEGORY_MAPPING['case'];
  }
  if (name.includes('tản nhiệt')) {
    return CATEGORY_MAPPING['tan-nhiet'];
  }
  if (name.includes('màn hình')) {
    return CATEGORY_MAPPING['man-hinh'];
  }
  if (name.includes('bàn phím')) {
    return CATEGORY_MAPPING['ban-phim'];
  }
  if (name.includes('chuột')) {
    return CATEGORY_MAPPING['chuot'];
  }
  if (name.includes('tai nghe')) {
    return CATEGORY_MAPPING['tai-nghe'];
  }
  if (name.includes('loa')) {
    return CATEGORY_MAPPING['loa-may-tinh'];
  }
  if (name.includes('laptop')) {
    return CATEGORY_MAPPING['laptop'];
  }

  return FALLBACK_CATEGORY;
}

// Convert SbuyRawProduct to internal AppProduct
export function mapSbuyProduct(raw: SbuyRawProduct): AppProduct {
  const price = parseFloat(raw.price) || parseFloat(raw.regular_price) || 0;
  const originalPrice = parseFloat(raw.regular_price) || price;

  // Primary Category Matching via inferCategory
  const matchedCat = inferCategory(raw);

  // Infer Brand from raw product data (brands taxonomy, attributes, name)
  const brand = inferBrand(raw);

  // Images resolution with intelligent category matching
  const rawImages = Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images.map(img => img.src).filter(Boolean)
    : [];

  const firstImg = rawImages[0] || '';
  const finalImage = getProductImage({
    name: raw.name || '',
    category_name: matchedCat.name,
    category_slug: matchedCat.slug,
    brand_name: brand.name,
    image_url: firstImg,
  });

  const images = rawImages.length > 0 && !firstImg.includes('1587202372775-e229f172b9d7')
    ? rawImages
    : [finalImage];

  const specs = inferProductSpecs(raw, matchedCat.slug);

  const stockQuantity = typeof raw.stock_quantity === 'number'
    ? raw.stock_quantity
    : (raw.stock_status === 'instock' ? 50 : 0);

  return {
    id: String(raw.id),
    name: raw.name || 'Sản phẩm Sbuy',
    slug: raw.slug || `san-pham-${raw.id}`,
    category_id: matchedCat.id,
    brand_id: brand.id,
    sku: raw.sku || `SBUY-${raw.id}`,
    price: price,
    original_price: originalPrice,
    originalPrice: originalPrice,
    stock: stockQuantity,
    specs: specs,
    image_url: finalImage,
    images: images,
    category_name: matchedCat.name,
    category_slug: matchedCat.slug,
    brand_name: brand.name,
    brand_slug: brand.slug,
    rating: 4.8,
    reviewCount: 12 + (raw.id % 25),
    badge: raw.on_sale ? 'sale' : (raw.id % 3 === 0 ? 'hot' : undefined)
  };
}

const LINH_KIEN_ALLOWED_SLUGS = new Set([
  'linh-kien-may-tinh',
  'ban-phim',
  'case',
  'chuot',
  'cpu',
  'loa-may-tinh',
  'mainboard',
  'man-hinh',
  'man-hinh-may-tinh',
  'nguon',
  'o-cung',
  'ram',
  'tai-nghe',
  'tan-nhiet',
  'vga',
  'gpu'
]);

const LINH_KIEN_ALLOWED_NAMES = [
  'linh kiện máy tính',
  'bàn phím',
  'case',
  'chuột',
  'cpu',
  'loa máy tính',
  'mainboard',
  'màn hình',
  'nguồn',
  'ổ cứng',
  'ram',
  'tai nghe',
  'tản nhiệt',
  'vga'
];

function isComputerComponentProduct(p: SbuyRawProduct): boolean {
  if (!p || p.status !== 'publish' || !p.name || !p.name.trim()) return false;
  const nameLower = p.name.toLowerCase().trim();

  // Exclude non-component items, prebuilt PCs, laptops, test entries, domain registrations
  if (
    nameLower === 'test' ||
    nameLower.includes('đăng ký tên miền') ||
    nameLower.includes('tên miền') ||
    nameLower.startsWith('laptop') ||
    nameLower.startsWith('pc workstation') ||
    nameLower.startsWith('pc gaming') ||
    nameLower.includes('máy tính xách tay') ||
    nameLower.includes('macbook')
  ) {
    return false;
  }

  // Check product categories against the "Linh kiện máy tính" category tree
  const categories = Array.isArray(p.categories) ? p.categories : [];
  if (categories.length === 0) return false;

  const hasLinhKienCategory = categories.some(c => {
    const slug = (c.slug || '').toLowerCase().trim();
    const name = (c.name || '').toLowerCase().trim();

    // Must not be laptop or prebuilt PC
    if (slug === 'laptop' || slug === 'pc-may-tinh-ban' || name.includes('laptop') || name.includes('nguyên bộ')) {
      return false;
    }

    return LINH_KIEN_ALLOWED_SLUGS.has(slug) || LINH_KIEN_ALLOWED_NAMES.some(kn => name.includes(kn));
  });

  return hasLinhKienCategory;
}

// Server Cache for Sbuy Products
let sbuyProductsCache: { data: AppProduct[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache for fast updates when adding new products

export async function fetchSbuyProductsLive(): Promise<AppProduct[]> {
  const now = Date.now();
  if (sbuyProductsCache && (now - sbuyProductsCache.timestamp) < CACHE_TTL_MS) {
    return sbuyProductsCache.data;
  }

  try {
    const url = `${SBUY_CONFIG.baseUrl}/wp-json/wc/v3/products?consumer_key=${SBUY_CONFIG.consumerKey}&consumer_secret=${SBUY_CONFIG.consumerSecret}&per_page=100`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      throw new Error(`Sbuy API returned HTTP ${res.status}`);
    }

    const rawProducts: SbuyRawProduct[] = await res.json();
    if (!Array.isArray(rawProducts)) {
      throw new Error('Invalid JSON format from Sbuy API');
    }

    // Keep only published products in "Linh kiện máy tính" / Computer Hardware & Peripherals
    const validRaw = rawProducts.filter(isComputerComponentProduct);
    const mappedProducts = validRaw.map(mapSbuyProduct);

    if (mappedProducts.length > 0) {
      sbuyProductsCache = {
        data: mappedProducts,
        timestamp: now
      };
      return mappedProducts;
    }
  } catch (err) {
    console.error('Failed to fetch live products from Sbuy API:', err);
  }

  // Fallback to cache if available even if expired
  if (sbuyProductsCache && sbuyProductsCache.data.length > 0) {
    return sbuyProductsCache.data;
  }

  // Fallback to local seed JSON if external API is down (filtering out non-components)
  console.warn('Using local seed.json as offline fallback for Sbuy API');
  const fallbackList: AppProduct[] = (seed.products as any[])
    .filter(p => {
      const catSlug = (p.category_slug || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      if (catSlug === 'laptop' || catSlug === 'prebuilt' || catSlug === 'accessory') return false;
      if (nameLower.startsWith('laptop') || nameLower.startsWith('pc workstation') || nameLower.startsWith('pc gaming')) return false;
      return true;
    })
    .map(p => {
      const orig = p.originalPrice || p.original_price || p.price * 1.1;
      const img = getProductImage({
        name: p.name,
        category_name: p.category_name,
        category_slug: p.category_slug,
        brand_name: p.brand_name,
        image_url: p.image_url,
      });
      return {
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        category_id: p.category_id,
        brand_id: p.brand_id,
        sku: p.sku || `SKU-${p.id}`,
        price: p.price,
        original_price: orig,
        originalPrice: orig,
        stock: p.stock ?? 10,
        specs: p.specs || {},
        image_url: img,
        images: [img],
        category_name: p.category_name || 'Linh kiện',
        category_slug: p.category_slug || 'cpu',
        brand_name: p.brand_name || 'Chính hãng',
        brand_slug: p.brand_slug || 'brand',
        rating: 4.8,
        reviewCount: 15
      };
    });

  return fallbackList;
}

export async function getSbuyProductBySlugOrId(slugOrId: string): Promise<AppProduct | null> {
  const products = await fetchSbuyProductsLive();
  const normalized = slugOrId.toLowerCase().trim();
  const found = products.find(p => p.id === slugOrId || p.slug.toLowerCase() === normalized);
  return found || null;
}

// WooCommerce Categories Sync from Sbuy API
let sbuyCategoriesCache: { data: AppCategory[]; timestamp: number } | null = null;

export async function fetchSbuyCategoriesLive(): Promise<AppCategory[]> {
  const now = Date.now();
  if (sbuyCategoriesCache && (now - sbuyCategoriesCache.timestamp) < CACHE_TTL_MS) {
    return sbuyCategoriesCache.data;
  }

  try {
    const url = `${SBUY_CONFIG.baseUrl}/wp-json/wc/v3/products/categories?consumer_key=${SBUY_CONFIG.consumerKey}&consumer_secret=${SBUY_CONFIG.consumerSecret}&per_page=100`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (res.ok) {
      const rawCats: any[] = await res.json();
      if (Array.isArray(rawCats)) {
        const mapped: AppCategory[] = rawCats
          .filter(c => {
            const slug = (c.slug || '').toLowerCase();
            const name = (c.name || '').toLowerCase();
            return LINH_KIEN_ALLOWED_SLUGS.has(slug) || LINH_KIEN_ALLOWED_NAMES.some(kn => name.includes(kn));
          })
          .map(c => {
            const mappedCat = CATEGORY_MAPPING[c.slug] || { id: String(c.id), slug: c.slug, name: c.name, icon: 'box' };
            return {
              id: String(c.id),
              name: c.name || mappedCat.name,
              slug: c.slug || mappedCat.slug,
              icon: mappedCat.icon,
              product_count: c.count || 0
            };
          });

        if (mapped.length > 0) {
          sbuyCategoriesCache = { data: mapped, timestamp: now };
          return mapped;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live categories from Sbuy WooCommerce API:', err);
  }

  // Fallback to internal standard categories list
  const fallbackCategories: AppCategory[] = Object.values(CATEGORY_MAPPING).map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    product_count: 4
  }));

  return fallbackCategories;
}

// WooCommerce Real Order Creation in Sbuy Backend
export async function createSbuyWooCommerceOrder(orderData: {
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    province?: string;
    district?: string;
    ward?: string;
    note?: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  paymentMethod: string;
  paymentMethodLabel: string;
  shippingFee: number;
  total: number;
}): Promise<{ success: boolean; wooOrderId?: number; error?: string }> {
  try {
    const url = `${SBUY_CONFIG.baseUrl}/wp-json/wc/v3/orders?consumer_key=${SBUY_CONFIG.consumerKey}&consumer_secret=${SBUY_CONFIG.consumerSecret}`;

    const lineItems = orderData.items.map(item => {
      const numericId = parseInt(item.id, 10);
      if (!isNaN(numericId) && numericId > 0) {
        return {
          product_id: numericId,
          quantity: item.quantity
        };
      }
      return {
        name: item.name,
        total: String(item.price * item.quantity),
        quantity: item.quantity
      };
    });

    const body = {
      payment_method: orderData.paymentMethod || 'cod',
      payment_method_title: orderData.paymentMethodLabel || 'Thanh toán khi nhận hàng',
      set_paid: orderData.paymentMethod === 'vnpay' || orderData.paymentMethod === 'momo',
      billing: {
        first_name: orderData.customer.name,
        last_name: '',
        address_1: orderData.customer.address,
        city: orderData.customer.province || 'Hà Nội',
        state: orderData.customer.district || '',
        postcode: '100000',
        country: 'VN',
        email: orderData.customer.email || 'customer@pchub.vn',
        phone: orderData.customer.phone || '0901234567'
      },
      shipping: {
        first_name: orderData.customer.name,
        last_name: '',
        address_1: orderData.customer.address,
        city: orderData.customer.province || 'Hà Nội',
        state: orderData.customer.district || '',
        postcode: '100000',
        country: 'VN'
      },
      line_items: lineItems,
      shipping_lines: [
        {
          method_id: 'flat_rate',
          method_title: 'Phí vận chuyển PCHub',
          total: String(orderData.shippingFee)
        }
      ],
      customer_note: orderData.customer.note || ''
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, wooOrderId: data.id };
    } else {
      const errText = await res.text();
      console.warn('WooCommerce Order Creation response non-OK:', res.status, errText);
      return { success: false, error: `WooCommerce API HTTP ${res.status}` };
    }
  } catch (err: any) {
    console.error('Failed to create order on Sbuy WooCommerce API:', err);
    return { success: false, error: err.message };
  }
}
