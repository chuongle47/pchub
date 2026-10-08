/**
 * PCHUB AUTOMATED TEST SUITE
 * Chạy kiểm thử tự động toàn diện các chức năng của hệ thống
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;
const results = [];

function assert(description, condition, extraInfo = '') {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', description, extraInfo });
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${description}`);
  } else {
    failed++;
    results.push({ status: 'FAIL', description, extraInfo });
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${description} ${extraInfo ? `(${extraInfo})` : ''}`);
  }
}

async function runTestSuite() {
  console.log('\n\x1b[36m=======================================================');
  console.log('       🚀 PCHUB AUTOMATED TEST SUITE — BẮT ĐẦU        ');
  console.log('=======================================================\x1b[0m\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: Cấu trúc địa giới hành chính (34 Tỉnh/Thành phố)
  // -------------------------------------------------------------
  console.log('\x1b[33m[1/6] Kiểm thử dữ liệu địa giới hành chính (34 Tỉnh/Thành phố)\x1b[0m');
  const locationsFile = fs.readFileSync(path.resolve('src/data/vietnam-locations.ts'), 'utf-8');
  
  assert('Tệp dữ liệu địa phương tồn tại và hợp lệ', locationsFile.length > 1000);
  assert('Định nghĩa 6 Thành phố trực thuộc Trung ương', locationsFile.includes("'TP. Hồ Chí Minh'") && locationsFile.includes("'TP. Hà Nội'") && locationsFile.includes("'TP. Huế'") && locationsFile.includes("'TP. Đà Nẵng'") && locationsFile.includes("'TP. Cần Thơ'") && locationsFile.includes("'TP. Hải Phòng'"));
  assert('Hỗ trợ tìm kiếm tra cứu Tỉnh & Phường Xã', locationsFile.includes('searchProvinces') && locationsFile.includes('getWardsForProvince'));
  assert('Ánh xạ tương thích ngược LEGACY_PROVINCE_MAP', locationsFile.includes('LEGACY_PROVINCE_MAP'));

  // -------------------------------------------------------------
  // TEST GROUP 2: Hệ thống Voucher & Tính toán giảm giá
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[2/6] Kiểm thử Hệ thống Voucher & Tính toán giảm giá\x1b[0m');
  const vouchersFile = fs.readFileSync(path.resolve('src/lib/vouchers.ts'), 'utf-8');
  assert('Tệp cấu hình voucher tồn tại', vouchersFile.includes('AVAILABLE_VOUCHERS') && vouchersFile.includes('calculateVoucherDiscount'));
  assert('Hỗ trợ mã giảm 10% (PCHUB10)', vouchersFile.includes("'PCHUB10'"));
  assert('Hỗ trợ mã giảm 50K (SAVE50K)', vouchersFile.includes("'SAVE50K'"));
  assert('Hỗ trợ mã miễn phí vận chuyển (FREESHIP)', vouchersFile.includes("'FREESHIP'"));
  assert('Hỗ trợ mã khách mới (PCNEW10)', vouchersFile.includes("'PCNEW10'"));

  // -------------------------------------------------------------
  // TEST GROUP 3: WooCommerce Shipping & Payment Gateways Config
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[3/6] Kiểm thử Cổng thanh toán & Vận chuyển WooCommerce\x1b[0m');
  const baseUrl = 'https://sbuy.io.vn';
  const key = 'ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e';
  const secret = 'cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873';
  const authHeader = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');

  try {
    const payRes = await fetch(`${baseUrl}/wp-json/wc/v3/payment_gateways`, {
      headers: { Authorization: authHeader }
    });
    assert('Kết nối WooCommerce Payment Gateways API thành công (HTTP 200)', payRes.ok, `Status: ${payRes.status}`);
    
    if (payRes.ok) {
      const gateways = await payRes.json();
      const cod = gateways.find(g => g.id === 'cod');
      const bacs = gateways.find(g => g.id === 'bacs');
      assert('Cổng thanh toán COD (Tiền mặt) kích hoạt trong WooCommerce', cod && cod.enabled);
      assert('Cổng thanh toán BACS (Chuyển khoản) kích hoạt trong WooCommerce', bacs && bacs.enabled);
    }
  } catch (err) {
    assert('Kết nối WooCommerce Payment Gateways API thành công', false, err.message);
  }

  try {
    const shipRes = await fetch(`${baseUrl}/wp-json/wc/v3/shipping/zones/1/methods`, {
      headers: { Authorization: authHeader }
    });
    assert('Kết nối WooCommerce Shipping Zones API thành công (HTTP 200)', shipRes.ok, `Status: ${shipRes.status}`);
    
    if (shipRes.ok) {
      const methods = await shipRes.json();
      assert('WooCommerce có ít nhất 1 phương thức vận chuyển được cấu hình', Array.isArray(methods) && methods.length > 0);
    }
  } catch (err) {
    assert('Kết nối WooCommerce Shipping Zones API thành công', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST GROUP 4: Kiểm thử cơ chế kiểm duyệt Review (Moderation)
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[4/6] Kiểm thử Cơ chế Kiểm duyệt Đánh giá & Bình luận\x1b[0m');
  const sbuyFile = fs.readFileSync(path.resolve('src/lib/sbuy.ts'), 'utf-8');
  assert('Đánh giá mới gửi với status="hold" (chờ kiểm duyệt)', sbuyFile.includes("status: 'hold'"));
  assert('Hệ thống chỉ query đánh giá đã duyệt (status=approved)', sbuyFile.includes("status=approved"));

  try {
    const revRes = await fetch(`${baseUrl}/wp-json/wc/v3/products/reviews?status=approved&per_page=10`, {
      headers: { Authorization: authHeader }
    });
    assert('Truy vấn danh sách đánh giá đã duyệt từ WooCommerce thành công', revRes.ok);
    if (revRes.ok) {
      const reviews = await revRes.json();
      const allApproved = Array.isArray(reviews) && reviews.every(r => r.status === 'approved');
      assert('100% đánh giá trả về cho người dùng đều có trạng thái approved', allApproved);
    }
  } catch (err) {
    assert('Truy vấn danh sách đánh giá đã duyệt thành công', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST GROUP 5: Kiểm thử Sản phẩm & Danh mục WooCommerce
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[5/6] Kiểm thử Dữ liệu Sản phẩm & Danh mục\x1b[0m');
  try {
    const prodRes = await fetch(`${baseUrl}/wp-json/wc/v3/products?per_page=10`, {
      headers: { Authorization: authHeader }
    });
    assert('Truy vấn danh mục sản phẩm WooCommerce thành công', prodRes.ok);
    if (prodRes.ok) {
      const products = await prodRes.json();
      assert('Có danh sách sản phẩm hợp lệ từ WooCommerce', Array.isArray(products) && products.length > 0);
      assert('Sản phẩm có đầy đủ ID, Tên và Giá bán', products.every(p => p.id && p.name && (p.price !== undefined)));
    }
  } catch (err) {
    assert('Truy vấn danh mục sản phẩm WooCommerce thành công', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST GROUP 6: Kiểm thử luồng Đặt hàng & Checkout API
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[6/6] Kiểm thử Checkout API & Order Sync Endpoints\x1b[0m');
  const checkoutConfigFile = fs.readFileSync(path.resolve('src/app/api/woocommerce/checkout-config/route.ts'), 'utf-8');
  assert('API /api/woocommerce/checkout-config tồn tại và cấu hình dynamic', checkoutConfigFile.includes('fetchSbuyWooCommercePaymentGateways') && checkoutConfigFile.includes('fetchSbuyWooCommerceShippingMethods'));

  const orderCreateFile = fs.readFileSync(path.resolve('src/app/api/orders/create/route.ts'), 'utf-8');
  assert('API /api/orders/create đồng bộ đơn hàng sang WooCommerce', orderCreateFile.includes('createSbuyWooCommerceOrder'));

  const checkoutPageFile = fs.readFileSync(path.resolve('src/app/thanh-toan/page.tsx'), 'utf-8');
  assert('Trang thanh toán tích hợp dynamic WooCommerce Shipping & Gateways', checkoutPageFile.includes('/api/woocommerce/checkout-config') && checkoutPageFile.includes('shippingOptions') && checkoutPageFile.includes('paymentMethods'));
  assert('Trang thanh toán có đầy đủ box Chuyển khoản BACS & Tiền mặt COD', checkoutPageFile.includes("payment === 'bacs'") && checkoutPageFile.includes("payment === 'cod'") && checkoutPageFile.includes("payment === 'wallet'"));

  // -------------------------------------------------------------
  // TỔNG KẾT KẾT QUẢ KIỂM THỬ
  // -------------------------------------------------------------
  console.log('\n\x1b[36m=======================================================');
  console.log('              📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ             ');
  console.log('=======================================================\x1b[0m');
  console.log(`  Tổng số test case: \x1b[1m${passed + failed}\x1b[0m`);
  console.log(`  Thành công:        \x1b[32m\x1b[1m${passed} PASS\x1b[0m`);
  console.log(`  Thất bại:          \x1b[${failed > 0 ? '31' : '32'}m\x1b[1m${failed} FAIL\x1b[0m`);
  
  if (failed === 0) {
    console.log('\n\x1b[32m🎉 TẤT CẢ CÁC BÀI KIỂM THỬ TỰ ĐỘNG ĐỀU ĐẠT CHUẨN 100%!\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\n\x1b[31m⚠️ CÓ TEST CASE BỊ LỖI. VUI LÒNG KIỂM TRA LẠI!\x1b[0m\n');
    process.exit(1);
  }
}

runTestSuite();
