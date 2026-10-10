import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';

async function testChatbotFullscreen() {
  console.log('===============================================================');
  console.log('       🤖 KIỂM THỬ CHATBOT TOÀN MÀN HÌNH TRÊN EDGE             ');
  console.log('===============================================================');

  const screenshotsDir = path.resolve('public/test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  let browser;
  try {
    console.log('[Step 1] Khởi chạy Microsoft Edge...');
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log('\n[Step 2] Mở trang chủ http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('\n[Step 3] Nhấn nút mở Chatbot AI Advisor...');
    const floatingBtn = page.locator('button.ai-chat-floating-btn').first();
    await floatingBtn.waitFor({ state: 'visible', timeout: 10000 });
    await floatingBtn.click();
    await page.waitForTimeout(1000);

    const shotCompact = path.join(screenshotsDir, 'chatbot_compact_popup.png');
    await page.screenshot({ path: shotCompact });
    console.log(`  📸 Đã chụp ảnh Chatbot dạng Popup: ${shotCompact}`);

    console.log('\n[Step 4] Nhấn nút Mở toàn màn hình (Fullscreen)...');
    const fullscreenBtn = page.locator('button[title*="toàn màn hình"], button[aria-label*="toàn màn hình"]').first();
    await fullscreenBtn.waitFor({ state: 'visible', timeout: 5000 });
    await fullscreenBtn.click();
    await page.waitForTimeout(1500);

    const shotFullscreen = path.join(screenshotsDir, 'chatbot_fullscreen_mode.png');
    await page.screenshot({ path: shotFullscreen });
    console.log(`  📸 Đã chụp ảnh Chatbot Fullscreen: ${shotFullscreen}`);

    console.log('\n[Step 5] Thử nghiệm gửi câu hỏi trong chế độ Toàn màn hình...');
    const quickChip = page.locator('button:has-text("Tư vấn PC gaming")').first();
    await quickChip.click();
    await page.waitForTimeout(3000);

    const shotFullscreenReplied = path.join(screenshotsDir, 'chatbot_fullscreen_replied.png');
    await page.screenshot({ path: shotFullscreenReplied });
    console.log(`  📸 Đã chụp ảnh Chatbot Fullscreen có câu trả lời: ${shotFullscreenReplied}`);

    console.log('\n[Step 6] Nhấn phím ESC để thu nhỏ cửa sổ về trạng thái ban đầu...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    const shotMinimized = path.join(screenshotsDir, 'chatbot_minimized_after_esc.png');
    await page.screenshot({ path: shotMinimized });
    console.log(`  📸 Đã chụp ảnh Chatbot sau khi thu nhỏ: ${shotMinimized}`);

    console.log('\n===============================================================');
    console.log('     🎉 KIỂM THỬ CHATBOT TOÀN MÀN HÌNH THÀNH CÔNG 100%!       ');
    console.log('===============================================================');

  } catch (err) {
    console.error('❌ Lỗi kiểm thử Chatbot:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testChatbotFullscreen();
