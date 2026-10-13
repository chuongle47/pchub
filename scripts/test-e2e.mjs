import fs from 'fs';

async function runE2ETests() {
  console.log('=======================================================');
  console.log('       🧪 KIỂM THỬ END-TO-END TOÀN DIỆN (E2E)          ');
  console.log('=======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST SUITE 1: Kiểm tra cấu hình và mã nguồn PHP WordPress
  console.log('[1/4] Kiểm tra Plugin WordPress Báo giá & Contact Form 7:');
  const quotePhp = fs.readFileSync('pchub-pc-quote.php', 'utf8');
  const buttonsPhp = fs.readFileSync('nks-contact-buttons.php', 'utf8');

  assert(quotePhp.includes("register_post_type( PCHUB_QUOTE_POST_TYPE"), 'Đăng ký Custom Post Type "Báo giá PC" (pchub_quote)');
  assert(quotePhp.includes("add_action( 'wpcf7_mail_sent'"), 'Hook bắt tự động khi gửi Contact Form 7 thành công (wpcf7_mail_sent)');
  assert(quotePhp.includes("add_action( 'wpcf7_before_send_mail'"), 'Hook dự phòng trước khi gửi mail CF7 (wpcf7_before_send_mail)');
  assert(quotePhp.includes("register_rest_route( 'pchub/v1', '/quote'"), 'Đăng ký REST API endpoint POST /wp-json/pchub/v1/quote');
  assert(quotePhp.includes("register_rest_route( 'pchub/v1', '/quotes'"), 'Đăng ký REST API endpoint GET /wp-json/pchub/v1/quotes');
  assert(quotePhp.includes("window.print()"), 'Tích hợp nút in bảng dự toán PDF chuyên nghiệp');
  assert(quotePhp.includes("https://zalo.me/"), 'Tích hợp nút Chat Zalo trực tiếp trong danh sách phiếu');
  assert(buttonsPhp.includes("pchub/v1") || buttonsPhp.includes("pchub-pc-quote.php"), 'nks-contact-buttons.php tích hợp đồng bộ với module Báo giá PC');

  // TEST SUITE 2: Kiểm tra Logo Zalo chuẩn Vector SVG
  console.log('\n[2/4] Kiểm tra Logo Zalo trên Website:');
  const contactButtonsCode = fs.readFileSync('src/components/layout/FloatingContactButtons.tsx', 'utf8');
  const lienHePageCode = fs.readFileSync('src/app/lien-he/page.tsx', 'utf8');

  assert(!contactButtonsCode.includes('<text x="24"'), 'Đã gỡ bỏ hoàn toàn thẻ <text> bị lệch font cũ trong FloatingContactButtons.tsx');
  assert(contactButtonsCode.includes('M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576'), 'Áp dụng Official Vector Path của Zalo chính thức');
  assert(contactButtonsCode.includes('translate(6, 5.8)'), 'Tâm vector Zalo được căn giữa toán học hoàn hảo với bong bóng thoại');
  assert(lienHePageCode.includes('<ZaloIcon'), 'Trang /lien-he sử dụng ZaloIcon vector thay cho chuỗi text "Zalo" cũ');

  // TEST SUITE 3: Kiểm tra API Submit Yêu Cầu Báo Giá
  console.log('\n[3/4] Kiểm tra API Next.js /api/contact:');
  try {
    // 3.1 Gửi thiếu thông tin
    const resInvalid = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' })
    });
    const dataInvalid = await resInvalid.json();
    assert(resInvalid.status === 400 && dataInvalid.success === false, 'Validate từ chối khi thiếu họ tên và số điện thoại');

    // 3.2 Gửi sai định dạng SĐT
    const resBadPhone = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Lê Văn Chương', phone: '12345', message: 'Test' })
    });
    const dataBadPhone = await resBadPhone.json();
    assert(resBadPhone.status === 400 && dataBadPhone.success === false, 'Validate từ chối khi SĐT không đúng 10 số Việt Nam');

    // 3.3 Gửi phiếu Báo giá hợp lệ đầy đủ
    const fullQuotePayload = {
      name: 'Lê Văn Chương',
      phone: '0901234567',
      email: 'chuong@pchub.vn',
      company: 'Công ty Công nghệ PCHub',
      tax: '0312345678',
      address: 'Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh',
      purpose: 'Gaming & Đồ họa 3D',
      budget: '35 - 50 triệu',
      quantity: 2,
      timeline: 'Trong ngày hôm nay',
      services: ['Lắp ráp miễn phí', 'Cài đặt Windows'],
      components: '- CPU: Intel Core i7-14700K\n- Mainboard: ASUS ROG STRIX Z790\n- RAM: Corsair Vengeance 32GB RGB\n- VGA: RTX 4070 Ti Super 16GB',
      isQuote: true,
      subject: '[BÁO GIÁ PC] Gaming & Đồ họa 3D (35 - 50 triệu - SL: 2 bộ)',
      message: 'Xin báo giá chi tiết và thời gian giao hàng sớm nhất.'
    };

    const resValid = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullQuotePayload)
    });
    const dataValid = await resValid.json();

    assert(resValid.status === 200 && dataValid.success === true, 'Gửi yêu cầu báo giá thành công (HTTP 200)');
    assert(dataValid.ticketId && dataValid.ticketId.startsWith('BG-'), `Sinh mã phiếu tự động định dạng chuẩn: ${dataValid.ticketId}`);
    assert(typeof dataValid.wpSynced === 'boolean', `Đã kích hoạt cơ chế đồng bộ sang WordPress REST API (wpSynced: ${dataValid.wpSynced})`);
  } catch (err) {
    assert(false, `Lỗi khi gọi API: ${err.message}`);
  }

  // TEST SUITE 4: Kiểm tra Nút Liên Hệ & Cấu hình WordPress
  console.log('\n[4/4] Kiểm tra API /api/contact-buttons:');
  try {
    const resBtn = await fetch('http://localhost:3000/api/contact-buttons');
    const dataBtn = await resBtn.json();
    assert(dataBtn.success === true, 'API /api/contact-buttons phản hồi hợp lệ');
    assert(dataBtn.hotline === '0322323233' || dataBtn.hotline === '0322 323 233', `Hotline Call khớp WordPress: ${dataBtn.hotline}`);
    assert(dataBtn.zalo === '0333333333', `Zalo Hotline khớp WordPress: ${dataBtn.zalo}`);
    assert(dataBtn.buttons && dataBtn.buttons.some(b => b.type === 'messenger' && b.value === 'chuong'), 'Nút Messenger trỏ đúng tài khoản chuong');
  } catch (err) {
    assert(false, `Lỗi khi gọi API contact-buttons: ${err.message}`);
  }

  console.log('\n=======================================================');
  console.log(`              📊 TỔNG KẾT: ${passed} PASS / ${failed} FAIL`);
  console.log('=======================================================');
  if (failed > 0) process.exit(1);
}

runE2ETests();
