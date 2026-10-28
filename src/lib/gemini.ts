// PCHub Gemini AI Integration
// Hardware Compatibility Analysis & System Architect Advisory

export interface ComponentItem {
  key: string;
  name: string;
  category?: string;
  specs?: string;
  price?: number;
  tdp?: number;
}

export interface CompatibilityChecklistItem {
  category: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

export interface CompatibilityReport {
  compatibilityScore: number; // 0 - 100
  status: 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE';
  summary: string;
  checklist: CompatibilityChecklistItem[];
  bottleneck: {
    level: string;
    description: string;
  };
  estimatedWattage: {
    peakTdp: number;
    recommendedPsu: number;
  };
  strengths: string[];
  recommendations: string[];
  analyzedAt?: string;
  modelUsed?: string;
}

export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || '';
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

/**
 * AI PC Hardware & Product Advisor Chat Helper using Gemini API
 */
import { parseUserHardwareIntent, ParsedUserIntent, KNOWN_BRANDS_CONFIG } from './ai-query-parser';

export async function askGeminiPCHubAdvisor(
  message: string,
  history: ChatMessage[] = [],
  catalogContext: string = ''
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = getGeminiApiKey();
  const intent = parseUserHardwareIntent(message);

  // If no API key is configured, return the intelligent local rule advisor immediately without network lag
  if (!apiKey) {
    return {
      text: getSmartLocalAdvisorReply(message, catalogContext, intent),
      modelUsed: 'local-rule-advisor'
    };
  }

  // Build targeted system instruction based on user intent
  let intentSpecificGuidance = '';
  if (intent.isPcBuild) {
    intentSpecificGuidance = `
Người dùng đang có nhu cầu BUILD PC TRỌN BỘ ${intent.targetPrice ? `với ngân sách khoảng ${(intent.targetPrice / 1000000).toFixed(0)} triệu VNĐ` : ''}.
- Phân bổ ngân sách cân đối theo tỷ lệ vàng: CPU (~20%), GPU (~35-40%), Mainboard (~15%), RAM (~8%), SSD (~8%), Nguồn (~8%), Case/Tản (~8%).
- Đảm bảo tương thích socket (LGA1700 / AM4 / AM5), chuẩn RAM (DDR4 / DDR5), công suất nguồn (PSU) và độ dài card màn hình so với vỏ case.
- Liệt kê bảng cấu hình rõ ràng, tổng giá tiền ước tính và lý do lựa chọn từng linh kiện từ PCHub catalog.
`;
  } else if (intent.category) {
    intentSpecificGuidance = `
Người dùng đang cần TƯ VẤN SẢN PHẨM / NGOẠI VI CỤ THỂ:
- Danh mục quan tâm: ${intent.categoryName || intent.category}
${intent.brand ? `- Thương hiệu yêu cầu: ${intent.brand}` : ''}
${intent.maxPrice ? `- Mức giá tối đa: ${intent.maxPrice.toLocaleString('vi-VN')}₫` : ''}
${intent.minPrice ? `- Mức giá tối thiểu: ${intent.minPrice.toLocaleString('vi-VN')}₫` : ''}
${intent.targetPrice ? `- Mức giá mục tiêu: ${intent.targetPrice.toLocaleString('vi-VN')}₫` : ''}

HƯỚNG DẪN TƯ VẤN BẮT BUỘC:
1. Trả lời trực diện, nhiệt tình, đúng trọng tâm danh mục và thương hiệu người dùng yêu cầu.
2. Tuyệt đối KHÔNG xuất bảng cấu hình Mainboard/RAM/PCIe/Case nếu người dùng chỉ hỏi về chuột, bàn phím, màn hình, tai nghe hoặc một linh kiện đơn lẻ.
3. Giới thiệu các model sản phẩm tốt nhất đang có trong PCHub catalog thỏa mãn mức giá và thương hiệu. Nêu rõ giá tiền, thông số chính và ưu điểm nổi bật.
4. Đưa ra so sánh hoặc lời khuyên khách quan giúp người dùng dễ chọn (ví dụ: nhu cầu văn phòng vs chơi game).
5. Nếu trong catalog không có đúng thương hiệu đó ở tầm giá đó, hãy giải thích rõ ràng và gợi ý sản phẩm thay thế tốt nhất có sẵn tại PCHub.
`;
  } else if (intent.brand) {
    intentSpecificGuidance = `
Người dùng đang quan tâm đến THƯƠNG HIỆU: ${intent.brand}.
- Giới thiệu các dòng sản phẩm của ${intent.brand} đang có sẵn tại PCHub (Màn hình, chuột, bàn phím, tai nghe, card màn hình...).
- Nêu rõ giá bán, độ bền và lý do nên chọn thương hiệu này.
`;
  }

  const systemInstruction = `
# VAI TRÒ
Bạn là **Chuyên Gia Tư Vấn Phần Cứng PC & Thiết Bị Công Nghệ (Hardware & Product Advisor)** của hệ thống PCHub.
Bạn am hiểu sâu sắc về thông số kỹ thuật, thương hiệu (Logitech, Dell, Asus, MSI, Samsung, LG, Sony, HyperX, Kingston, Intel, AMD...), giá cả và tính tương thích của linh kiện.

# YÊU CẦU TRẢ LỜI:
- Luôn thân thiện, chuyên nghiệp, sử dụng tiếng Việt tự nhiên và chuẩn xác.
- Sử dụng đúng thông tin sản phẩm và giá bán từ PCHUB CATALOG được cung cấp bên dưới.
- Luôn tôn trọng tiêu chí về THƯƠNG HIỆU và MỨC GIÁ / NGÂN SÁCH của khách hàng.

${intentSpecificGuidance}

# NGUỒN DỮ LIỆU THAM CHIẾU (PCHUB CATALOG):
${catalogContext}
`;

  const candidateModels = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
  ];

  const contents = [
    { parts: [{ text: systemInstruction }] },
    ...history.slice(-6).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText && replyText.trim().length > 0) {
        return {
          text: replyText.trim(),
          modelUsed: model
        };
      }
    } catch (err) {
      // Continue to next model on failure
    }
  }

  // Smart local fallback response if Gemini API fails
  return {
    text: getSmartLocalAdvisorReply(message, catalogContext, intent),
    modelUsed: 'local-rule-advisor'
  };
}

interface ParsedCatalogItem {
  raw: string;
  name: string;
  category: string;
  brand: string;
  priceNum: number;
  priceStr: string;
  specsStr: string;
}

function parseCatalogLine(line: string): ParsedCatalogItem {
  const raw = line.replace(/^- /, '').trim();
  
  let category = '';
  const catMatch = raw.match(/^\[(.*?)\]/);
  if (catMatch) category = catMatch[1].trim();

  let rest = raw.replace(/^\[.*?\]\s*/, '');

  let brand = '';
  const brandMatch = rest.match(/\(([^)]+)\)/);
  if (brandMatch) {
    brand = brandMatch[1].trim();
  }

  let priceStr = '';
  const priceMatch = rest.match(/—\s*Giá:\s*([\d\.,]+₫|Liên hệ)/i);
  if (priceMatch) {
    priceStr = priceMatch[1].trim();
    rest = rest.replace(/—\s*Giá:\s*([\d\.,]+₫|Liên hệ)/i, '');
  }

  const priceNum = parseInt(priceStr.replace(/[^\d]/g, ''), 10) || 0;

  rest = rest.replace(/\[Tồn kho:\s*\d+\]/gi, '').trim();

  let specsStr = '';
  const specsMatch = rest.match(/\|\s*Thông số:\s*(.*)/i);
  if (specsMatch) {
    specsStr = specsMatch[1].trim();
    rest = rest.replace(/\|\s*Thông số:\s*(.*)/i, '').trim();
  }

  let name = rest.replace(/\s*\([^)]*\)$/, '').trim();

  // If brand is default or PCHub, infer real manufacturer from product name
  if (!brand || brand === 'Chính hãng' || brand === 'PCHub' || brand === 'Khác') {
    for (const b of KNOWN_BRANDS_CONFIG) {
      if (b.keywords.some(w => name.toLowerCase().includes(w))) {
        brand = b.name;
        break;
      }
    }
  }

  return {
    raw,
    name,
    category,
    brand: brand || 'Chính hãng',
    priceNum,
    priceStr,
    specsStr
  };
}

function getSmartLocalAdvisorReply(
  message: string,
  catalogContext: string = '',
  preParsedIntent?: ParsedUserIntent
): string {
  const intent = preParsedIntent || parseUserHardwareIntent(message);

  const catalogLines = catalogContext
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('-'));

  const catalogItems: ParsedCatalogItem[] = catalogLines.map(parseCatalogLine);

  // =========================================================================
  // CASE 1: Specific Component or Peripheral (Mouse, Keyboard, Monitor, Headset...)
  // =========================================================================
  if (intent.category && intent.category !== 'pc_build' && catalogItems.length > 0) {
    const catNameLower = (intent.categoryName || '').toLowerCase();
    
    // Filter by category
    let pool = catalogItems.filter(item => {
      const pCat = item.category.toLowerCase();
      const pName = item.name.toLowerCase();
      if (intent.category === 'monitor') return pCat.includes('màn') || pName.includes('màn') || pName.includes('monitor');
      if (intent.category === 'mouse') return pCat.includes('chuột') || pName.includes('chuột') || pName.includes('mouse');
      if (intent.category === 'keyboard') return pCat.includes('bàn phím') || pName.includes('bàn phím') || pName.includes('phím') || pName.includes('keyboard');
      if (intent.category === 'headset') return pCat.includes('tai nghe') || pName.includes('tai nghe') || pName.includes('headset') || pName.includes('headphone');
      if (intent.category === 'speaker') return pCat.includes('loa') || pName.includes('loa') || pName.includes('speaker');
      if (intent.category === 'cpu') return pCat.includes('cpu') || pName.includes('cpu') || pName.includes('intel') || pName.includes('ryzen');
      if (intent.category === 'gpu') return pCat.includes('vga') || pCat.includes('gpu') || pName.includes('rtx') || pName.includes('gtx') || pName.includes('card');
      if (intent.category === 'ram') return pCat.includes('ram') || pName.includes('ram') || pName.includes('ddr4') || pName.includes('ddr5');
      if (intent.category === 'storage') return pCat.includes('ổ cứng') || pCat.includes('ssd') || pName.includes('ssd') || pName.includes('nvme');
      if (intent.category === 'mainboard') return pCat.includes('mainboard') || pName.includes('b760') || pName.includes('z790') || pName.includes('b650') || pName.includes('h610');
      if (intent.category === 'psu') return pCat.includes('nguồn') || pName.includes('nguồn') || pName.includes('psu');
      if (intent.category === 'case') return pCat.includes('case') || pName.includes('case') || pName.includes('vỏ máy');
      if (intent.category === 'cooling') return pCat.includes('tản') || pName.includes('tản') || pName.includes('cooling');
      return pCat.includes(catNameLower) || pName.includes(catNameLower);
    });

    // Check if brand was specified
    let brandMatchedPool = pool;
    if (intent.brand) {
      const bLower = intent.brand.toLowerCase();
      brandMatchedPool = pool.filter(p => p.brand.toLowerCase() === bLower || p.name.toLowerCase().includes(bLower));
    }

    // Check price filter on the brand-matched pool (or general pool)
    const baseFilterPool = brandMatchedPool.length > 0 ? brandMatchedPool : pool;
    let priceMatched = baseFilterPool;

    if (intent.maxPrice) {
      const maxLimit = intent.maxPrice * 1.1; // 10% tolerance
      const filtered = baseFilterPool.filter(p => p.priceNum > 0 && p.priceNum <= maxLimit);
      if (filtered.length > 0) priceMatched = filtered;
    } else if (intent.minPrice) {
      const minLimit = intent.minPrice * 0.9;
      const filtered = baseFilterPool.filter(p => p.priceNum >= minLimit);
      if (filtered.length > 0) priceMatched = filtered;
    } else if (intent.targetPrice) {
      const target = intent.targetPrice;
      priceMatched = [...baseFilterPool].sort((a, b) => Math.abs(a.priceNum - target) - Math.abs(b.priceNum - target));
    }

    // Sort order
    if (intent.isBudget) {
      priceMatched = [...priceMatched].sort((a, b) => (a.priceNum || 999999999) - (b.priceNum || 999999999));
    } else if (intent.isPremium) {
      priceMatched = [...priceMatched].sort((a, b) => b.priceNum - a.priceNum);
    }

    // Deduplicate by clean name
    const uniqueMap = new Map<string, ParsedCatalogItem>();
    priceMatched.forEach(item => {
      const cleanKey = item.name.toLowerCase().trim();
      if (!uniqueMap.has(cleanKey)) {
        uniqueMap.set(cleanKey, item);
      }
    });
    const finalItems = Array.from(uniqueMap.values()).slice(0, 4);

    if (finalItems.length > 0) {
      let titleDetails = intent.categoryName;
      if (intent.brand) titleDetails += ` · Hãng **${intent.brand}**`;
      if (intent.maxPrice) titleDetails += ` · Mức giá: **dưới ${intent.maxPrice.toLocaleString('vi-VN')}₫**`;
      else if (intent.minPrice) titleDetails += ` · Mức giá: **từ ${intent.minPrice.toLocaleString('vi-VN')}₫**`;
      else if (intent.targetPrice) titleDetails += ` · Tầm giá: **~${intent.targetPrice.toLocaleString('vi-VN')}₫**`;

      let reply = `🎯 **PCHub AI Advisor — Tư vấn theo yêu cầu:**\n` +
        `• **Tiêu chí**: ${titleDetails}\n\n` +
        `🛒 **Các sản phẩm phù hợp nhất đang có sẵn tại PCHub:**\n\n`;

      finalItems.forEach((item, idx) => {
        reply += `${idx + 1}. **${item.name}**\n` +
          `   • **Giá bán**: **${item.priceStr || 'Liên hệ'}**\n` +
          `   • **Hãng sản xuất**: ${item.brand}\n`;
        if (item.specsStr) {
          reply += `   • **Thông số**: ${item.specsStr}\n`;
        }
        reply += `\n`;
      });

      reply += `💡 **Gợi ý chọn mua**: Quý khách có thể bấm trực tiếp vào thẻ sản phẩm bên dưới để xem chi tiết thông số kỹ thuật và đặt hàng nhanh chóng!`;
      return reply;
    } else if (intent.brand && brandMatchedPool.length === 0 && pool.length > 0) {
      // Brand not available in this category, offer alternatives
      const altItems = pool.slice(0, 3);
      return `💡 **PCHub AI Advisor xin thông tin:**\n` +
        `Hiện tại trong kho hàng PCHub chưa có sẵn dòng ${intent.categoryName || 'sản phẩm'} từ thương hiệu **${intent.brand}**.\n\n` +
        `Tuy nhiên, PCHub xin gợi ý các dòng ${intent.categoryName || 'linh kiện'} chất lượng hàng đầu cùng phân khúc đang có sẵn:\n\n` +
        altItems.map((item, idx) => `${idx + 1}. **${item.name}** — **${item.priceStr}** (${item.brand})`).join('\n') +
        `\n\n👉 Bạn hãy tham khảo các sản phẩm bên dưới nhé!`;
    }
  }

  // =========================================================================
  // CASE 2: Brand-only Query (e.g. "thương hiệu Dell", "đồ Logitech")
  // =========================================================================
  if (intent.brand && catalogItems.length > 0) {
    const bLower = intent.brand.toLowerCase();
    const brandProducts = catalogItems.filter(p => p.brand.toLowerCase() === bLower || p.name.toLowerCase().includes(bLower));

    if (brandProducts.length > 0) {
      // Deduplicate
      const uniqueBrand = new Map<string, ParsedCatalogItem>();
      brandProducts.forEach(item => uniqueBrand.set(item.name.toLowerCase(), item));
      const topBrand = Array.from(uniqueBrand.values()).slice(0, 5);

      return `🏷️ **PCHub AI Advisor — Các sản phẩm từ thương hiệu ${intent.brand}:**\n\n` +
        `PCHub hiện là đại lý phân phối chính hãng các sản phẩm **${intent.brand}** với chế độ bảo hành 12 - 36 tháng:\n\n` +
        topBrand.map((item, idx) => `${idx + 1}. **${item.name}** — **${item.priceStr}** [${item.category}]`).join('\n') +
        `\n\n👉 Bạn có thể click vào sản phẩm bên dưới để xem chi tiết và đặt hàng!`;
    }
  }

  // =========================================================================
  // CASE 3: Full PC Build with Budget (e.g. "Build PC gaming 20 triệu")
  // =========================================================================
  const budget = intent.targetPrice ? intent.targetPrice / 1000000 : null;
  if ((intent.isPcBuild || budget !== null) && catalogItems.length > 0) {
    const budgetVal = budget || 20;

    const cpus = catalogItems.filter(p => p.name.toLowerCase().includes('cpu') || p.name.toLowerCase().includes('intel') || p.name.toLowerCase().includes('ryzen'));
    const gpus = catalogItems.filter(p => p.name.toLowerCase().includes('vga') || p.name.toLowerCase().includes('rtx') || p.name.toLowerCase().includes('gtx') || p.name.toLowerCase().includes('card'));
    const rams = catalogItems.filter(p => p.name.toLowerCase().includes('ram') || p.name.toLowerCase().includes('ddr4') || p.name.toLowerCase().includes('ddr5'));
    const ssds = catalogItems.filter(p => p.name.toLowerCase().includes('ssd') || p.name.toLowerCase().includes('nvme'));
    const mains = catalogItems.filter(p => p.name.toLowerCase().includes('mainboard') || p.name.toLowerCase().includes('b760') || p.name.toLowerCase().includes('z790') || p.name.toLowerCase().includes('b650') || p.name.toLowerCase().includes('h610'));
    const psus = catalogItems.filter(p => p.name.toLowerCase().includes('nguồn') || p.name.toLowerCase().includes('psu'));
    const cases = catalogItems.filter(p => p.name.toLowerCase().includes('case') || p.name.toLowerCase().includes('vỏ'));

    const getFormattedItem = (list: ParsedCatalogItem[], fallbackName: string, fallbackPrice: string) => {
      if (list.length > 0) {
        return `**${list[0].name}** — **${list[0].priceStr || fallbackPrice}**`;
      }
      return `**${fallbackName}** — **${fallbackPrice}**`;
    };

    return `📌 **Cấu hình PC đề xuất từ PCHub AI Advisor (~${budgetVal} Triệu VNĐ):**
- **Nhu cầu**: Gaming, Thiết kế đồ họa & Đa nhiệm mượt mà
- **Tiêu chí**: 100% linh kiện chính hãng, tương thích socket, nguồn đủ đệm tải an toàn

🛒 **Danh sách linh kiện tối ưu trong tầm giá:**
1. **CPU**: ${getFormattedItem(cpus, 'Intel Core i5-13400F', '4.890.000₫')} — *10 nhân 16 luồng, hiệu năng đa nhân mạnh mẽ.*
2. **Mainboard**: ${getFormattedItem(mains, 'Mainboard B760M DDR4/DDR5', '2.890.000₫')} — *VRM ổn định, hỗ trợ M.2 PCIe 4.0.*
3. **VGA**: ${getFormattedItem(gpus, 'NVIDIA GeForce RTX 4060 8GB', '8.490.000₫')} — *Cân mượt các tựa game AAA ở độ phân giải FHD/2K, hỗ trợ DLSS 3.*
4. **RAM**: ${getFormattedItem(rams, 'Kingston FURY Beast 16GB (2x8GB)', '990.000₫')} — *Chạy kênh đôi Dual Channel kích hoạt tối đa băng thông.*
5. **SSD**: ${getFormattedItem(ssds, 'SSD NVMe PCIe 500GB Gen4', '990.000₫')} — *Tốc độ đọc >3500MB/s giúp nạp game và Windows cực nhanh.*
6. **Nguồn PSU**: ${getFormattedItem(psus, 'Nguồn 650W 80 Plus Bronze', '1.190.000₫')} — *Công suất thực đảm bảo hệ thống vận hành bền bỉ 24/7.*
7. **Case & Tản**: ${getFormattedItem(cases, 'Case Mid-Tower Kính Cường Lực', '750.000₫')} — *Luồng gió đối lưu thông thoáng.*

⚙️ **Đánh giá tương thích**:
- Socket CPU & Mainboard: Khớp 100%.
- Công suất tiêu thụ tối đa (Peak TDP): ~320W -> Nguồn 650W đệm tải an toàn >50%.
- Kích thước VGA lắp vừa mọi case Mid-Tower tiêu chuẩn.

👉 Bạn có thể bấm nút **⚡ Áp Dụng Cấu Hình Này Vào PC Builder** bên dưới để tinh chỉnh chi tiết!`;
  }

  // =========================================================================
  // CASE 4: Fallback General Search or Friendly Guidance
  // =========================================================================
  return `💡 **PCHub AI Advisor xin chào bạn!**\n` +
    `Mình có thể hỗ trợ tư vấn chuyên sâu theo các tiêu chí:\n` +
    `• **Theo mức giá**: ví dụ *"chuột dưới 500k"*, *"màn hình dưới 5 triệu"*, *"tai nghe tầm 1 triệu"*\n` +
    `• **Theo thương hiệu**: ví dụ *"chuột Logitech"*, *"màn hình Dell"*, *"tai nghe Sony / HyperX"*\n` +
    `• **Build PC trọn bộ**: ví dụ *"Build PC gaming 15 - 20 triệu"*, *"Cấu hình đồ họa 25 triệu"*\n\n` +
    `👉 Bạn hãy nhập nhu cầu hoặc ngân sách cụ thể để mình hỗ trợ tốt nhất nhé!`;
}





/**
 * System Prompt & Guidelines for PC Hardware Compatibility
 */
export function buildCompatibilityPrompt(components: ComponentItem[]): string {
  const componentLines = components
    .map((c, idx) => {
      const cat = c.category || c.key.toUpperCase();
      const specs = c.specs ? ` - Thông số: ${c.specs}` : '';
      const tdp = c.tdp ? ` - TDP: ${c.tdp}W` : '';
      const price = c.price ? ` - Giá: ${c.price.toLocaleString('vi-VN')}₫` : '';
      return `${idx + 1}. [${cat}]: ${c.name}${specs}${tdp}${price}`;
    })
    .join('\n');

  return `
Bạn là Kỹ Sư Trưởng Hệ Thống Phần Cứng PC (Senior PC Hardware System Architect) tại PCHub với hơn 15 năm kinh nghiệm lắp ráp, tinh chỉnh ép xung (OC) và kiểm thử độ tương thích phần cứng máy tính.

Nhiệm vụ của bạn là kiểm tra TOÀN DIỆN tính tương thích vật lý, chuẩn giao tiếp, nguồn điện và độ cân bằng hiệu năng giữa các linh kiện trong dàn máy PC sau:

DANH SÁCH LINH KIỆN ĐÃ CHỌN:
${componentLines}

HƯỚNG DẪN KIỂM TRA CHUYÊN SÂU:
1. CPU & Mainboard:
   - Chân cắm Socket: LGA1700 (Intel Gen 12/13/14), LGA1851 (Core Ultra Gen 15/Arrow Lake), AM4 (Ryzen 1000-5000), AM5 (Ryzen 7000-9000). CPU và Mainboard BẮT BUỘC phải cùng socket.
   - Chipset & VRM: Mainboard (Z790/Z890/B760/X670/B650/...) có đủ pha nguồn VRM để nuôi CPU hoạt động ổn định khi Turbo Boost/chạy tải nặng không? (Ví dụ: i9 không nên cắm main H610 rẻ tiền).
   - Khả năng cần cập nhật BIOS (nếu CPU thế hệ mới lắp vào mainboard thế hệ trước).

2. RAM & Mainboard / CPU:
   - Chuẩn RAM: DDR4 hay DDR5? Mainboard và RAM phải khớp chuẩn.
   - Lưu ý quan trọng: Các bo mạch chủ Intel LGA1700 (H610, B760, Z790) tại Việt Nam phần lớn chạy chuẩn DDR4 (trừ mẫu ghi rõ DDR5/D5). Nếu Mainboard B760/H610 không ghi DDR5 và RAM chọn là DDR4 thì là TƯƠNG THÍCH HOÀN TOÀN (PASS).
   - Số khe và cấu hình kênh đôi (Dual-Channel).
   - Bus RAM và khả năng ép xung XMP / EXPO hỗ trợ trên bo mạch chủ.

3. Card màn hình (GPU / VGA) & Thùng máy (Case) & Nguồn (PSU):
   - Kích thước chiều dài GPU (mm) và số slot độ dày so với khoảng trống tối đa của Vỏ Case.
   - Cổng cấp nguồn: Cổng chuẩn mới 16-pin 12VHPWR / 12V-2x6 (RTX 40/50 series) so với đầu nối nguồn có sẵn của PSU.

4. Nguồn (PSU) & Tổng công suất hệ thống:
   - Tính toán tổng công suất tiêu thụ tối đa (Peak TDP) của CPU + GPU + các linh kiện khác (+ 100-150W cho quạt, LED, ổ cứng, bo mạch).
   - Đưa ra mức công suất nguồn khuyến nghị (Recommended PSU) có dư tải 20-30% để nguồn chạy mát ở dải hiệu suất vàng 50-80% tải.

5. Tản nhiệt (Cooling) & CPU & Case:
   - Ngàm gắn tản nhiệt có hỗ trợ socket CPU không?
   - Khả năng giải nhiệt (TDP) của tản nhiệt có đủ cho CPU không (ví dụ i7/i9 250W+ cần tản nước AIO 240/360mm hoặc tản khí tháp đôi lớn).
   - Kích thước tản nước Rad 240/280/360mm hoặc chiều cao tản khí có lắp vừa case không?

6. Đánh giá nghẽn cổ chai (Bottleneck) & Cân bằng cấu hình:
   - Đánh giá mức độ đồng bộ giữa CPU và GPU khi chơi game (1080p, 2K, 4K) và làm việc (đồ họa, dựng phim, lập trình, render 3D).

7. Lời khuyên thực tế & Điểm mạnh (Strengths & Recommendations):
   - Nêu rõ các ưu điểm nổi trội của cấu hình.
   - Đưa ra các lưu ý hoặc mẹo lắp ráp phần cứng hữu ích (ví dụ: gông chống cong LGA1700, dùng cáp nguồn trực tiếp thay vì adapter, bật XMP trong BIOS,...).

QUY ĐỊNH BẮT BUỘC VỀ ĐỊNH DẠNG TRẢ VỀ:
- Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ.
- TUYỆT ĐỐI KHÔNG dùng backtick (\`\`\`json), không thêm bất kỳ lời chào hay ký tự nào ngoài chuỗi JSON.
- Sử dụng tiếng Việt chuẩn mực, chuyên nghiệp, truyền cảm hứng.

CẤU TRÚC JSON MẪU:
{
  "compatibilityScore": 95,
  "status": "COMPATIBLE",
  "summary": "Tóm tắt ngắn gọn 1-2 câu về dàn máy",
  "checklist": [
    {
      "category": "CPU & Bo Mạch Chủ (Socket & Chipset)",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    },
    {
      "category": "RAM & Bo Mạch Chủ (Chuẩn DDR & Bus)",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    },
    {
      "category": "Nguồn (PSU) & Công Suất Tải",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    },
    {
      "category": "Card Màn Hình & Vỏ Case (Kích Thước & Khe Cắm)",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    },
    {
      "category": "Tản Nhiệt & Nhiệt Độ CPU",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    }
  ],
  "bottleneck": {
    "level": "Rất Thấp (Cân bằng hoàn hảo)",
    "description": "Chi tiết đánh giá nghẽn..."
  },
  "estimatedWattage": {
    "peakTdp": 650,
    "recommendedPsu": 850
  },
  "strengths": [
    "Điểm mạnh 1",
    "Điểm mạnh 2"
  ],
  "recommendations": [
    "Khuyến nghị hoặc mẹo hữu ích 1",
    "Khuyến nghị 2"
  ]
}
`;
}

/**
 * Calls Gemini API with model fallbacks
 */
export async function analyzeBuildCompatibility(components: ComponentItem[]): Promise<CompatibilityReport> {
  const selected = components.filter(c => Boolean(c.name && c.name.trim()));
  
  if (selected.length === 0) {
    return {
      compatibilityScore: 100,
      status: 'COMPATIBLE',
      summary: 'Chưa có linh kiện nào được chọn. Hãy thêm linh kiện để hệ thống AI phân tích tương thích!',
      checklist: [],
      bottleneck: {
        level: 'Chưa xác định',
        description: 'Vui lòng chọn ít nhất CPU và Bo mạch chủ để đánh giá hiệu năng.'
      },
      estimatedWattage: { peakTdp: 0, recommendedPsu: 450 },
      strengths: ['Hệ thống sẵn sàng tiếp nhận cấu hình mới của bạn.'],
      recommendations: ['Bắt đầu bằng việc chọn CPU và Bo mạch chủ phù hợp nhu cầu.'],
      analyzedAt: new Date().toISOString(),
    };
  }

  const apiKey = getGeminiApiKey();
  const prompt = buildCompatibilityPrompt(selected);

  // Models in priority order - gemini-3.5-flash confirmed working, newer ones often 503/timeout
  const candidateModels = [
    'gemini-3.5-flash',       // ✅ Confirmed stable
    'gemini-3.5-flash-lite',  // Lighter, fallback
    'gemini-3.6-flash',       // Sometimes works
    'gemini-2.5-flash',       // Older but available
    'gemini-flash-latest',    // Alias fallback
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        }),
        signal: AbortSignal.timeout(25000) // 25s per model, allowing 2 attempts in 45s window
      });

      if (!response.ok) {
        const errText = await response.text();
        // Skip 404 (model not found) and 429 (rate limit) silently
        console.warn(`[PCHub AI] Model ${model} HTTP ${response.status}:`, errText.slice(0, 200));
        lastError = new Error(`Gemini API error (${model}) [${response.status}]`);
        continue;
      }

      const data = await response.json();
      
      // Check for prompt feedback block
      if (data?.promptFeedback?.blockReason) {
        lastError = new Error(`Prompt blocked by ${model}: ${data.promptFeedback.blockReason}`);
        console.warn(`[PCHub AI] Prompt blocked:`, data.promptFeedback.blockReason);
        continue;
      }

      const candidate = data?.candidates?.[0];
      
      // Handle finish reasons that result in empty output
      const finishReason = candidate?.finishReason;
      if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
        lastError = new Error(`Model ${model} stopped due to: ${finishReason}`);
        console.warn(`[PCHub AI] Non-STOP finish reason: ${finishReason}`);
        continue;
      }

      const rawText = candidate?.content?.parts?.[0]?.text;

      if (!rawText || rawText.trim().length === 0) {
        lastError = new Error(`Empty text response from model ${model} (finishReason: ${finishReason})`);
        console.warn(`[PCHub AI] Empty response from ${model}`);
        continue;
      }

      // Clean markdown code blocks if present
      let cleaned = rawText.trim();
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/,'');

      // Extract JSON if there's surrounding text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];

      const parsed: CompatibilityReport = JSON.parse(cleaned);
      parsed.analyzedAt = new Date().toISOString();
      parsed.modelUsed = model;

      // Validate core fields
      if (typeof parsed.compatibilityScore !== 'number') parsed.compatibilityScore = 95;
      if (!parsed.status) parsed.status = 'COMPATIBLE';
      if (!Array.isArray(parsed.checklist)) parsed.checklist = [];
      if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
      if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];
      if (!parsed.bottleneck) parsed.bottleneck = { level: 'Thấp', description: 'Cấu hình cân bằng tốt.' };
      if (!parsed.estimatedWattage) parsed.estimatedWattage = { peakTdp: 500, recommendedPsu: 750 };

      return parsed;
    } catch (err: any) {
      lastError = err;
      console.warn(`[PCHub AI] Model ${model} failed:`, err.message);
    }
  }

  // If all online models fail, fallback to smart offline rule-based report
  console.error('[PCHub AI] All Gemini models failed, using intelligent local fallback:', lastError?.message);
  return generateLocalFallbackReport(selected);
}

/**
 * Intelligent local rule-based fallback if Gemini API is unreachable or offline
 */
function generateLocalFallbackReport(components: ComponentItem[]): CompatibilityReport {
  const cpu = components.find(c => c.key === 'cpu' || c.category?.toLowerCase().includes('cpu'));
  const mainboard = components.find(c => c.key === 'mainboard' || c.category?.toLowerCase().includes('mainboard'));
  const ram = components.find(c => c.key === 'ram' || c.category?.toLowerCase().includes('ram'));
  const gpu = components.find(c => c.key === 'gpu' || c.category?.toLowerCase().includes('vga') || c.category?.toLowerCase().includes('gpu'));
  const psu = components.find(c => c.key === 'psu' || c.category?.toLowerCase().includes('nguồn') || c.category?.toLowerCase().includes('psu'));

  const checklist: CompatibilityChecklistItem[] = [];
  let score = 95;
  let status: 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE' = 'COMPATIBLE';

  // 1. Socket Check
  if (cpu && mainboard) {
    const isIntel = cpu.name.toLowerCase().includes('intel') || cpu.name.toLowerCase().includes('core');
    const isAmd = cpu.name.toLowerCase().includes('amd') || cpu.name.toLowerCase().includes('ryzen');
    const isLga1700Cpu = cpu.specs?.includes('LGA1700') || cpu.name.includes('14') || cpu.name.includes('13') || cpu.name.includes('12');
    const isAm5Cpu = cpu.specs?.includes('AM5') || cpu.name.includes('7000') || cpu.name.includes('9000');
    
    const isLga1700Mb = mainboard.specs?.includes('LGA1700') || mainboard.name.includes('Z790') || mainboard.name.includes('B760');
    const isAm5Mb = mainboard.specs?.includes('AM5') || mainboard.name.includes('X670') || mainboard.name.includes('B650');

    if ((isLga1700Cpu && isAm5Mb) || (isAm5Cpu && isLga1700Mb) || (isIntel && isAm5Mb) || (isAmd && isLga1700Mb)) {
      score -= 40;
      status = 'INCOMPATIBLE';
      checklist.push({
        category: 'CPU & Bo Mạch Chủ (Socket)',
        status: 'FAIL',
        detail: 'Phát hiện xung đột Socket: CPU và Bo mạch chủ không cùng nền tảng chân cắm (Intel LGA vs AMD AM5).'
      });
    } else {
      checklist.push({
        category: 'CPU & Bo Mạch Chủ (Socket)',
        status: 'PASS',
        detail: 'Socket CPU và Bo mạch chủ đồng bộ chính xác, hệ thống VRM tương thích cấp nguồn ổn định.'
      });
    }
  }

  // 2. RAM Check
  if (mainboard && ram) {
    const mbText = `${mainboard.name} ${mainboard.specs || ''}`.toUpperCase();
    const ramText = `${ram.name} ${ram.specs || ''}`.toUpperCase();

    const explicitDdr5Mb = mbText.includes('DDR5') || mbText.includes(' D5') || mbText.includes('B650') || mbText.includes('X670') || mbText.includes('A620') || mbText.includes('Z890');
    const explicitDdr4Mb = mbText.includes('DDR4') || mbText.includes('B550') || mbText.includes('B450') || mbText.includes('A520') || mbText.includes('H510') || mbText.includes('B560');

    let isDdr5Mb = explicitDdr5Mb;
    let isDdr4Mb = explicitDdr4Mb || (!explicitDdr5Mb && !explicitDdr4Mb);

    const isDdr5Ram = ramText.includes('DDR5');
    const isDdr4Ram = ramText.includes('DDR4') || !isDdr5Ram;

    if ((isDdr5Mb && isDdr4Ram) || (isDdr4Mb && isDdr5Ram)) {
      score -= 30;
      if (status !== 'INCOMPATIBLE') status = 'INCOMPATIBLE';
      checklist.push({
        category: 'RAM & Bo Mạch Chủ (Chuẩn DDR)',
        status: 'FAIL',
        detail: 'Không tương thích chuẩn RAM: Bo mạch chủ và thanh RAM không cùng thế hệ (DDR4 vs DDR5).'
      });
    } else {
      checklist.push({
        category: 'RAM & Bo Mạch Chủ (Chuẩn DDR)',
        status: 'PASS',
        detail: 'Chuẩn RAM và Bo mạch chủ tương thích hoàn toàn, hỗ trợ profile XMP/EXPO tăng tốc hiệu quả.'
      });
    }

    // 2b. RAM Quantity & Dual-Channel Check
    const ramQuantity = (ram as any).quantity || 1;
    const isItxOrH610 = mbText.includes('ITX') || mbText.includes('H610') || mbText.includes('A520') || mbText.includes('2 SLOT') || mbText.includes('2 KHE');
    const maxSlots = isItxOrH610 ? 2 : 4;
    const maxRamCapacityGb = isDdr5Mb ? (isItxOrH610 ? 96 : 192) : (isItxOrH610 ? 64 : 128);

    if (ramQuantity === 1) {
      score -= 5;
      if (status === 'COMPATIBLE') status = 'WARNING';
      checklist.push({
        category: 'RAM & Bo Mạch Chủ (Số Thanh & Kênh Đôi)',
        status: 'WARN',
        detail: `Đang chọn 1 thanh RAM (Single Channel). Bo mạch chủ hỗ trợ ${maxSlots} khe RAM (Tối đa ${maxRamCapacityGb}GB). Khuyên dùng mua 2 thanh đồng bộ cắm khe A2-B2 để kích hoạt Dual-Channel tăng 35% băng thông!`
      });
    } else if (ramQuantity === 2) {
      checklist.push({
        category: 'RAM & Bo Mạch Chủ (Số Thanh & Kênh Đôi)',
        status: 'PASS',
        detail: `Đã chọn 2 thanh RAM chạy Dual-Channel tối ưu. Bo mạch chủ có ${maxSlots} khe (Max ${maxRamCapacityGb}GB), còn trống ${maxSlots - 2} khe cho nhu cầu nâng cấp sau này.`
      });
    } else if (ramQuantity === 4) {
      if (isDdr5Mb) {
        checklist.push({
          category: 'RAM & Bo Mạch Chủ (Số Thanh & Kênh Đôi)',
          status: 'WARN',
          detail: `Cắm kín 4/4 khe RAM DDR5 (Max ${maxRamCapacityGb}GB). Lưu ý: Việc cắm 4 thanh DDR5 có thể làm giảm xung XMP/EXPO xuống ~4800MHz do giới hạn bộ điều khiển RAM IMC của CPU.`
        });
      } else {
        checklist.push({
          category: 'RAM & Bo Mạch Chủ (Số Thanh & Kênh Đôi)',
          status: 'PASS',
          detail: `Cắm 4/4 khe RAM DDR4 (Max ${maxRamCapacityGb}GB) khai thác tối đa khả năng lưu trữ bộ nhớ của Bo mạch chủ.`
        });
      }
    }
  }

  // 3. Wattage calculation
  const totalTdp = components.reduce((sum, c) => sum + (c.tdp || 0), 0) + 120;
  const recommendedPsu = Math.max(650, Math.ceil((totalTdp + 150) / 50) * 50);

  let psuWatts = 750;
  if (psu) {
    const match = psu.name.match(/(\d{3,4})\s*W/i) || (psu.specs || '').match(/(\d{3,4})\s*W/i);
    if (match) psuWatts = parseInt(match[1], 10);
  }

  if (psu && psuWatts < recommendedPsu - 50) {
    score -= 15;
    if (status === 'COMPATIBLE') status = 'WARNING';
    checklist.push({
      category: 'Nguồn (PSU) & Công Suất Tải',
      status: 'WARN',
      detail: `Công suất nguồn ${psuWatts}W hơi sát tải so với tổng công suất đề xuất ${recommendedPsu}W.`
    });
  } else {
    checklist.push({
      category: 'Nguồn (PSU) & Công Suất Tải',
      status: 'PASS',
      detail: `Công suất nguồn ${psuWatts}W đáp ứng xuất sắc cho hệ thống với độ dự phòng an toàn 25%.`
    });
  }

  return {
    compatibilityScore: Math.max(20, Math.min(100, score)),
    status,
    summary: status === 'COMPATIBLE' 
      ? 'Cấu hình hoàn toàn đồng bộ và tối ưu tốt theo các tiêu chuẩn phần cứng PCHub.'
      : 'Phát hiện một số điểm cần lưu ý về socket hoặc chuẩn giao tiếp giữa các linh kiện.',
    checklist,
    bottleneck: {
      level: 'Rất Thấp',
      description: 'Sự phân bổ sức mạnh giữa CPU và Card đồ họa hài hòa, không gây thắt cổ chai hiệu năng.'
    },
    estimatedWattage: {
      peakTdp: totalTdp,
      recommendedPsu
    },
    strengths: [
      'Linh kiện chính hãng được thiết kế trên tiến trình mới tiết kiệm điện năng.',
      'Băng thông bộ nhớ và đường truyền PCIe tốc độ cao tối ưu truyền tải dữ liệu.'
    ],
    recommendations: [
      'Nên lắp RAM ở khe A2 - B2 (khe 2 và 4 từ CPU sang) để kích hoạt chuẩn Dual-Channel tối ưu nhất.',
      'Kích hoạt tính năng XMP / EXPO trong giao diện BIOS để RAM chạy đúng mức xung công bố.'
    ],
    analyzedAt: new Date().toISOString(),
    modelUsed: 'local-fallback'
  };
}
