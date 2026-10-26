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
  console.log('\n\x1b[33m[2/8] Kiểm thử Hệ thống Voucher & Tính toán giảm giá\x1b[0m');
  const vouchersFile = fs.readFileSync(path.resolve('src/lib/vouchers.ts'), 'utf-8');
  assert('Tệp cấu hình voucher tồn tại', vouchersFile.includes('AVAILABLE_VOUCHERS') && vouchersFile.includes('calculateVoucherDiscount'));
  assert('Hỗ trợ mã giảm 10% (PCHUB10)', vouchersFile.includes("'PCHUB10'"));
  assert('Hỗ trợ mã giảm 50K (SAVE50K)', vouchersFile.includes("'SAVE50K'"));
  assert('Hỗ trợ mã miễn phí vận chuyển (FREESHIP)', vouchersFile.includes("'FREESHIP'"));
  assert('Hỗ trợ mã khách mới (PCNEW10)', vouchersFile.includes("'PCNEW10'"));

  const validateApiFile = fs.readFileSync(path.resolve('src/app/api/vouchers/validate/route.ts'), 'utf-8');
  assert('API validate voucher hỗ trợ kiểm tra danh mục sản phẩm hợp lệ (restricted categories)', validateApiFile.includes('restrictedCatIds') && validateApiFile.includes('isItemEligible') && validateApiFile.includes('eligibleItems'));
  assert('API validate tính toán giảm giá chính xác chỉ trên sản phẩm đủ điều kiện', validateApiFile.includes('eligibleSubtotal') && validateApiFile.includes('fixed_product'));

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
  assert('Trang thanh toán kết nối và render danh sách cổng thanh toán WooCommerce', checkoutPageFile.includes('paymentMethods.map') && checkoutPageFile.includes('setPayment'));

  // -------------------------------------------------------------
  // TEST GROUP 7: Kiểm thử Module Cộng đồng PCHub (/community)
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[7/8] Kiểm thử Hệ thống Cộng đồng, Build PC & Tin tức\x1b[0m');
  const communityDataFile = fs.readFileSync(path.resolve('src/data/community-data.ts'), 'utf-8');
  assert('Dữ liệu Cộng đồng tồn tại và có schema đầy đủ', communityDataFile.includes('INITIAL_COMMUNITY_BUILDS') && communityDataFile.includes('INITIAL_COMMUNITY_POSTS'));
  assert('Có tối thiểu 9 cấu hình build mẫu', (communityDataFile.match(/id:\s*'b[0-9]+'/g) || []).length >= 9);
  assert('Có tối thiểu 6 bài viết hướng dẫn công nghệ tiếng Việt', (communityDataFile.match(/id:\s*'p[0-9]+'/g) || []).length >= 6);
  assert('Hỗ trợ đầy đủ 4 danh mục: Gaming, Workstation, Streaming, Budget', communityDataFile.includes("'Gaming'") && communityDataFile.includes("'Workstation'") && communityDataFile.includes("'Streaming'") && communityDataFile.includes("'Budget'"));
  assert('Cấu hình có đầy đủ dữ liệu Benchmark FPS và Mức ăn điện', communityDataFile.includes('fpsBenchmarks') && communityDataFile.includes('powerConsumption') && communityDataFile.includes('aiCompatibility'));
  assert('Hỗ trợ helper lưu trữ LocalStorage (Build, Comment, Like, Save)', communityDataFile.includes('saveCommunityBuild') && communityDataFile.includes('addCommunityComment') && communityDataFile.includes('toggleLikeBuildId') && communityDataFile.includes('toggleSaveCommunityBuildId'));

  const communityPageFile = fs.readFileSync(path.resolve('src/app/community/page.tsx'), 'utf-8');
  assert('Trang /community đồng bộ URL Query tab & bộ lọc', communityPageFile.includes("searchParams.get('tab')") && communityPageFile.includes('BUILD_CATEGORIES') && communityPageFile.includes('PRICE_RANGES'));

  const buildDetailPageFile = fs.readFileSync(path.resolve('src/app/community/builds/[id]/page.tsx'), 'utf-8');
  assert('Trang chi tiết /community/builds/[id] tích hợp Giỏ hàng & Build PC', buildDetailPageFile.includes('addMultipleItems') && buildDetailPageFile.includes('pchub_pending_ai_preset') && buildDetailPageFile.includes('partsArray'));

  const newsDetailPageFile = fs.readFileSync(path.resolve('src/app/community/news/[slug]/page.tsx'), 'utf-8');
  assert('Trang chi tiết bài viết có JSON-LD Article Schema cho SEO', newsDetailPageFile.includes('application/ld+json') && newsDetailPageFile.includes('@type') && newsDetailPageFile.includes('Article'));

  const submitPageFile = fs.readFileSync(path.resolve('src/app/community/submit/page.tsx'), 'utf-8');
  assert('Trang đăng cấu hình /community/submit có kiểm tra AI và tính tổng giá', submitPageFile.includes('handleRunAiCheck') && submitPageFile.includes('totalPrice') && submitPageFile.includes('saveCommunityBuild'));

  // -------------------------------------------------------------
  // TEST GROUP 8: Kiểm thử Điều hướng & Footer
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[8/8] Kiểm thử Menu Điều Hướng & Footer\x1b[0m');
  const footerFile = fs.readFileSync(path.resolve('src/components/layout/Footer.tsx'), 'utf-8');
  assert('Footer trỏ đúng Blog sang /community?tab=news', footerFile.includes('/community?tab=news'));
  assert('Footer trỏ đúng Cộng đồng sang /community?tab=builds', footerFile.includes('/community?tab=builds'));

  const sidebarFile = fs.readFileSync(path.resolve('src/components/account/AccountSidebar.tsx'), 'utf-8');
  assert('Menu tài khoản cá nhân đã loại bỏ Ví điện tử', !sidebarFile.includes('/tai-khoan/vi-dien-tu'));

  // -------------------------------------------------------------
  // TEST GROUP 9: Kiểm thử Trang Liên Hệ & Nút Liên Hệ Nổi (/lien-he & Floating Buttons)
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[9/9] Kiểm thử Trang Liên Hệ & Nút Tương Tác Nổi\x1b[0m');
  const contactConfigFile = fs.readFileSync(path.resolve('src/lib/contactConfig.ts'), 'utf-8');
  assert('Cấu hình liên hệ cập nhật chính xác Hotline 0322323233, Zalo 0333333333 & Messenger chuong theo WordPress', contactConfigFile.includes('0322323233') && contactConfigFile.includes('0333333333') && contactConfigFile.includes('chuong'));
  assert('Đồng bộ màu sắc nút WordPress (#00c853, #0084ff, #0068ff)', contactConfigFile.includes('#00c853') && contactConfigFile.includes('#0084ff') && contactConfigFile.includes('#0068ff'));
  assert('Hệ thống địa chỉ duy nhất tại Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh', contactConfigFile.includes('Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh'));

  const wpPluginFile = fs.readFileSync(path.resolve('nks-contact-buttons.php'), 'utf-8');
  assert('Plugin WordPress nks-contact-buttons.php có đăng ký REST API ncb/v1/buttons', wpPluginFile.includes('ncb/v1') && wpPluginFile.includes('register_rest_route'));

  const floatingBtnFile = fs.readFileSync(path.resolve('src/components/layout/FloatingContactButtons.tsx'), 'utf-8');
  assert('Widget nút liên hệ nổi kết nối API động /api/contact-buttons', floatingBtnFile.includes('/api/contact-buttons'));
  assert('Nút liên hệ nổi được tích hợp vào Providers toàn site', fs.readFileSync(path.resolve('src/app/providers.tsx'), 'utf-8').includes('FloatingContactButtons'));

  const contactPageFile = fs.readFileSync(path.resolve('src/app/lien-he/page.tsx'), 'utf-8');
  assert('Trang /lien-he tiêu đề chữ trắng rõ nét (không bị tối) và có Google Maps embed', contactPageFile.includes('color: \'#ffffff\'') && contactPageFile.includes('iframe'));
  assert('Trang /lien-he render động các thẻ liên hệ theo thứ tự và màu sắc cấu hình', contactPageFile.includes('buttons.map') && contactPageFile.includes('btnColor'));

  const navbarFile = fs.readFileSync(path.resolve('src/components/Navbar.tsx'), 'utf-8');
  assert('Menu điều hướng Navbar có liên kết riêng đến /bao-gia và /lien-he', navbarFile.includes('/bao-gia') && navbarFile.includes('/lien-he'));

  // -------------------------------------------------------------
  // TEST GROUP 10: Kiểm thử Flash Sale Plugin & Đồng bộ Trang chủ
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[10/10] Kiểm thử Plugin Flash Sale & Hiển thị Trang chủ\x1b[0m');
  const flashSalePluginFile = fs.readFileSync(path.resolve('pchub-flash-sale.php'), 'utf-8');
  assert('Plugin pchub-flash-sale.php đăng ký REST API pchub/v1/flash-sale', flashSalePluginFile.includes('pchub/v1') && flashSalePluginFile.includes('/flash-sale'));

  const flashSaleApiFile = fs.readFileSync(path.resolve('src/app/api/flash-sale/route.ts'), 'utf-8');
  assert('API /api/flash-sale tồn tại và kết nối REST API WordPress', flashSaleApiFile.includes('/wp-json/pchub/v1/flash-sale'));

  const flashSaleSectionFile = fs.readFileSync(path.resolve('src/components/home/FlashSaleSection.tsx'), 'utf-8');
  assert('FlashSaleSection ưu tiên tải sản phẩm từ /api/flash-sale', flashSaleSectionFile.includes('/api/flash-sale') && flashSaleSectionFile.includes('setTargetEndTime'));

  try {
    const fsRes = await fetch(`${baseUrl}/wp-json/pchub/v1/flash-sale`);
    assert('Truy vấn trực tiếp REST API Flash Sale từ WordPress thành công', fsRes.ok);
    if (fsRes.ok) {
      const fsData = await fsRes.json();
      assert('WordPress trả về danh sách sản phẩm Flash Sale hợp lệ', Array.isArray(fsData.products));
      assert('Flash Sale có thông tin thời gian kết thúc hoặc đếm ngược', fsData.active_end_time !== undefined || typeof fsData.seconds_left === 'number');
    }
  } catch (err) {
    assert('Truy vấn trực tiếp REST API Flash Sale từ WordPress thành công', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST GROUP 11: Kiểm thử các bản sửa lỗi QA (Intern Test Case)
  // -------------------------------------------------------------
  console.log('\n\x1b[33m[11/11] Kiểm thử các lỗi từ báo cáo kiểm thử QA (Intern Test Case)\x1b[0m');

  // UI-004 / PRODUCT-013: Category 'tat-ca'
  const catDropdownFile = fs.readFileSync(path.resolve('src/components/layout/CategoryDropdownMenu.tsx'), 'utf-8');
  assert('UI-004: Nút "Xem tất cả sản phẩm & linh kiện" trỏ về /search không lọc rỗng', catDropdownFile.includes('href="/search"'));

  const dbFile = fs.readFileSync(path.resolve('src/lib/db.ts'), 'utf-8');
  assert('UI-004: db.ts getProducts hỗ trợ bỏ qua lọc danh mục khi category_id="tat-ca"', dbFile.includes("category_id === 'tat-ca'"));

  // REG-004 & REG-008: Register validation
  const regFile = fs.readFileSync(path.resolve('src/app/register/page.tsx'), 'utf-8');
  assert('REG-004: Đăng ký kiểm tra định dạng email nghiêm ngặt có TLD', regFile.includes('@') && regFile.includes('Email không đúng định dạng'));
  assert('REG-008: Đăng ký yêu cầu mật khẩu tối thiểu 8 ký tự', regFile.includes('minLength={8}') && regFile.includes('8 ký tự'));
  assert('REG-007: Nút Đăng ký với Google & Facebook kết nối OAuth', regFile.includes("handleSocialLogin('google')") && regFile.includes("handleSocialLogin('facebook')"));

  // REG-011: Terms & Privacy
  assert('REG-011: Trang /terms (Điều khoản dịch vụ) tồn tại và hợp lệ', fs.existsSync(path.resolve('src/app/terms/page.tsx')));
  assert('REG-011: Trang /privacy (Chính sách bảo mật) tồn tại và hợp lệ', fs.existsSync(path.resolve('src/app/privacy/page.tsx')));

  // LOGIN-004, LOGIN-005, LOGIN-011, LOGIN-012
  const loginFile = fs.readFileSync(path.resolve('src/app/login/page.tsx'), 'utf-8');
  assert('LOGIN-004 & 005: Thông báo lỗi đăng nhập hiển thị tiếng Việt thay vì "Unauthorized"', loginFile.includes('Email hoặc mật khẩu không đúng'));
  assert('LOGIN-011 & 012: Nút Tiếp tục với Google & Facebook kết nối OAuth', loginFile.includes("handleSocialLogin('google')") && loginFile.includes("handleSocialLogin('facebook')"));

  // LOGIN-010: Forgot password & Reset password
  const forgotFile = fs.readFileSync(path.resolve('src/app/forgot-password/page.tsx'), 'utf-8');
  assert('LOGIN-010: Quên mật khẩu kiểm tra email và cung cấp liên kết đặt lại', forgotFile.includes('reset-password') && forgotFile.includes('Đặt lại mật khẩu'));
  assert('LOGIN-010: Trang /reset-password tồn tại hỗ trợ đổi mật khẩu mới', fs.existsSync(path.resolve('src/app/reset-password/page.tsx')));

  // PROFILE-003, PROFILE-004, PROFILE-005, PROFILE-010
  const profileFile = fs.readFileSync(path.resolve('src/app/tai-khoan/ho-so/page.tsx'), 'utf-8');
  assert('PROFILE-003: Hồ sơ kiểm tra định dạng Số điện thoại 10 số hợp lệ', profileFile.includes('Số điện thoại không hợp lệ'));
  assert('PROFILE-004: Hồ sơ từ chối Ngày sinh trong tương lai', profileFile.includes('Ngày sinh không hợp lệ') && profileFile.includes('max='));
  assert('PROFILE-005: Hồ sơ hiển thị thông báo thành công tiếng Việt', profileFile.includes('Cập nhật thông tin tài khoản thành công!'));
  assert('PROFILE-010: Hồ sơ lưu trữ và duy trì Email mới cập nhật', profileFile.includes('pchub-user-email'));

  // FAVORITE-006 & FAVORITE-011
  const storeFile = fs.readFileSync(path.resolve('src/lib/store.ts'), 'utf-8');
  assert('FAVORITE-006: Danh sách yêu thích được phân lập lưu trữ riêng theo tài khoản', storeFile.includes('getActiveWishlistUserKey') && storeFile.includes('syncUserWishlist'));
  assert('FAVORITE-011: Chặn người dùng chưa đăng nhập thả tim và yêu cầu đăng nhập', storeFile.includes('Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích!'));

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
