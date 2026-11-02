import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp đầy đủ họ tên, số điện thoại và nội dung tin nhắn.' },
        { status: 400 }
      );
    }

    const phoneClean = phone.replace(/\s+/g, '');
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(phoneClean)) {
      return NextResponse.json(
        { success: false, message: 'Số điện thoại không hợp lệ (cần 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09).' },
        { status: 400 }
      );
    }

    const isQuote = subject?.toLowerCase().includes('báo giá') || body.isQuote;
    const ticketId = isQuote 
      ? (body.ticketId || `BG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
      : `PCHUB-CONTACT-${Date.now().toString().slice(-6)}`;

    const supabase = await createClient();

    // 1. Lưu vào bảng contacts trên Supabase
    const { error: contactError } = await supabase
      .from('contacts')
      .insert({
        name: name.trim(),
        phone: phoneClean,
        email: email ? email.trim() : null,
        subject: subject || (isQuote ? 'Yêu cầu báo giá PC' : 'Liên hệ tư vấn'),
        message: message.trim(),
        status: 'unread',
      });

    if (contactError) {
      console.error('Lỗi lưu contact Supabase:', contactError);
    }

    // 2. Nếu là báo giá PC, lưu vào bảng quotes trên Supabase để admin xử lý tại /admin/quotes
    if (isQuote) {
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          code: ticketId,
          customer_name: name.trim(),
          phone: phoneClean,
          email: email ? email.trim() : null,
          total: Number(body.budget || 0),
          status: 'pending',
          note: `Mục đích: ${body.purpose || 'Không ghi rõ'}\nNội dung: ${message}`,
        })
        .select('id')
        .single();

      if (quote && Array.isArray(body.items) && body.items.length > 0) {
        const quoteItems = body.items.map((it: any) => ({
          quote_id: quote.id,
          name_snapshot: it.name || it.productName || 'Linh kiện',
          price_snapshot: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
        }));
        await supabase.from('quote_items').insert(quoteItems);
      }
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: isQuote 
        ? `Yêu cầu báo giá của bạn đã được tiếp nhận (Mã: ${ticketId}). Đội ngũ kỹ thuật PCHub sẽ gửi bảng báo giá chi tiết qua Zalo/Email trong vòng 15-30 phút!`
        : `Cảm ơn bạn! Yêu cầu hỗ trợ (Mã: ${ticketId}) đã được gửi thành công. Chúng tôi sẽ liên hệ lại với bạn sớm nhất.`,
    });
  } catch (error: any) {
    console.error('Error handling contact/quote:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
