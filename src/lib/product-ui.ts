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

  // If price is <= 500,000 OR isFlashSale is true, calculate discount strictly OVER 60% (61% - 70%)
  if (isFlashSale || price <= 500000) {
    const flashRates = [62, 65, 68, 64, 67, 63, 66, 69, 70];
    const targetRate = flashRates[absHash % flashRates.length];
    return Math.round((price / (1 - targetRate / 100)) / 10000) * 10000;
  }

  // Regular catalog products: 15% - 35% discount
  const rates = [15, 18, 20, 22, 25, 28, 30, 32, 35];
  const rate = rates[absHash % rates.length];
  return Math.round((price / (1 - rate / 100)) / 10000) * 10000;
}

export function getProductImage(product: { name?: string; category_name?: string; categoryName?: string; category_id?: string; category?: string; brand?: string; brand_name?: string; brandName?: string; image_url?: string; image?: string }): string {
  const url = product.image_url || product.image;
  const name = (product.name || '').toLowerCase();
  const cat = (product.category_name || product.categoryName || product.category || product.category_id || '').toLowerCase();

  // If valid image provided and not misattributed default GPU for CPU
  if (url && url !== '/images/gpu-strix.jpg' && url !== '/images/cpu-box.jpg') {
    return url;
  }

  if (cat.includes('cpu') || cat.includes('xử lý') || name.includes('cpu') || name.includes('intel') || name.includes('athlon') || name.includes('celeron') || name.includes('core i') || name.includes('ryzen')) {
    return '/images/cpu-box.jpg';
  }
  if (cat.includes('mainboard') || cat.includes('bo mạch') || name.includes('mainboard') || name.includes('z790') || name.includes('b760') || name.includes('b650') || name.includes('x670')) {
    return '/images/cat-mainboard.jpg';
  }
  if (cat.includes('ram') || cat.includes('bộ nhớ') || name.includes('ram') || name.includes('ddr4') || name.includes('ddr5') || name.includes('g.skill') || name.includes('corsair dominator')) {
    return '/images/ram-rgb.jpg';
  }
  if (cat.includes('ssd') || cat.includes('hdd') || cat.includes('ổ đĩa') || cat.includes('ổ cứng') || name.includes('ssd') || name.includes('nvme') || name.includes('samsung 990')) {
    return '/images/ssd-nvme.jpg';
  }
  if (cat.includes('psu') || cat.includes('nguồn') || name.includes('psu') || name.includes('corsair rm') || name.includes('80 plus')) {
    return '/images/cat-psu.jpg';
  }
  if (cat.includes('case') || cat.includes('vỏ') || name.includes('nzxt h9') || name.includes('tower')) {
    return '/images/hero-pc.jpg';
  }
  if (cat.includes('gpu') || cat.includes('vga') || cat.includes('card màn') || name.includes('rtx') || name.includes('gtx') || name.includes('rx ')) {
    return '/images/gpu-strix.jpg';
  }

  return url || '/images/cpu-box.jpg';
}


