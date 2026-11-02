import pg from 'pg';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
let supabaseUrl = 'https://nlalyoyazlgsimzudtxw.supabase.co';
let anonKey = '';

for (const line of envText.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/"/g, '');
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) anonKey = line.split('=')[1].trim().replace(/"/g, '');
}

const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
const prodBase = 'https://pchub-iota.vercel.app';

const results = {
  passed: [],
  failed: [],
};

function pass(name, detail = '') {
  console.log(`  ✅ [PASS] ${name} ${detail ? `(${detail})` : ''}`);
  results.passed.push({ name, detail });
}

function fail(name, error) {
  console.error(`  ❌ [FAIL] ${name}:`, error);
  results.failed.push({ name, error });
}

async function testSupabaseDatabase() {
  console.log('\n================ 1. KIỂM TRA DATABASE SUPABASE ================');
  try {
    // 1. Kiểm tra bảng products
    const pCount = await pool.query('SELECT count(*) FROM products WHERE is_active = true');
    const totalProd = Number(pCount.rows[0].count);
    if (totalProd > 1000) {
      pass('Bảng products', `Tổng sản phẩm hoạt động: ${totalProd}`);
    } else {
      fail('Bảng products', `Số lượng sản phẩm quá ít: ${totalProd}`);
    }

    // Kiểm tra sạch rác sbuy
    const junkCount = await pool.query("SELECT count(*) FROM products WHERE name ILIKE '%bảo hiểm%' OR images::text ILIKE '%sbuy.io.vn%' OR category_id IS NULL");
    const junks = Number(junkCount.rows[0].count);
    if (junks === 0) {
      pass('Dọn rác sbuy', '0 sản phẩm rác sbuy / bảo hiểm xe máy tồn tại');
    } else {
      fail('Dọn rác sbuy', `Còn ${junks} sản phẩm rác!`);
    }

    // 2. Kiểm tra bảng categories
    const catCount = await pool.query('SELECT count(*) FROM categories WHERE is_active = true');
    pass('Bảng categories', `${catCount.rows[0].count} danh mục hoạt động`);

    // 3. Kiểm tra bảng brands
    const bCount = await pool.query('SELECT count(*) FROM brands WHERE is_active = true');
    pass('Bảng brands', `${bCount.rows[0].count} thương hiệu`);

    // 4. Kiểm tra Flash Sale
    const fsCount = await pool.query('SELECT fs.id, fs.name, count(fsi.id) as item_count FROM flash_sales fs LEFT JOIN flash_sale_items fsi ON fs.id = fsi.sale_id WHERE fs.is_active = true GROUP BY fs.id, fs.name');
    if (fsCount.rows.length > 0) {
      pass('Bảng flash_sales & items', `Chiến dịch: "${fsCount.rows[0].name}" có ${fsCount.rows[0].item_count} deal linh kiện`);
    } else {
      fail('Bảng flash_sales', 'Không có chiến dịch flash sale nào active');
    }

    // 5. Kiểm tra Coupons
    const cCount = await pool.query('SELECT count(*) FROM coupons WHERE is_active = true');
    pass('Bảng coupons', `${cCount.rows[0].count} mã giảm giá active`);

    // 6. Kiểm tra Posts
    const postCount = await pool.query('SELECT count(*) FROM posts');
    pass('Bảng posts', `${postCount.rows[0].count} bài viết`);

    // 7. Kiểm tra Reviews
    const revCount = await pool.query('SELECT count(*) FROM reviews');
    pass('Bảng reviews', `${revCount.rows[0].count} đánh giá`);

    // 8. Kiểm tra Orders
    const ordCount = await pool.query('SELECT count(*) FROM orders');
    pass('Bảng orders', `${ordCount.rows[0].count} đơn hàng`);

  } catch (err) {
    fail('Database connection', err.message);
  }
}

async function testApiEndpoints() {
  console.log('\n================ 2. KIỂM TRA API ENDPOINTS (STOREFRONT & ADMIN) ================');

  // Test 1: GET /api/flash-sale
  try {
    const res = await fetch(`${prodBase}/api/flash-sale`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        const first = data.products[0];
        const isSbuy = first.name.includes('Bảo hiểm') || first.image?.includes('sbuy.io.vn');
        if (!isSbuy) {
          pass('API /api/flash-sale', `Trả về ${data.products.length} deal chuẩn PC: "${first.name}"`);
        } else {
          fail('API /api/flash-sale', `Vẫn còn sản phẩm sbuy: ${first.name}`);
        }
      } else {
        fail('API /api/flash-sale', 'Không có sản phẩm nào được trả về');
      }
    } else {
      fail('API /api/flash-sale', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/flash-sale', err.message);
  }

  // Test 2: GET /api/products (Lấy danh sách sản phẩm)
  try {
    const res = await fetch(`${prodBase}/api/products?limit=5`);
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        pass('API /api/products', `Lấy thành công ${data.products.length} sản phẩm từ Supabase. Tổng: ${data.pagination?.total || 'N/A'}`);
      } else {
        fail('API /api/products', 'Không tìm thấy sản phẩm');
      }
    } else {
      fail('API /api/products', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/products', err.message);
  }

  // Test 3: GET /api/categories
  try {
    const res = await fetch(`${prodBase}/api/categories`);
    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : (data.categories?.length || 0);
      pass('API /api/categories', `Trả về ${count} danh mục linh kiện`);
    } else {
      fail('API /api/categories', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/categories', err.message);
  }

  // Test 4: GET /api/vouchers (Danh sách mã giảm giá)
  try {
    const res = await fetch(`${prodBase}/api/vouchers`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.vouchers)) {
        pass('API /api/vouchers', `Trả về ${data.vouchers.length} voucher khả dụng`);
      } else {
        fail('API /api/vouchers', 'Format trả về không đúng');
      }
    } else {
      fail('API /api/vouchers', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/vouchers', err.message);
  }

  // Test 5: POST /api/vouchers/validate (Kiểm tra áp mã)
  try {
    const res = await fetch(`${prodBase}/api/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'PCHUB10',
        totalPrice: 2000000,
        shippingFee: 30000,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.discount > 0) {
        pass('API /api/vouchers/validate', `Áp mã PCHub10 thành công, giảm ${data.discount.toLocaleString('vi-VN')}₫ (Nguồn: ${data.source})`);
      } else {
        fail('API /api/vouchers/validate', 'Áp mã thất bại hoặc discount = 0');
      }
    } else {
      fail('API /api/vouchers/validate', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/vouchers/validate', err.message);
  }

  // Test 6: GET /api/posts (Danh sách bài viết blog)
  try {
    const res = await fetch(`${prodBase}/api/posts?limit=3`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        pass('API /api/posts', `Lấy thành công bài viết từ Supabase (${data.posts.length} bài)`);
      } else {
        fail('API /api/posts', 'Format trả về không đúng');
      }
    } else {
      fail('API /api/posts', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/posts', err.message);
  }

  // Test 7: GET /api/reviews
  try {
    const res = await fetch(`${prodBase}/api/reviews?productId=d1000000-0000-0000-0000-000000000001`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        pass('API /api/reviews', `API đánh giá hoạt động trơn tru (${data.reviews.length} reviews)`);
      } else {
        fail('API /api/reviews', 'Format trả về không đúng');
      }
    } else {
      fail('API /api/reviews', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/reviews', err.message);
  }

  // Test 8: GET /api/woocommerce/checkout-config (Cấu hình thanh toán & ship)
  try {
    const res = await fetch(`${prodBase}/api/woocommerce/checkout-config`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.paymentGateways?.length > 0 && data.shippingMethods?.length > 0) {
        pass('API /api/woocommerce/checkout-config', `Thanh toán (${data.paymentGateways.length} cổng) & Vận chuyển (${data.shippingMethods.length} phương thức)`);
      } else {
        fail('API /api/woocommerce/checkout-config', 'Thiếu gateways hoặc shipping methods');
      }
    } else {
      fail('API /api/woocommerce/checkout-config', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/woocommerce/checkout-config', err.message);
  }

  // Test 9: GET /api/contact-buttons
  try {
    const res = await fetch(`${prodBase}/api/contact-buttons`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.buttons?.length > 0) {
        pass('API /api/contact-buttons', `Nút liên hệ hoạt động (${data.buttons.length} nút)`);
      } else {
        fail('API /api/contact-buttons', 'Thiếu buttons');
      }
    } else {
      fail('API /api/contact-buttons', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('API /api/contact-buttons', err.message);
  }
}

async function testWebPages() {
  console.log('\n================ 3. KIỂM TRA CÁC TRANG WEB (HTTP STATUS) ================');
  const pagesToTest = [
    { url: '/', label: 'Trang chủ' },
    { url: '/search', label: 'Tìm kiếm sản phẩm' },
    { url: '/gio-hang', label: 'Giỏ hàng' },
    { url: '/thanh-toan', label: 'Thanh toán' },
    { url: '/build-pc', label: 'Xây dựng cấu hình PC' },
    { url: '/blog', label: 'Tin tức & Đánh giá' },
    { url: '/community', label: 'Góc Build PC' },
    { url: '/lien-he', label: 'Liên hệ tư vấn' },
    { url: '/admin/login', label: 'Trang đăng nhập Admin' },
  ];

  for (const page of pagesToTest) {
    try {
      const res = await fetch(`${prodBase}${page.url}`, { redirect: 'manual' });
      if (res.status === 200 || res.status === 307 || res.status === 308) {
        pass(`Trang ${page.label} (${page.url})`, `HTTP Status ${res.status}`);
      } else {
        fail(`Trang ${page.label} (${page.url})`, `HTTP Status ${res.status}`);
      }
    } catch (err) {
      fail(`Trang ${page.label} (${page.url})`, err.message);
    }
  }
}

async function testOrderFlowSimulation() {
  console.log('\n================ 4. KIỂM TRA LUỒNG ĐẶT HÀNG TỰ ĐỘNG ================');
  try {
    // Tìm 1 sản phẩm có sẵn trong DB để đặt thử
    const prodRes = await pool.query('SELECT id, name, price, sku FROM products WHERE is_active = true LIMIT 1');
    if (prodRes.rows.length === 0) {
      fail('Test đặt hàng', 'Không có sản phẩm nào để test');
      return;
    }
    const testProd = prodRes.rows[0];

    const orderPayload = {
      customer_name: 'Khách Test Tự Động',
      phone: '0987654321',
      email: 'test-order@pchub.vn',
      shipping_address: '123 Đường Linh Kiện, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      subtotal: Number(testProd.price),
      shipping_fee: 30000,
      discount: 0,
      total: Number(testProd.price) + 30000,
      payment_method: 'cod',
      note: 'Đơn test tự động kiểm thử hệ thống',
      items: [
        {
          product_id: testProd.id,
          name: testProd.name,
          sku: testProd.sku,
          price: Number(testProd.price),
          quantity: 1,
        }
      ],
    };

    const res = await fetch(`${prodBase}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.orderId) {
        pass('Luồng tạo đơn hàng', `Tạo đơn thành công với Mã đơn: #${data.orderId}`);

        // Kiểm tra xem đơn có trong Supabase không
        const checkDb = await pool.query('SELECT id, code, customer_name, total FROM orders WHERE code = $1 OR order_number = $1', [data.orderId]);
        if (checkDb.rows.length > 0) {
          pass('Đồng bộ đơn hàng Supabase', `Đơn hàng #${data.orderId} đã ghi nhận thành công vào bảng orders của Admin!`);
          
          // Dọn dẹp đơn hàng test
          await pool.query('DELETE FROM order_items WHERE order_id = $1', [checkDb.rows[0].id]);
          await pool.query('DELETE FROM orders WHERE id = $1', [checkDb.rows[0].id]);
          pass('Dọn dẹp dữ liệu test', 'Đã xóa bản ghi đơn test sạch sẽ');
        } else {
          fail('Đồng bộ đơn hàng Supabase', 'Đơn hàng chưa được ghi vào DB');
        }
      } else {
        fail('Luồng tạo đơn hàng', data.error || 'Tạo đơn không thành công');
      }
    } else {
      fail('Luồng tạo đơn hàng', `HTTP Status ${res.status}`);
    }
  } catch (err) {
    fail('Luồng tạo đơn hàng', err.message);
  }
}

async function main() {
  console.log('🚀 BẮT ĐẦU CHẠY BỘ KIỂM THỬ TOÀN DIỆN PCHUB (PRODUCTION & SUPABASE)...');
  const startTime = Date.now();

  await testSupabaseDatabase();
  await testApiEndpoints();
  await testWebPages();
  await testOrderFlowSimulation();

  await pool.end();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n================ TỔNG KẾT KẾT QUẢ KIỂM THỬ ================');
  console.log(`⏱️ Thời gian thực thi: ${duration}s`);
  console.log(`✅ Thành công: ${results.passed.length} bài test`);
  console.log(`❌ Thất bại: ${results.failed.length} bài test`);

  if (results.failed.length > 0) {
    console.log('\nDanh sách bài test thất bại:');
    results.failed.forEach(f => console.log(` - ${f.name}: ${f.error}`));
  } else {
    console.log('\n🎉 TOÀN BỘ HỆ THỐNG ĐÃ VƯỢT QUA TẤT CẢ CÁC BÀI TEST 100%!');
  }
}

main();

