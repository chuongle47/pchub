// PCHub AI Hardware & Commercial Query Parser
// Extracts Category, Brand, Price limits, and User Intent from natural language

export interface ParsedUserIntent {
  category?: 'cpu' | 'gpu' | 'ram' | 'storage' | 'mainboard' | 'psu' | 'case' | 'cooling' | 'monitor' | 'keyboard' | 'mouse' | 'headset' | 'speaker' | 'pc_build';
  categoryName?: string;
  brand?: string;
  brandSlug?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  targetPrice?: number | null;
  isPcBuild: boolean;
  isBudget: boolean;
  isPremium: boolean;
}

export const KNOWN_BRANDS_CONFIG = [
  { name: 'Logitech', slug: 'logitech', keywords: ['logitech', 'logicool', 'g102', 'g502', 'g304', 'g pro', 'm331', 'm220', 'k845', 'k380'] },
  { name: 'Dell', slug: 'dell', keywords: ['dell', 'ultrasharp', 'alienware'] },
  { name: 'Samsung', slug: 'samsung', keywords: ['samsung', 'odyssey'] },
  { name: 'LG', slug: 'lg', keywords: ['lg', 'ultragear'] },
  { name: 'Asus', slug: 'asus', keywords: ['asus', 'rog', 'tuf', 'proart'] },
  { name: 'MSI', slug: 'msi', keywords: ['msi', 'mag', 'mpg', 'gaming x', 'ventus'] },
  { name: 'Gigabyte', slug: 'gigabyte', keywords: ['gigabyte', 'aorus', 'eagle', 'windforce'] },
  { name: 'Sony', slug: 'sony', keywords: ['sony', 'wh-ch520', 'wh-1000xm'] },
  { name: 'HyperX', slug: 'hyperx', keywords: ['hyperx', 'cloud stinger', 'cloud ii', 'cloud iii', 'solocast', 'quadcast'] },
  { name: 'Rapoo', slug: 'rapoo', keywords: ['rapoo', 'v500', 'v700'] },
  { name: 'AOC', slug: 'aoc', keywords: ['aoc', 'agon', '24g2', '27g2'] },
  { name: 'Kingston', slug: 'kingston', keywords: ['kingston', 'fury', 'fury beast', 'kc3000', 'nv2'] },
  { name: 'Corsair', slug: 'corsair', keywords: ['corsair', 'vengeance', 'dominator'] },
  { name: 'Razer', slug: 'razer', keywords: ['razer', 'deathadder', 'viper', 'blackwidow'] },
  { name: 'Intel', slug: 'intel', keywords: ['intel', 'core i3', 'core i5', 'core i7', 'core i9'] },
  { name: 'AMD', slug: 'amd', keywords: ['amd', 'ryzen 5', 'ryzen 7', 'ryzen 9', 'ryzen'] },
  { name: 'Deepcool', slug: 'deepcool', keywords: ['deepcool', 'ak400', 'ak620', 'lt720', 'ls720'] },
  { name: 'Cooler Master', slug: 'cooler-master', keywords: ['cooler master', 'coolermaster', 'hyper 212'] },
  { name: 'JBL', slug: 'jbl', keywords: ['jbl', 'flip', 'charge', 'quantum'] },
  { name: 'Edifier', slug: 'edifier', keywords: ['edifier'] },
  { name: 'E-Dra', slug: 'e-dra', keywords: ['e-dra', 'edra'] }
];

export const CATEGORY_KEYWORDS_CONFIG = [
  { key: 'monitor' as const, name: 'Màn hình máy tính', words: ['màn hình', 'monitor', 'màn'] },
  { key: 'mouse' as const, name: 'Chuột máy tính', words: ['chuột không dây', 'chuột gaming', 'chuột', 'mouse'] },
  { key: 'keyboard' as const, name: 'Bàn phím', words: ['bàn phím cơ', 'bàn phím gaming', 'bàn phím', 'keyboard', 'phím cơ', 'phím'] },
  { key: 'headset' as const, name: 'Tai nghe', words: ['tai nghe không dây', 'tai nghe gaming', 'tai nghe', 'headphone', 'headset'] },
  { key: 'speaker' as const, name: 'Loa máy tính', words: ['loa bluetooth', 'loa máy tính', 'loa vi tính', 'loa', 'speaker'] },
  { key: 'cpu' as const, name: 'CPU - Vi xử lý', words: ['bộ vi xử lý', 'vi xử lý', 'cpu', 'chip'] },
  { key: 'gpu' as const, name: 'Card màn hình (VGA)', words: ['card màn hình', 'card đồ họa', 'vga', 'gpu', 'geforce', 'rtx', 'gtx', 'radeon'] },
  { key: 'ram' as const, name: 'RAM - Bộ nhớ trong', words: ['bộ nhớ trong', 'thanh ram', 'ram'] },
  { key: 'storage' as const, name: 'Ổ cứng SSD/HDD', words: ['ổ cứng ssd', 'ổ cứng hdd', 'ổ cứng', 'ssd', 'hdd', 'nvme', 'm.2'] },
  { key: 'mainboard' as const, name: 'Mainboard - Bo mạch chủ', words: ['bo mạch chủ', 'mainboard', 'bo mạch', 'main'] },
  { key: 'psu' as const, name: 'Nguồn máy tính (PSU)', words: ['nguồn máy tính', 'nguồn psu', 'nguồn', 'psu'] },
  { key: 'case' as const, name: 'Vỏ Case', words: ['vỏ máy tính', 'vỏ case', 'thùng máy', 'thùng pc', 'case'] },
  { key: 'cooling' as const, name: 'Tản nhiệt', words: ['tản nhiệt nước', 'tản nhiệt khí', 'tản nhiệt', 'tản aio', 'tản', 'fan case', 'quạt'] },
];

function parseAmount(numStr: string, unit: string): number | null {
  const val = parseFloat(numStr.replace(/,/g, '.'));
  if (isNaN(val)) return null;
  if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') return val * 1000;
  if (unit === 'tr' || unit === 'triệu' || unit === 'm') return val * 1000000;
  return val;
}

export function parseUserHardwareIntent(query: string): ParsedUserIntent {
  const lower = query.toLowerCase().trim();

  // 1. Detect PC Build intent vs single component/peripheral intent
  const isPcBuild = lower.includes('build pc') ||
    lower.includes('cấu hình pc') ||
    lower.includes('cấu hình máy') ||
    lower.includes('dàn pc') ||
    lower.includes('dàn máy') ||
    lower.includes('bộ máy tính') ||
    lower.includes('lắp pc') ||
    lower.includes('lắp máy') ||
    (lower.includes('build') && !lower.includes('chuột') && !lower.includes('phím') && !lower.includes('màn') && !lower.includes('tai nghe'));

  let detectedCategory: ParsedUserIntent['category'] = undefined;
  let detectedCategoryName: string | undefined = undefined;

  if (isPcBuild) {
    detectedCategory = 'pc_build';
    detectedCategoryName = 'Cấu hình PC trọn bộ';
  } else {
    for (const c of CATEGORY_KEYWORDS_CONFIG) {
      if (c.words.some(w => lower.includes(w))) {
        detectedCategory = c.key;
        detectedCategoryName = c.name;
        break;
      }
    }
  }

  // 2. Detect Brand
  let detectedBrand: string | undefined = undefined;
  let detectedBrandSlug: string | undefined = undefined;
  for (const b of KNOWN_BRANDS_CONFIG) {
    if (b.keywords.some(w => lower.includes(w))) {
      detectedBrand = b.name;
      detectedBrandSlug = b.slug;
      break;
    }
  }

  // 3. Detect Price Constraints
  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  let targetPrice: number | null = null;

  // Pattern: "1tr5", "2tr8", "dưới 1tr5"
  const trShorthand = lower.match(/(?:dưới|<|tối đa)?\s*(\d+)tr(\d+)\b/);
  if (trShorthand) {
    const val = parseFloat(trShorthand[1] + '.' + trShorthand[2]) * 1000000;
    if (lower.includes('dưới') || lower.includes('<') || lower.includes('tối đa') || lower.includes('đổ lại')) {
      maxPrice = val;
    } else if (lower.includes('trên') || lower.includes('>') || lower.includes('từ') || lower.includes('trở lên')) {
      minPrice = val;
    } else {
      targetPrice = val;
    }
  }

  // Pattern Range: "từ 500k đến 1 triệu", "20 - 25 triệu", "10tr - 15tr"
  const rangeMatch = lower.match(/(?:từ\s*)?(\d+(?:[\.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)?\s*(?:-|đến|tới)\s*(\d+(?:[\.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)\b/i);
  if (rangeMatch && !maxPrice) {
    const unit2 = rangeMatch[4].toLowerCase();
    const unit1 = rangeMatch[2] ? rangeMatch[2].toLowerCase() : unit2;
    minPrice = parseAmount(rangeMatch[1], unit1);
    maxPrice = parseAmount(rangeMatch[3], unit2);
  }

  // Pattern Under: "dưới 500k", "< 15 triệu", "tối đa 5tr", "5 triệu đổ lại"
  const underMatch = lower.match(/(?:dưới|<|tối đa|nhỏ hơn|<=)\s*(\d+(?:[\.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)?\b/i);
  if (underMatch && !maxPrice) {
    const num = parseFloat(underMatch[1].replace(/,/g, '.'));
    const unit = underMatch[2] ? underMatch[2].toLowerCase() : (num < 100 ? 'triệu' : 'k');
    maxPrice = parseAmount(underMatch[1], unit);
  }

  // Pattern Over: "trên 10 triệu", "> 500k", "từ 10 triệu trở lên"
  const overMatch = lower.match(/(?:trên|>|lớn hơn|>=)\s*(\d+(?:[\.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)?\s*(?:trở lên)?\b/i);
  if (overMatch && !minPrice && !rangeMatch) {
    const num = parseFloat(overMatch[1].replace(/,/g, '.'));
    const unit = overMatch[2] ? overMatch[2].toLowerCase() : (num < 100 ? 'triệu' : 'k');
    minPrice = parseAmount(overMatch[1], unit);
  }

  // Pattern Target / Approximate: "tầm 15 triệu", "khoảng 20tr", "build pc 20 triệu"
  const targetMatch = lower.match(/(?:tầm|khoảng|quanh|cỡ|ngân\s*sách|giá|build\s*pc|pc)\s*(?:gaming|đồ\s*họa|văn\s*phòng)?\s*(\d+(?:[\.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)?\b/i);
  if (targetMatch && !targetPrice && !minPrice && !maxPrice) {
    const num = parseFloat(targetMatch[1].replace(/,/g, '.'));
    const unit = targetMatch[2] ? targetMatch[2].toLowerCase() : (num < 100 ? 'triệu' : 'k');
    targetPrice = parseAmount(targetMatch[1], unit);
    if (targetPrice) {
      minPrice = targetPrice * 0.8;
      maxPrice = targetPrice * 1.2;
    }
  }

  // Direct standalone price: "15 triệu", "500k"
  if (!targetPrice && !minPrice && !maxPrice) {
    const standaloneMatch = lower.match(/\b(\d+(?:[\.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)\b/i);
    if (standaloneMatch) {
      const num = parseFloat(standaloneMatch[1].replace(/,/g, '.'));
      const unit = standaloneMatch[2].toLowerCase();
      targetPrice = parseAmount(standaloneMatch[1], unit);
      if (targetPrice) {
        minPrice = targetPrice * 0.8;
        maxPrice = targetPrice * 1.2;
      }
    }
  }

  const isBudget = lower.includes('giá rẻ') || lower.includes('tiết kiệm') || lower.includes('bình dân') || lower.includes('sinh viên');
  const isPremium = lower.includes('cao cấp') || lower.includes('xịn') || lower.includes('flagship') || lower.includes('tốt nhất');

  return {
    category: detectedCategory,
    categoryName: detectedCategoryName,
    brand: detectedBrand,
    brandSlug: detectedBrandSlug,
    minPrice,
    maxPrice,
    targetPrice,
    isPcBuild: !!isPcBuild,
    isBudget,
    isPremium
  };
}
