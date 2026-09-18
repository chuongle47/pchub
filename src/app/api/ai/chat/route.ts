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

    // Filter top 4 matching real Sbuy products to pass back to frontend for clickable cards
    const userText = message.toLowerCase();
    const replyText = (advisorResult.text || '').toLowerCase();
    
    const recommendedProducts = finalProductList
      .filter((p: any) => {
        const pName = (p.name || '').toLowerCase();
        const pCat = (p.category_name || '').toLowerCase();
        const pCatSlug = (p.category_slug || '').toLowerCase();
        
        // Match product name, category or brand against user query or reply text
        return replyText.includes(pName) ||
          userText.split(' ').some(word => word.length > 2 && (pName.includes(word) || pCat.includes(word) || pCatSlug.includes(word)));
      })
      .slice(0, 4)
      .map((p: any) => ({
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        price: Number(p.price) || 0,
        original_price: Number(p.original_price || p.originalPrice || 0),
        image_url: getProductImage({ name: p.name, category_name: p.category_name, category_slug: p.category_slug, brand_name: p.brand_name, image_url: p.image_url || p.image }),
        category_name: p.category_name || 'Linh kiện',
        brand_name: p.brand_name || 'Chính hãng',
      }));

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

