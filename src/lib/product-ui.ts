export function summarizeSpecs(specs: unknown, fallback = ''): string {
  if (!specs || typeof specs !== 'object') return fallback;
  const parts = Object.entries(specs as Record<string, unknown>)
    .slice(0, 4)
    .map(([, value]) => (Array.isArray(value) ? value.join(', ') : String(value)))
    .filter(Boolean);
  return parts.join(' · ') || fallback;
}

export function formatVnd(price: number): string {
  return Number(price || 0).toLocaleString('vi-VN') + '₫';
}

export function getProductOriginalPrice(price: number, slug: string = '', isFlashSale: boolean = false): number {
  if (!price || price <= 0) return 0;

  const s = slug.toLowerCase();

  // Known flash sale products mapped by both DB slug ID, readable slug, and default IDs
  const flashSaleMap: Record<string, number> = {
    'cooling-new-0024': 920000,                           // 350.000 ₫ -> 920.000 ₫ (-62%)
    'cooling-new-0067': 1230000,                          // 430.000 ₫ -> 1.230.000 ₫ (-65%)
    'ram-new-0110': 1530000,                              // 490.000 ₫ -> 1.530.000 ₫ (-68%)
    'cooling-new-0015': 1360000,                          // 490.000 ₫ -> 1.360.000 ₫ (-64%)
    'thermalright-tl-d12-pro-rev1': 920000,
    'thermalright-tl-d12-pro-rev2': 1230000,
    'crucial-ct8g4dfs8266-8gb-ddr4-2666mhz-r1': 1530000,
    'thermalright-assassin-x-120-refined-se-rev1': 1360000,
    'intel-core-i9-14900k': 36820000,
    'asus-rog-strix-geforce-rtx-4090': 157110000,
    'corsair-dominator-titanium-rgb-32gb-ddr5': 13410000,
    'samsung-990-pro-2tb-nvme': 13030000,
  };

  if (s && flashSaleMap[s]) {
    return flashSaleMap[s];
  }

  // Deterministic calculation based on slug hash
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // If price <= 500,000 OR isFlashSale is true, calculate discount strictly OVER 60% (61% - 70%)
  if (isFlashSale || price <= 500000) {
    const flashRates = [62, 65, 67, 64, 68, 63, 66, 69];
    const targetRate = flashRates[absHash % flashRates.length];
    return Math.round((price / (1 - targetRate / 100)) / 10000) * 10000;
  }

  // Regular catalog products: 18% - 25% discount
  const rates = [18, 20, 22, 25, 18, 20, 22, 24];
  const rate = rates[absHash % rates.length];
  return Math.round((price / (1 - rate / 100)) / 10000) * 10000;
}

export function resolveProductOriginalPrice(product: {
  price?: number;
  originalPrice?: number;
  original_price?: number;
  slug?: string;
}, isFlashSale: boolean = false): number {
  const p = Number(product.price) || 0;
  if (!p || p <= 0) return 0;

  const orig = Number(product.originalPrice || product.original_price || 0);

  // If price <= 500,000 or isFlashSale, calculate >60% discount original price so it's OVER 60%
  if (isFlashSale || p <= 500000 || !orig || orig <= p) {
    return getProductOriginalPrice(p, product.slug || '', true);
  }

  return orig;
}

export function getProductImage(product: {
  name?: string;
  category_name?: string;
  categoryName?: string;
  category_slug?: string;
  category_id?: string;
  category?: string;
  brand?: string;
  brand_name?: string;
  brandName?: string;
  image_url?: string;
  image?: string;
}): string {
  const url = product.image_url || product.image || '';
  const name = (product.name || '').toLowerCase();
  const cat = (
    product.category_slug ||
    product.category_name ||
    product.categoryName ||
    product.category ||
    product.category_id ||
    ''
  ).toLowerCase();
  const brand = (product.brand_name || product.brandName || product.brand || '').toLowerCase();

  const hasKeyword = (...keys: string[]) => keys.some(k => name.includes(k) || cat.includes(k) || brand.includes(k));

  let categoryImage = '/images/cpu-box.jpg';

  if (hasKeyword('lót chuột', 'pad chuột', 'goliathus', 'mouse pad', 'mousepad', 'deskpad', 'tấm lót')) {
    categoryImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
  } else if (hasKeyword('chuột', 'mouse', 'm331', 'g102', 'g502', 'viper', 'basilisk', 'orochi', 'deathadder', 'pulsar', 'ninjutso', 'g pro')) {
    categoryImage = 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60';
  } else if (hasKeyword('bàn phím', 'keyboard', 'keychron', 'akko', 'phím cơ', 'filco', 'ducky', 'varmilo', 'nuphy', 'leopold')) {
    categoryImage = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60';
  } else if (hasKeyword('tản nhiệt', 'cooling', 'cooler', 'gammaxx', 'cr-1000', 'cr1000', 'aio', 'quạt', 'fan', 'deepcool', 'thermalright', 'noctua', 'se-214', 'liquid', 'tản khí', 'tản nước', 'quạt tản')) {
    categoryImage = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=60';
  } else if (hasKeyword('tai nghe', 'headset', 'headphone', 'earphone', 'loa', 'speaker', 'audio', 'soundbar', 'g733', 'cloud ii', 'hyperx')) {
    categoryImage = '/images/cat-headset.jpg';
  } else if (hasKeyword('màn hình', 'monitor', 'display', '24 inch', '27 inch', '32 inch', '144hz', '165hz', '240hz', 'ips', 'va', 'oled', 'viewsonic', 'lg ultragear', 'samsung odyssey')) {
    categoryImage = '/images/cat-monitor.jpg';
  } else if (hasKeyword('mainboard', 'bo mạch', 'z790', 'b760', 'b650', 'x670', 'h610', 'a620', 'b550', 'z690', 'b450', 'tuf gaming b', 'rog strix b', 'mag b')) {
    categoryImage = '/images/cat-mainboard.jpg';
  } else if (hasKeyword('ram', 'ddr4', 'ddr5', 'bộ nhớ', 'corsair vengeance', 'g.skill', 'kingston fury', 't-force', 'trident z', 'dominator')) {
    categoryImage = '/images/ram-rgb.jpg';
  } else if (hasKeyword('ssd', 'hdd', 'ổ cứng', 'ổ đĩa', 'nvme', 'sata', 'samsung 990', 'kingston nv2', 'lexar', 'wd black', 'crucial')) {
    categoryImage = '/images/ssd-nvme.jpg';
  } else if (hasKeyword('psu', 'nguồn', 'power supply', '80 plus', 'corsair rm', 'cv650', 'antec', 'coolermaster mwe', 'cv750', 'deepcool pk')) {
    categoryImage = '/images/cat-psu.jpg';
  } else if (hasKeyword('case', 'vỏ máy', 'vỏ ca', 'chassis', 'nzxt h9', 'xigmatek', 'sama', 'montech', 'hyte', 'mik foz', 'mik focal', 'lian li')) {
    categoryImage = '/images/hero-pc.jpg';
  } else if (hasKeyword('gpu', 'vga', 'card màn', 'rtx', 'gtx', 'rx ', 'radeon', 'geforce')) {
    categoryImage = '/images/gpu-strix.jpg';
  } else if (hasKeyword('cpu', 'vi xử lý', 'intel', 'core i', 'ryzen', 'athlon', 'celeron', 'pentium', '7800x3d', '13700', '14700', '13900', '14900')) {
    categoryImage = '/images/cpu-box.jpg';
  } else if (hasKeyword('laptop', 'máy tính xách tay', 'macbook', 'vivobook', 'zenbook', 'thinkpad', 'aspire', 'loq')) {
    categoryImage = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60';
  } else if (hasKeyword('pc gaming', 'pc đồ họa', 'pc văn phòng', 'máy tính nguyên bộ', 'trọn bộ pc', 'bộ máy tính')) {
    categoryImage = '/images/build-neon.jpg';
  }

  const isGenericTowerImage = url.includes('1587202372775-e229f172b9d7');
  const isGenericLocalImage = url === '/images/gpu-strix.jpg' || url === '/images/cpu-box.jpg' || url === '/images/hero-pc.jpg';

  if (url && !isGenericTowerImage && !isGenericLocalImage) {
    return url;
  }

  return categoryImage;
}



