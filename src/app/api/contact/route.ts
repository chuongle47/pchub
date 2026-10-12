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

    // Log contact ticket for backend admin / email notification
    console.log(`[PCHUB CONTACT] New message from ${name} (${phoneClean}, ${email || 'No email'}): [${subject || 'Tư vấn chung'}] ${message}`);

    return NextResponse.json({
      success: true,
      message: 'Cảm ơn bạn đã liên hệ! Đội ngũ tư vấn PCHub sẽ phản hồi trong vòng 15-30 phút làm việc.',
      ticketId: `PCHUB-CONTACT-${Date.now().toString().slice(-6)}`,
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng liên hệ hotline 0901 234 567.' },
      { status: 500 }
    );
  }
}
