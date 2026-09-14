import { NextRequest, NextResponse } from 'next/server';
import { askGeminiPCHubAdvisor } from '@/lib/gemini';
import { getProducts } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Nội dung câu hỏi không được để trống' }, { status: 400 });
    }

    // Build rich dynamic catalog context from database based on user query + full product catalog
    let catalogContext = '';
    try {
      // 1. Fetch main catalog (up to 100 products to cover all store categories)
      const mainResult = await getProducts({ limit: 100 });
      let allProducts = mainResult?.products || [];

      // 2. If user message contains specific component/peripheral keywords, run targeted search
      const userText = message.toLowerCase();
      let searchMatched: any[] = [];
      const searchTerms: string[] = [];

      if (userText.includes('màn hình') || userText.includes('monitor') || userText.includes('màn')) searchTerms.push('màn');
      if (userText.includes('bàn phím') || userText.includes('keyboard') || userText.includes('phím')) searchTerms.push('phím');
      if (userText.includes('chuột') || userText.includes('mouse')) searchTerms.push('chuột');
      if (userText.includes('tai nghe') || userText.includes('headset') || userText.includes('audio')) searchTerms.push('tai nghe');
      if (userText.includes('vga') || userText.includes('card') || userText.includes('gpu') || userText.includes('rtx')) searchTerms.push('rtx');
      if (userText.includes('cpu') || userText.includes('chip') || userText.includes('intel') || userText.includes('ryzen')) searchTerms.push('intel');
      if (userText.includes('ram')) searchTerms.push('ram');
      if (userText.includes('ssd') || userText.includes('hdd') || userText.includes('ổ cứng')) searchTerms.push('ssd');
      if (userText.includes('tản') || userText.includes('aio') || userText.includes('cooling')) searchTerms.push('tản');

      for (const term of searchTerms) {
        try {
          const searchRes = await getProducts({ search: term, limit: 30 });
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

      const finalProductList = Array.from(productMap.values());

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
      console.warn('[PCHub AI Chat] Failed to load dynamic catalog context, using static defaults:', err);
    }

    const advisorResult = await askGeminiPCHubAdvisor(message.trim(), history, catalogContext);

    return NextResponse.json({
      reply: advisorResult.text,
      modelUsed: advisorResult.modelUsed,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err: any) {
    console.error('[PCHub AI Chat Endpoint Error]:', err);
    return NextResponse.json({
      reply: 'Hệ thống AI Advisor đang tạm thời xử lý dữ liệu. Bạn có thể hỏi lại hoặc nhắn tin cho chuyên viên PCHub!',
      error: err.message
    }, { status: 500 });
  }
}
