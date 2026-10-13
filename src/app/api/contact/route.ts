import { NextResponse } from 'next/server';

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

    // Phone format check (Vietnamese phone regex)
    const phoneClean = phone.replace(/\s+/g, '');
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(phoneClean)) {
      return NextResponse.json(
        { success: false, message: 'Số điện thoại không hợp lệ (cần 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09).' },
        { status: 400 }
      );
    }

    const isQuote = subject?.toLowerCase().includes('báo giá') || body.isQuote;
    const ticketId = isQuote 
      ? `BG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : `PCHUB-CONTACT-${Date.now().toString().slice(-6)}`;

    // Log contact/quotation ticket for backend admin / email notification
    console.log(`[PCHUB ${isQuote ? 'BÁO GIÁ PC' : 'CONTACT'}] New ticket ${ticketId} from ${name} (${phoneClean}, ${email || 'No email'}): [${subject || 'Tư vấn chung'}]`);

    return NextResponse.json({
      success: true,
      message: isQuote 
        ? 'Gửi yêu cầu báo giá thành công! Chuyên viên PCHub sẽ gửi bảng dự toán chi tiết trong 15-30 phút.'
        : 'Cảm ơn bạn đã liên hệ! Đội ngũ tư vấn PCHub sẽ phản hồi trong vòng 15-30 phút làm việc.',
      ticketId,
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng liên hệ hotline 0322 323 233.' },
      { status: 500 }
    );
  }
}
