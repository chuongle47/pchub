import { NextRequest, NextResponse } from 'next/server';
import { askGeminiPCHubAdvisor } from '@/lib/gemini';
import { getProducts } from '@/lib/db';
import { getProductImage } from '@/lib/product-ui';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Nội dung câu hỏi không được để trống' }, { status: 400 });
    }

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

      if (userText.includes('màn hình') || userText.includes('monitor') || userText.includes('màn')) searchTerms.push('màn');
      if (userText.includes('bàn phím') || userText.includes('keyboard') || userText.includes('phím')) searchTerms.push('phím');
      if (userText.includes('chuột') || userText.includes('mouse') || userText.includes('lót chuột') || userText.includes('pad')) searchTerms.push('chuột');
      if (userText.includes('tai nghe') || userText.includes('headset') || userText.includes('audio')) searchTerms.push('tai nghe');
      if (userText.includes('vga') || userText.includes('card') || userText.includes('gpu') || userText.includes('rtx')) searchTerms.push('rtx');
      if (userText.includes('cpu') || userText.includes('chip') || userText.includes('intel') || userText.includes('ryzen')) searchTerms.push('intel');
      if (userText.includes('ram')) searchTerms.push('ram');
      if (userText.includes('ssd') || userText.includes('hdd') || userText.includes('ổ cứng')) searchTerms.push('ssd');
      if (userText.includes('tản') || userText.includes('aio') || userText.includes('cooling')) searchTerms.push('tản');
      if (userText.includes('nguồn') || userText.includes('psu')) searchTerms.push('nguồn');
      if (userText.includes('case') || userText.includes('vỏ')) searchTerms.push('case');

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
    const isBuildQuery = userText.includes('build') || userText.includes('pc') || userText.includes('cấu hình') || userText.includes('tư vấn') || userText.includes('triệu') || userText.includes('cpu') || userText.includes('vga') || replyText.includes('cpu:') || replyText.includes('vga:') || replyText.includes('ram:') || replyText.includes('ssd:');

    // Score products based on token overlap with Gemini reply text
    const scoredProducts: { product: any; score: number; catOrder: number }[] = [];

    finalProductList.forEach((p: any) => {
      const pName = (p.name || '').toLowerCase();
      const pCat = (p.category_name || p.category_slug || '').toLowerCase();
      let score = 0;

      // Category ordering priority: CPU (1), Mainboard (2), RAM (3), SSD/Storage (4), VGA/GPU (5), PSU (6), Case (7), Cooling (8), Gear (9)
      let catOrder = 9;
      if (pCat.includes('cpu') || pName.includes('intel') || pName.includes('ryzen') || pName.includes('vi xử lý')) catOrder = 1;
      else if (pCat.includes('mainboard') || pName.includes('b760') || pName.includes('z790') || pName.includes('b650') || pName.includes('h610') || pName.includes('bo mạch')) catOrder = 2;
      else if (pCat.includes('ram') || pName.includes('ddr4') || pName.includes('ddr5')) catOrder = 3;
      else if (pCat.includes('ssd') || pCat.includes('storage') || pName.includes('ssd') || pName.includes('nvme') || pName.includes('ổ cứng')) catOrder = 4;
      else if (pCat.includes('vga') || pCat.includes('gpu') || pName.includes('rtx') || pName.includes('gtx') || pName.includes('radeon') || pName.includes('card màn')) catOrder = 5;
      else if (pCat.includes('psu') || pName.includes('psu') || pName.includes('nguồn')) catOrder = 6;
      else if (pCat.includes('case') || pName.includes('vỏ máy') || pName.includes('case')) catOrder = 7;
      else if (pCat.includes('cooling') || pName.includes('tản')) catOrder = 8;

      // 1. Direct name containment
      if (pName.length >= 4 && replyText.includes(pName)) {
        score += 100;
      }

      // 2. Token / model code matching
      const words = pName.split(/[\s\-_\/,\.]+/).filter((w: string) => w.length >= 2);
      let matchedWordCount = 0;
      for (const w of words) {
        // Skip generic words
        if (['chính', 'hãng', 'cho', 'máy', 'tính', 'bộ', 'loại', 'cao', 'cấp', 'giá', 'rẻ'].includes(w)) continue;
        if (replyText.includes(w)) {
          matchedWordCount++;
          // High boost for specific model codes (e.g., 12400f, 3060, 4070, b760, 980, ddr4, 650w)
          if (/\d+/.test(w) || ['rtx', 'gtx', 'intel', 'ryzen', 'nvme', 'ssd', 'ram', 'ddr4', 'ddr5', 'b760', 'z790', 'b650'].includes(w)) {
            score += 25;
          } else {
            score += 5;
          }
        }
      }

      // 3. Boost PC components for PC build queries
      if (isBuildQuery && catOrder <= 7 && matchedWordCount >= 1) {
        score += 30;
      }

      if (score > 15) {
        scoredProducts.push({ product: p, score, catOrder });
      }
    });

    // Sort by score descending, then category order
    scoredProducts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.catOrder - b.catOrder;
    });

    // Pick top unique categories to ensure balanced hardware selection
    const recMap = new Map<string, any>();
    const usedCatOrders = new Set<number>();

    // Pass 1: One top product per hardware category
    for (const item of scoredProducts) {
      const p = item.product;
      const pName = p.name;
      if (!recMap.has(pName) && (!usedCatOrders.has(item.catOrder) || recMap.size >= 5)) {
        usedCatOrders.add(item.catOrder);
        recMap.set(pName, {
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

    // Pass 2: Fill remaining slots with top remaining scored products
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

