import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\\\Users\\\\Le Van Chuong\\\\.gemini\\\\antigravity\\\\brain\\\\7832beba-beeb-4910-9297-729bb150ed86';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'wave1_screenshots');
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

async function verifyOrders() {
  const browser = await chromium.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('Logging in...');
  await page.goto('http://localhost:3000/admin/login');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
  console.log('Logged in successfully, current URL:', page.url());

  // Navigate to /admin/orders
  console.log('Testing /admin/orders...');
  await page.goto('http://localhost:3000/admin/orders', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'orders_list_1440px.png'), fullPage: false });
  console.log('Saved orders_list_1440px.png');

  // Direct Navigate to Order Detail /admin/orders/ord-0047
  console.log('Testing /admin/orders/ord-0047...');
  await page.goto('http://localhost:3000/admin/orders/ord-0047', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check elements
  const hasStepper = await page.locator('text=TIẾN TRÌNH XỬ LÝ ĐƠN HÀNG').first().isVisible().catch(() => false);
  const hasItems = await page.locator('text=/DANH SÁCH LINH KIỆN/i').first().isVisible().catch(() => false);
  const hasCustomer = await page.locator('text=/KHÁCH HÀNG & GIAO NHẬN/i').first().isVisible().catch(() => false);
  const hasPayment = await page.locator('text=/THANH TOÁN/i').first().isVisible().catch(() => false);

  console.log(`UI Elements verified: Stepper=${hasStepper}, Items=${hasItems}, Customer=${hasCustomer}, Payment=${hasPayment}`);

  // Capture Desktop (1440px)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'order_detail_1440px.png'), fullPage: true });

  // Tablet (768px)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'order_detail_768px.png'), fullPage: true });

  // Mobile (390px)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'order_detail_390px.png'), fullPage: true });

  console.log('All screenshots captured successfully!');
  console.log('Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console Errors detail:', consoleErrors);
  }

  await browser.close();
}

verifyOrders().catch(console.error);
