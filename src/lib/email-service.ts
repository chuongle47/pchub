interface OrderEmailData {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: any;
  paymentMethod?: string;
  status?: string;
  note?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const { orderCode, customerName, customerEmail, total, items, shippingAddress } = data;

  console.log(`[Email Service] Gửi email xác nhận đơn hàng #${orderCode} tới: ${customerEmail}`);

  // If RESEND_API_KEY is available in environment
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'PCHub Store <orders@pchub.vn>',
          to: customerEmail,
          subject: `[PCHub] Xác nhận đơn hàng #${orderCode} thành công`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
              <h2 style="color: #2563eb;">Cảm ơn bạn đã đặt hàng tại PCHub!</h2>
              <p>Xin chào <strong>${customerName}</strong>,</p>
              <p>Đơn hàng <strong>#${orderCode}</strong> của bạn đã được ghi nhận vào hệ thống và đang được nhân viên chuẩn bị linh kiện.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <h3>Chi tiết đơn hàng:</h3>
              <ul style="padding-left: 20px;">
                ${items.map(i => `<li>${i.name} x ${i.quantity} - ${Number(i.price * i.quantity).toLocaleString('vi-VN')} ₫</li>`).join('')}
              </ul>
              <p><strong>Tổng thanh toán:</strong> <span style="color: #2563eb; font-size: 18px; font-weight: bold;">${Number(total).toLocaleString('vi-VN')} ₫</span></p>
              <p><strong>Địa chỉ nhận hàng:</strong> ${typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress)}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Mọi thắc mắc xin vui lòng liên hệ hotline: 1900 6868 hoặc phản hồi email này.</p>
            </div>
          `,
        }),
      });
      return await res.json();
    } catch (err) {
      console.error('[Email Service] Lỗi gửi email qua Resend:', err);
    }
  }

  // Graceful fallback: simulated email output
  return { success: true, simulated: true, to: customerEmail, orderCode };
}

export async function sendOrderStatusUpdateEmail(data: OrderEmailData) {
  const { orderCode, customerName, customerEmail, status, note } = data;

  const statusMap: Record<string, string> = {
    confirmed: 'Đã được xác nhận',
    processing: 'Đang đóng gói linh kiện',
    shipping: 'Đang trên đường giao đến bạn',
    completed: 'Giao hàng thành công',
    cancelled: 'Đã bị hủy',
  };

  const statusText = statusMap[status || ''] || status;
  console.log(`[Email Service] Gửi cập nhật trạng thái đơn #${orderCode} (${statusText}) tới: ${customerEmail}`);

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'PCHub Store <orders@pchub.vn>',
          to: customerEmail,
          subject: `[PCHub] Đơn hàng #${orderCode} - ${statusText}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
              <h2 style="color: #2563eb;">Cập nhật trạng thái đơn hàng #${orderCode}</h2>
              <p>Xin chào <strong>${customerName}</strong>,</p>
              <p>Đơn hàng của bạn hiện đã chuyển sang trạng thái: <strong style="color: #16a34a;">${statusText}</strong>.</p>
              ${note ? `<p><strong>Ghi chú:</strong> ${note}</p>` : ''}
              <p>Bạn có thể theo dõi tiến độ đơn hàng tại mục Tài khoản > Đơn hàng trên website PCHub.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">PCHub - Hotline hỗ trợ: 1900 6868</p>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.error('[Email Service] Lỗi gửi email update:', err);
    }
  }

  return { success: true, simulated: true, to: customerEmail, status: statusText };
}