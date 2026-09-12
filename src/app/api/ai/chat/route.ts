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

    // Fetch top products to build real-time catalog context for Gemini AI
    let catalogContext = '';
    try {
      const prodResult = await getProducts({ limit: 30 });
      if (prodResult?.products && prodResult.products.length > 0) {
        catalogContext = prodResult.products.map((p: any) => {
          const cat = p.category_name || 'Linh kiện';
          const priceStr = Number(p.price) ? `${Number(p.price).toLocaleString('vi-VN')}₫` : 'Liên hệ';
          return `- [${cat}] ${p.name} — Giá: ${priceStr}`;
        }).join('\n');
      }
    } catch (err) {
      console.warn('[PCHub AI Chat] Failed to load dynamic catalog context, using static defaults.');
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
