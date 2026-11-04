import { NextRequest, NextResponse } from 'next/server';
import { askGeminiPCHubAdvisor } from '@/lib/gemini';
import { getProducts } from '@/lib/db';
import { getProductImage } from '@/lib/product-ui';
import { parseUserHardwareIntent, KNOWN_BRANDS_CONFIG } from '@/lib/ai-query-parser';
import { matchPresetKeyFromText, AI_BUILD_PRESETS } from '@/lib/buildPresets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Nội dung câu hỏi không được để trống' }, { status: 400 });
    }

    const currentIntent = parseUserHardwareIntent(message.trim());

    // Sequential Conversational Memory:
    // Only inherit context (category, brand, isPcBuild) if the current query is an implicit follow-up
    // (i.e. does not explicitly change the intent, category, or brand).
    const isCurrentExplicitBuild = currentIntent.isPcBuild || currentIntent.category === 'pc_build';
    const hasCurrentExplicitCat = Boolean(currentIntent.category && currentIntent.category !== 'pc_build');
    const hasCurrentExplicitBrand = Boolean(currentIntent.brand);

    let inheritedCategory = currentIntent.category;
    let inheritedCategoryName = currentIntent.categoryName;
    let inheritedBrand = currentIntent.brand;
    let inheritedBrandSlug = currentIntent.brandSlug;
    let isPcBuild = isCurrentExplicitBuild;

    // Only inspect history if current message is missing category/brand or is an implicit build follow-up
    if ((!hasCurrentExplicitCat || !hasCurrentExplicitBrand || !isPcBuild) && Array.isArray(history) && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const turn = history[i];
        const turnText = typeof turn.content === 'string' ? turn.content : typeof turn.text === 'string' ? turn.text : '';
        if (turnText) {
          const pastIntent = parseUserHardwareIntent(turnText);

          // If current is an explicit PC build, DO NOT inherit peripheral brands (e.g. Logitech) or peripheral categories
          if (isCurrentExplicitBuild) {
            break;
          }

          // If current has an explicit category, DO NOT inherit past categories or past build intent
          if (hasCurrentExplicitCat) {
            break;
          }

          // Inherit category if not present in current query
          if (!inheritedCategory && pastIntent.category && pastIntent.category !== 'pc_build') {
            inheritedCategory = pastIntent.category;
            inheritedCategoryName = pastIntent.categoryName;
          }

          // Inherit brand if not present and not an explicit build
          if (!inheritedBrand && pastIntent.brand) {
            inheritedBrand = pastIntent.brand;
            inheritedBrandSlug = pastIntent.brandSlug;
          }

          // Inherit isPcBuild if current query did not specify another category
          if (!isPcBuild && pastIntent.isPcBuild && !hasCurrentExplicitCat) {
            isPcBuild = pastIntent.isPcBuild;
          }
        }
      }
    }

    const intent = {
      ...currentIntent,
      category: isCurrentExplicitBuild ? 'pc_build' : (inheritedCategory || currentIntent.category),
      categoryName: isCurrentExplicitBuild ? 'PC Trọn Bộ' : (inheritedCategoryName || currentIntent.categoryName),
      brand: isCurrentExplicitBuild ? currentIntent.brand : (currentIntent.brand || inheritedBrand),
      brandSlug: isCurrentExplicitBuild ? currentIntent.brandSlug : (currentIntent.brandSlug || inheritedBrandSlug),
      isPcBuild: isCurrentExplicitBuild || isPcBuild,
    };

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

      // Add category terms based on query or inherited intent
      if (userText.includes('màn hình') || userText.includes('monitor') || userText.includes('màn') || intent.category === 'monitor') searchTerms.push('màn');
      if (userText.includes('bàn phím') || userText.includes('keyboard') || userText.includes('phím') || intent.category === 'keyboard') searchTerms.push('phím');
      if (userText.includes('chuột') || userText.includes('mouse') || userText.includes('lót chuột') || userText.includes('pad') || intent.category === 'mouse') searchTerms.push('chuột');
      if (userText.includes('tai nghe') || userText.includes('headset') || userText.includes('audio') || intent.category === 'headset') searchTerms.push('tai nghe');
      if (userText.includes('loa') || userText.includes('speaker') || intent.category === 'speaker') searchTerms.push('loa');
      if (userText.includes('vga') || userText.includes('card') || userText.includes('gpu') || userText.includes('rtx') || intent.category === 'gpu') searchTerms.push('rtx', 'vga');
      if (userText.includes('cpu') || userText.includes('chip') || userText.includes('intel') || userText.includes('ryzen') || intent.category === 'cpu') searchTerms.push('intel', 'ryzen');
      if (userText.includes('ram') || intent.category === 'ram') searchTerms.push('ram');
      if (userText.includes('ssd') || userText.includes('hdd') || userText.includes('ổ cứng') || intent.category === 'storage') searchTerms.push('ssd');
      if (userText.includes('tản') || userText.includes('aio') || userText.includes('cooling') || intent.category === 'cooling') searchTerms.push('tản');
      if (userText.includes('nguồn') || userText.includes('psu') || intent.category === 'psu') searchTerms.push('nguồn');
      if (userText.includes('case') || userText.includes('vỏ') || intent.category === 'case') searchTerms.push('case');

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
            const specPairs = Object.entries(p.specs).map(([k, v]) => {
              if (k === 'core_count') return `${v} nhân`;
              if (k === 'thread_count') return `${v} luồng`;
              if (k === 'socket') return `Socket ${v}`;
              if (k === 'base_clock_ghz') return `Xung cơ bản ${v}GHz`;
              return `${k}: ${Array.isArray(v) ? (v as any[]).join('/') : v}`;
            });
            if (specPairs.length > 0) specsStr = ` | Thông số: ${specPairs.join(', ')}`;
          }
          return `- [${cat}] ${p.name}${brand} — Giá: ${priceStr}${stockStr}${specsStr}`;
        }).join('\n');
      }
    } catch (err) {
      console.warn('[PCHub AI Chat] Failed to load dynamic catalog context:', err);
    }

    const advisorResult = await askGeminiPCHubAdvisor(message.trim(), history, catalogContext, intent);

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
        else if (intent.category === 'laptop' && (pCat.includes('laptop') || pName.includes('laptop') || pName.includes('máy tính xách tay'))) isCatMatch = true;

        if (isCatMatch) {
          score += 200;
        } else {
          score -= 500; // Heavily penalize non-matching categories for single component queries
        }
      }

      // 2. Brand Matching Boost
      if (intent.brand) {
        const bLower = intent.brand.toLowerCase();
        const brandObj = KNOWN_BRANDS_CONFIG.find(k => k.name.toLowerCase() === bLower || k.slug === intent.brandSlug);
        const matchesBrand = pName.includes(bLower) || pBrand.includes(bLower) || (brandObj && brandObj.keywords.some(kw => pName.includes(kw)));
        if (matchesBrand) {
          score += 250;
        } else {
          score -= 80;
        }
      }

      // 3. Price Matching Boost / Penalization
      if (price > 0) {
        if (intent.maxPrice && price > intent.maxPrice * 1.05) {
          score -= 600; // Strictly exclude products exceeding user max budget
        } else if (intent.maxPrice && price <= intent.maxPrice) {
          score += 150;
        }

        if (intent.minPrice && price < intent.minPrice * 0.95) {
          score -= 400;
        } else if (intent.minPrice && price >= intent.minPrice) {
          score += 80;
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
      // For PC Build queries: Prioritize components from the matched preset and dynamic catalog
      const matchedPresetKey = matchPresetKeyFromText(message);
      const matchedPreset = AI_BUILD_PRESETS[matchedPresetKey] || AI_BUILD_PRESETS['25m'];
      const presetCompList = Object.values(matchedPreset.components);

      // Add preset components first
      presetCompList.forEach(comp => {
        // Try to find matching real product in catalog
        const realProd = finalProductList.find(p => (p.name || '').toLowerCase().includes(comp.name.toLowerCase().slice(0, 15)));
        const itemToAdd = realProd || {
          id: comp.id,
          name: comp.name,
          slug: comp.slug,
          price: comp.price,
          original_price: Math.round(comp.price * 1.1),
          image_url: comp.image,
          category_name: comp.key.toUpperCase(),
          category_slug: comp.key,
          brand_name: 'Chính hãng',
        };
        if (!recMap.has(itemToAdd.name)) {
          recMap.set(itemToAdd.name, {
            id: String(itemToAdd.id),
            name: itemToAdd.name,
            slug: itemToAdd.slug,
            price: Number(itemToAdd.price) || 0,
            original_price: Number(itemToAdd.original_price || itemToAdd.originalPrice || 0),
            image_url: getProductImage({ name: itemToAdd.name, category_name: itemToAdd.category_name, category_slug: itemToAdd.category_slug, brand_name: itemToAdd.brand_name, image_url: itemToAdd.image_url || itemToAdd.image }),
            category_name: itemToAdd.category_name || 'Linh kiện',
            category_slug: itemToAdd.category_slug,
            brand_name: itemToAdd.brand_name || 'Chính hãng',
          });
        }
      });

      // Fill with other high-scored hardware components if space permits
      const usedCatOrders = new Set<number>();
      for (const item of scoredProducts) {
        if (recMap.size >= 8) break;
        const p = item.product;
        if (!recMap.has(p.name) && !usedCatOrders.has(item.catOrder)) {
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
      reply: 'Hệ thống AI Advisor đang bận xử lý dữ liệu linh kiện PCHub. Bạn có thể thử lại sau giây lát hoặc xem các sản phẩm trên website!',
      error: err.message
    }, { status: 500 });
  }
}

