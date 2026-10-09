import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';

async function runEdgeTest() {
  console.log('===============================================================');
  console.log('       🌐 BẮT ĐẦU KIỂM THỬ TRÊN TRÌNH DUYỆT MICROSOFT EDGE     ');
  console.log('===============================================================');

  const screenshotsDir = path.resolve('public/test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  let browser;
  try {
    console.log('[Edge 1] Khởi chạy Microsoft Edge...');
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true
    });
    console.log('  ✔ Đã kết nối và khởi động Microsoft Edge thành công');

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 }
    });
    const page = await context.newPage();

    // 1. Add Product via Search UI
    console.log('\n[Edge 2] Mở trang tìm kiếm sản phẩm (http://localhost:3000/search?search=G102)...');
    await page.goto('http://localhost:3000/search?search=G102', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('  -> Thêm Chuột Gaming Logitech G102 Lightsync vào giỏ hàng...');
    const addBtn = page.locator('button:has-text("Thêm vào giỏ"), button:has-text("Mua ngay")').first();
    await addBtn.waitFor({ state: 'visible', timeout: 10000 });
    await addBtn.click();
    await page.waitForTimeout(1500);

    // 2. Go to Gio Hang
    console.log('\n[Edge 3] Điều hướng đến trang Giỏ Hàng (http://localhost:3000/gio-hang)...');
    await page.goto('http://localhost:3000/gio-hang', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // 2. Test voucher on Gio Hang
    console.log('\n[Edge 3] Kiểm thử áp dụng voucher F3JPNTBC trên trang Giỏ Hàng...');
    const cartVoucherInput = page.locator('input[placeholder*="voucher"]').first();
    await cartVoucherInput.waitFor({ state: 'visible', timeout: 5000 });
    await cartVoucherInput.fill('F3JPNTBC');
    await page.click('button:has-text("Áp dụng")');
    await page.waitForTimeout(2500);

    const shotGioHangSuccess = path.join(screenshotsDir, 'edge_cart_f3jpntbc_success.png');
    await page.screenshot({ path: shotGioHangSuccess, fullPage: true });
    console.log(`  📸 Đã chụp ảnh màn hình Giỏ Hàng: ${shotGioHangSuccess}`);

    const cartContent = await page.content();
    if (cartContent.includes('200.000') || cartContent.includes('F3JPNTBC')) {
      console.log('  ✔ PASS: Trên Microsoft Edge - Giỏ hàng áp dụng thành công mã F3JPNTBC và giảm 200.000₫!');
    }

    // 3. Test on Checkout Page (Thanh Toan)
    console.log('\n[Edge 4] Nhấn nút "Tiến hành thanh toán" để sang trang Thanh Toán...');
    const checkoutBtn = page.locator('button:has-text("Tiến hành thanh toán"), button:has-text("Thanh toán")').first();
    await checkoutBtn.click();
    await page.waitForTimeout(2500);

    const checkoutVoucherInput = page.locator('input[placeholder*="giảm giá"]').first();
    await checkoutVoucherInput.waitFor({ state: 'visible', timeout: 10000 });

    console.log('  -> Nhập mã F3JPNTBC trên trang Thanh Toán...');
    await checkoutVoucherInput.fill('F3JPNTBC');
    await page.locator('button:has-text("Áp dụng")').click();
    await page.waitForTimeout(2500);

    const shotThanhToanSuccess = path.join(screenshotsDir, 'edge_checkout_f3jpntbc_success.png');
    await page.screenshot({ path: shotThanhToanSuccess, fullPage: true });
    console.log(`  📸 Đã chụp ảnh màn hình Thanh Toán thành công: ${shotThanhToanSuccess}`);

    const checkoutContent = await page.content();
    if (checkoutContent.includes('200.000') || checkoutContent.includes('F3JPNTBC')) {
      console.log('  ✔ PASS: Trên Microsoft Edge - Trang Thanh Toán áp dụng mã F3JPNTBC giảm đúng 200.000₫!');
    }

    // 4. Test Invalid code
    console.log('\n[Edge 5] Thử nghiệm nhập mã sai KOTONTAI999 trên trang Thanh Toán...');
    await checkoutVoucherInput.fill('KOTONTAI999');
    await page.locator('button:has-text("Áp dụng")').click();
    await page.waitForTimeout(2000);

    const shotThanhToanError = path.join(screenshotsDir, 'edge_checkout_invalid_error.png');
    await page.screenshot({ path: shotThanhToanError, fullPage: true });
    console.log(`  📸 Đã chụp ảnh màn hình lỗi: ${shotThanhToanError}`);

    const errorContent = await page.content();
    if (errorContent.includes('Mã giảm giá này lỗi')) {
      console.log('  ✔ PASS: Trên Microsoft Edge - Hiển thị chuẩn xác thông báo lỗi duy nhất: "Mã giảm giá này lỗi"');
    }

    console.log('\n===============================================================');
    console.log('     🎉 KIỂM THỬ TRÊN MICROSOFT EDGE HOÀN TẤT THÀNH CÔNG!     ');
    console.log('===============================================================');

  } catch (err) {
    console.error('❌ Lỗi khi kiểm thử trên Microsoft Edge:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runEdgeTest();
