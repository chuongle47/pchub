import { NextRequest, NextResponse } from 'next/server';
import { askGeminiPCHubAdvisor } from '@/lib/gemini';
import { getProducts } from '@/lib/db';
import { getProductImage } from '@/lib/product-ui';
import { parseUserHardwareIntent } from '@/lib/ai-query-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Nội dung câu hỏi không được để trống' }, { status: 400 });
    }

    const intent = parseUserHardwareIntent(message.trim());

    // Build rich dynamic catalog context from database based on user query + full Sbuy product catalog
    let catalogContext = '';
    let finalProductList: any[] = [];

    try {
      // 1. Fetch main catalog (up to 1000 products from Sbuy API)
      const mainResult = await getProducts({ limit: 1000 });
      let allProducts = mainResult?.products || [];

      // 2. Targeted keyword search to prioritize matching products
      const userText = message.toLowerCase();
      let searchMatched: any[] = [];
      const searchTerms: string[] = [];

      // Add category terms
      if (userText.includes('màn hình') || userText.includes('monitor') || userText.includes('màn')) searchTerms.push('màn');
      if (userText.includes('bàn phím') || userText.includes('keyboard') || userText.includes('phím')) searchTerms.push('phím');
      if (userText.includes('chuột') || userText.includes('mouse') || userText.includes('lót chuột') || userText.includes('pad')) searchTerms.push('chuột');
      if (userText.includes('tai nghe') || userText.includes('headset') || userText.includes('audio')) searchTerms.push('tai nghe');
      if (userText.includes('loa') || userText.includes('speaker')) searchTerms.push('loa');
      if (userText.includes('vga') || userText.includes('card') || userText.includes('gpu') || userText.includes('rtx')) searchTerms.push('rtx', 'vga');
      if (userText.includes('cpu') || userText.includes('chip') || userText.includes('intel') || userText.includes('ryzen')) searchTerms.push('intel', 'ryzen');
      if (userText.includes('ram')) searchTerms.push('ram');
      if (userText.includes('ssd') || userText.includes('hdd') || userText.includes('ổ cứng')) searchTerms.push('ssd');
      if (userText.includes('tản') || userText.includes('aio') || userText.includes('cooling')) searchTerms.push('tản');
      if (userText.includes('nguồn') || userText.includes('psu')) searchTerms.push('nguồn');
      if (userText.includes('case') || userText.includes('vỏ')) searchTerms.push('case');

      // Add detected brand term
      if (intent.brand) {
        searchTerms.push(intent.brand.toLowerCase());
      }

      for (const term of searchTerms) {
        try {
          const searchRes = await getProducts({ search: term, limit: 50 });
          if (searchRes?.products) {
            searchMatched.push(...searchRes.products);
          }
        } catch (e) {}
      }

      // Merge and deduplicate products, prioritizing search matches
      const productMap = new Map<string, any>();
      searchMatched.forEach(p => productMap.set(p.id, p));
      allProducts.forEach(p => {
        if (!productMap.has(p.id)) {
          productMap.set(p.id, p);
        }
      });

      finalProductList = Array.from(productMap.values());

      if (finalProductList.length > 0) {
        catalogContext = finalProductList.map((p: any) => {
          const cat = p.category_name || 'Linh kiện';
          const brand = p.brand_name ? ` (${p.brand_name})` : '';
          const priceStr = Number(p.price) ? `${Number(p.price).toLocaleString('vi-VN')}₫` : 'Liên hệ';
          const stockStr = p.stock !== undefined ? ` [Tồn kho: ${p.stock}]` : '';
          let specsStr = '';
          if (p.specs && typeof p.specs === 'object') {
            const specPairs = Object.entries(p.specs).map(([k, v]) => `${k}: ${Array.isArray(v) ? (v as any[]).join('/') : v}`);
            if (specPairs.length > 0) specsStr = ` | Thông số: ${specPairs.join(', ')}`;
          }
          return `- [${cat}] ${p.name}${brand} — Giá: ${priceStr}${stockStr}${specsStr}`;
        }).join('\n');
      }
    } catch (err) {
      console.warn('[PCHub AI Chat] Failed to load dynamic catalog context:', err);
    }

    const advisorResult = await askGeminiPCHubAdvisor(message.trim(), history, catalogContext);

    // Smart matching of real products to Gemini reply recommendations
    const userText = message.toLowerCase();
    const replyText = (advisorResult.text || '').toLowerCase();
    const isBuildQuery = intent.isPcBuild || userText.includes('build') || userText.includes('cấu hình') || (userText.includes('pc') && (userText.includes('triệu') || userText.includes('gaming')));

    // Score products based on intent (brand, price, category) and token overlap with AI reply text
    const scoredProducts: { product: any; score: number; catOrder: number }[] = [];

    finalProductList.forEach((p: any) => {
      const pName = (p.name || '').toLowerCase();
      const pCat = (p.category_name || p.category_slug || '').toLowerCase();
      const pBrand = (p.brand_name || '').toLowerCase();
      const price = Number(p.price) || 0;
      let score = 0;

      // Category ordering priority
      let catOrder = 9;
      if (pCat.includes('cpu') || pName.includes('intel') || pName.includes('ryzen') || pName.includes('vi xử lý')) catOrder = 1;
      else if (pCat.includes('mainboard') || pName.includes('b760') || pName.includes('z790') || pName.includes('b650') || pName.includes('h610') || pName.includes('bo mạch')) catOrder = 2;
      else if (pCat.includes('ram') || pName.includes('ddr4') || pName.includes('ddr5')) catOrder = 3;
      else if (pCat.includes('ssd') || pCat.includes('storage') || pName.includes('ssd') || pName.includes('nvme') || pName.includes('ổ cứng')) catOrder = 4;
      else if (pCat.includes('vga') || pCat.includes('gpu') || pName.includes('rtx') || pName.includes('gtx') || pName.includes('radeon') || pName.includes('card màn')) catOrder = 5;
      else if (pCat.includes('psu') || pName.includes('psu') || pName.includes('nguồn')) catOrder = 6;
      else if (pCat.includes('case') || pName.includes('vỏ máy') || pName.includes('case')) catOrder = 7;
      else if (pCat.includes('cooling') || pName.includes('tản')) catOrder = 8;

      // 1. Category Matching Boost / Penalization
      if (intent.category && intent.category !== 'pc_build') {
        let isCatMatch = false;
        if (intent.category === 'monitor' && (pCat.includes('màn') || pName.includes('màn') || pName.includes('monitor'))) isCatMatch = true;
        else if (intent.category === 'mouse' && (pCat.includes('chuột') || pName.includes('chuột') || pName.includes('mouse'))) isCatMatch = true;
        else if (intent.category === 'keyboard' && (pCat.includes('bàn phím') || pName.includes('bàn phím') || pName.includes('phím') || pName.includes('keyboard'))) isCatMatch = true;
        else if (intent.category === 'headset' && (pCat.includes('tai nghe') || pName.includes('tai nghe') || pName.includes('headset'))) isCatMatch = true;
        else if (intent.category === 'speaker' && (pCat.includes('loa') || pName.includes('loa') || pName.includes('speaker'))) isCatMatch = true;
        else if (intent.category === 'cpu' && (pCat.includes('cpu') || pName.includes('cpu') || pName.includes('intel') || pName.includes('ryzen'))) isCatMatch = true;
        else if (intent.category === 'gpu' && (pCat.includes('vga') || pCat.includes('gpu') || pName.includes('rtx') || pName.includes('card'))) isCatMatch = true;
        else if (intent.category === 'ram' && (pCat.includes('ram') || pName.includes('ram'))) isCatMatch = true;
        else if (intent.category === 'storage' && (pCat.includes('ssd') || pName.includes('ssd') || pName.includes('ổ cứng'))) isCatMatch = true;
        else if (intent.category === 'mainboard' && (pCat.includes('mainboard') || pName.includes('b760') || pName.includes('b650') || pName.includes('z790'))) isCatMatch = true;
        else if (intent.category === 'psu' && (pCat.includes('nguồn') || pName.includes('nguồn') || pName.includes('psu'))) isCatMatch = true;
        else if (intent.category === 'case' && (pCat.includes('case') || pName.includes('case') || pName.includes('vỏ'))) isCatMatch = true;
        else if (intent.category === 'cooling' && (pCat.includes('tản') || pName.includes('tản') || pName.includes('cooling'))) isCatMatch = true;

        if (isCatMatch) {
          score += 200;
        } else {
          score -= 500; // Heavily penalize non-matching categories for single component queries
        }
      }

      // 2. Brand Matching Boost
      if (intent.brand) {
        const bLower = intent.brand.toLowerCase();
        if (pName.includes(bLower) || pBrand.includes(bLower)) {
          score += 250;
        } else {
          score -= 80;
        }
      }

      // 3. Price Matching Boost / Penalization
      if (price > 0) {
        if (intent.maxPrice && price > intent.maxPrice * 1.1) {
          score -= 400; // Do not show products exceeding user max budget
        } else if (intent.maxPrice && price <= intent.maxPrice) {
          score += 80;
        }

        if (intent.minPrice && price < intent.minPrice * 0.9) {
          score -= 400;
        } else if (intent.minPrice && price >= intent.minPrice) {
          score += 60;
        }

        if (intent.targetPrice) {
          const diffRatio = Math.abs(price - intent.targetPrice) / intent.targetPrice;
          if (diffRatio < 0.25) score += 100;
          else if (diffRatio < 0.5) score += 40;
        }
      }

      // 4. Direct name / reply containment
      if (pName.length >= 4 && replyText.includes(pName)) {
        score += 150;
      }

      // 5. Token / model code matching
      const words = pName.split(/[\s\-_\/,\.]+/).filter((w: string) => w.length >= 2);
      for (const w of words) {
        if (['chính', 'hãng', 'cho', 'máy', 'tính', 'bộ', 'loại', 'cao', 'cấp', 'giá', 'rẻ'].includes(w)) continue;
        if (replyText.includes(w)) {
          if (/\d+/.test(w) || ['rtx', 'gtx', 'intel', 'ryzen', 'nvme', 'ssd', 'ram', 'ddr4', 'ddr5', 'b760', 'z790', 'b650'].includes(w)) {
            score += 25;
          } else {
            score += 5;
          }
        }
      }

      if (isBuildQuery && catOrder <= 7) {
        score += 20;
      }

      if (score > 10) {
        scoredProducts.push({ product: p, score, catOrder });
      }
    });

    // Sort by score descending
    scoredProducts.sort((a, b) => b.score - a.score);

    const recMap = new Map<string, any>();

    // For single category / specific queries: Pick the top scored products directly
    if (intent.category && intent.category !== 'pc_build') {
      for (const item of scoredProducts) {
        const p = item.product;
        if (!recMap.has(p.name)) {
          recMap.set(p.name, {
            id: String(p.id),
            name: p.name,
            slug: p.slug,
            price: Number(p.price) || 0,
            original_price: Number(p.original_price || p.originalPrice || 0),
            image_url: getProductImage({ name: p.name, category_name: p.category_name, category_slug: p.category_slug, brand_name: p.brand_name, image_url: p.image_url || p.image }),
            category_name: p.category_name || 'Linh kiện',
            category_slug: p.category_slug,
            brand_name: p.brand_name || 'Chính hãng',
          });
        }
        if (recMap.size >= 4) break;
      }
    } else {
      // For PC Build queries: Balanced unique hardware categories
      const usedCatOrders = new Set<number>();
      for (const item of scoredProducts) {
        const p = item.product;
        if (!recMap.has(p.name) && (!usedCatOrders.has(item.catOrder) || recMap.size >= 5)) {
          usedCatOrders.add(item.catOrder);
          recMap.set(p.name, {
            id: String(p.id),
            name: p.name,
            slug: p.slug,
            price: Number(p.price) || 0,
            original_price: Number(p.original_price || p.originalPrice || 0),
            image_url: getProductImage({ name: p.name, category_name: p.category_name, category_slug: p.category_slug, brand_name: p.brand_name, image_url: p.image_url || p.image }),
            category_name: p.category_name || 'Linh kiện',
            category_slug: p.category_slug,
            brand_name: p.brand_name || 'Chính hãng',
          });
        }
        if (recMap.size >= 6) break;
      }

      // Fill remaining if needed
      if (recMap.size < 6) {
        for (const item of scoredProducts) {
          const p = item.product;
          if (!recMap.has(p.name)) {
            recMap.set(p.name, {
              id: String(p.id),
              name: p.name,
              slug: p.slug,
              price: Number(p.price) || 0,
              original_price: Number(p.original_price || p.originalPrice || 0),
              image_url: getProductImage({ name: p.name, category_name: p.category_name, category_slug: p.category_slug, brand_name: p.brand_name, image_url: p.image_url || p.image }),
              category_name: p.category_name || 'Linh kiện',
              category_slug: p.category_slug,
              brand_name: p.brand_name || 'Chính hãng',
            });
          }
          if (recMap.size >= 6) break;
        }
      }
    }

    const recommendedProducts = Array.from(recMap.values()).slice(0, 6);

    return NextResponse.json({
      reply: advisorResult.text,
      modelUsed: advisorResult.modelUsed,
      recommendedProducts: recommendedProducts,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err: any) {
    console.error('[PCHub AI Chat Endpoint Error]:', err);
    return NextResponse.json({
      reply: 'Hệ thống AI Advisor đang kết nối dữ liệu Sbuy API. Bạn có thể thử lại hoặc xem các sản phẩm trên website!',
      error: err.message
    }, { status: 500 });
  }
}

