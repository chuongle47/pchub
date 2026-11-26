import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\\\Users\\\\Le Van Chuong\\\\.gemini\\\\antigravity\\\\brain\\\\7832beba-beeb-4910-9297-729bb150ed86';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'audit_screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Load .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
let testEmail = 'admin@pchub.vn';
let testPassword = 'admin123456';

envContent.split('\n').forEach(line => {
  const match1 = line.match(/^ADMIN_TEST_EMAIL=(.*)$/);
  if (match1) testEmail = match1[1].trim().replace(/^["']|["']$/g, '');
  const match2 = line.match(/^ADMIN_TEST_PASSWORD=(.*)$/);
  if (match2) testPassword = match2[1].trim().replace(/^["']|["']$/g, '');
});

console.log(`Using test credentials: ${testEmail} / ******`);

const ROUTES = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Sản phẩm', path: '/admin/products' },
  { name: 'Thêm sản phẩm mới', path: '/admin/products/new' },
  { name: 'Danh mục linh kiện', path: '/admin/categories' },
  { name: 'Thương hiệu', path: '/admin/brands' },
  { name: 'Quản lý đơn hàng', path: '/admin/orders' },
  { name: 'Báo giá & Cấu hình', path: '/admin/quotes' },
  { name: 'Danh sách khách hàng', path: '/admin/customers' },
  { name: 'Đánh giá & Review', path: '/admin/reviews' },
  { name: 'Hộp thư liên hệ', path: '/admin/contacts' },
  { name: 'Chiến dịch Flash Sale', path: '/admin/flash-sales' },
  { name: 'Mã giảm giá (Coupon)', path: '/admin/coupons' },
  { name: 'Bài viết & Cẩm nang', path: '/admin/posts' },
  { name: 'Trợ lý AI Advisor', path: '/admin/ai-advisor' },
  { name: 'Luật tương thích PC', path: '/admin/compat-rules' },
  { name: 'Vận chuyển & Thuế', path: '/admin/shipping' },
  { name: 'Nhật ký Audit Log', path: '/admin/audit-logs' },
  { name: 'Cài đặt hệ thống', path: '/admin/settings' },
];

async function runAudit() {
  const browser = await chromium.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const auditResults = [];

  // 1. Security Check: Access without login
  console.log('--- Checking Security: Route protection ---');
  let redirectedToLogin = false;
  try {
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
    const currentUrl = page.url();
    redirectedToLogin = currentUrl.includes('/admin/login');
    console.log(`Security check: accessed /admin -> redirected to: ${currentUrl} (Passed: ${redirectedToLogin})`);
  } catch (err) {
    console.error('Security check error:', err);
  }

  // 2. Perform Login
  console.log('--- Performing Login ---');
  await page.goto('http://localhost:3000/admin/login');
  await page.fill('input[type="text"], input[name="username"], input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin**', { timeout: 10000 });
  console.log('Login successful! Current URL:', page.url());

  // 3. Audit each route
  for (const route of ROUTES) {
    console.log(`\nAuditing: ${route.name} (${route.path})`);
    const routeErrors = [];
    const networkErrors = [];

    const onConsole = (msg) => {
      if (msg.type() === 'error') {
        routeErrors.push(msg.text());
      }
    };

    const onResponse = (resp) => {
      if (resp.status() >= 400 && !resp.url().includes('favicon.ico')) {
        networkErrors.push(`${resp.status()} ${resp.url()}`);
      }
    };

    page.on('console', onConsole);
    page.on('response', onResponse);

    try {
      await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(800);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      const safeName = route.path.replace(/\//g, '_').replace(/^_/, '');
      const desktopFile = path.join(SCREENSHOTS_DIR, `${safeName}_desktop.png`);
      await page.screenshot({ path: desktopFile, fullPage: false });

      // Tablet Viewport (768px)
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(400);
      const tabletFile = path.join(SCREENSHOTS_DIR, `${safeName}_tablet.png`);
      await page.screenshot({ path: tabletFile, fullPage: false });

      // Mobile Viewport (390px)
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);
      const mobileHasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      const mobileFile = path.join(SCREENSHOTS_DIR, `${safeName}_mobile.png`);
      await page.screenshot({ path: mobileFile, fullPage: false });

      // Restore desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });

      auditResults.push({
        name: route.name,
        path: route.path,
        status: 'OK',
        consoleErrors: [...routeErrors],
        networkErrors: [...networkErrors],
        desktopScrollX: hasHorizontalScroll,
        mobileScrollX: mobileHasHorizontalScroll,
        screenshots: {
          desktop: desktopFile,
          tablet: tabletFile,
          mobile: mobileFile
        }
      });

      console.log(`  Console Errors: ${routeErrors.length}`);
      if (routeErrors.length > 0) console.log(`    -> ${routeErrors.slice(0, 2).join(' | ')}`);
      console.log(`  Network Errors: ${networkErrors.length}`);
      if (networkErrors.length > 0) console.log(`    -> ${networkErrors.slice(0, 2).join(' | ')}`);
      console.log(`  Horizontal Overflow: desktop=${hasHorizontalScroll}, mobile=${mobileHasHorizontalScroll}`);
    } catch (err) {
      console.error(`  Failed on ${route.path}:`, err.message);
      auditResults.push({
        name: route.name,
        path: route.path,
        status: 'ERROR',
        error: err.message,
        consoleErrors: [...routeErrors],
        networkErrors: [...networkErrors],
      });
    } finally {
      page.off('console', onConsole);
      page.off('response', onResponse);
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'audit_results.json'),
    JSON.stringify({ securityRedirect: redirectedToLogin, results: auditResults }, null, 2),
    'utf-8'
  );

  console.log('\nAudit complete! Saved audit_results.json and all screenshots.');
}

runAudit().catch(console.error);
