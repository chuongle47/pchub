import { parseUserHardwareIntent } from '../src/lib/ai-query-parser';
import { matchPresetKeyFromText, AI_BUILD_PRESETS } from '../src/lib/buildPresets';
import { askGeminiPCHubAdvisor, ChatMessage } from '../src/lib/gemini';

let totalTests = 0;
let passedTests = 0;

function assert(description: string, condition: boolean) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 PCHUB AI ADVISOR & CHATBOT COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  // -----------------------------------------------------------------
  // Test 1: Parser verification for "build cấu hình với 30 triệu"
  // -----------------------------------------------------------------
  console.log('--- Test Group 1: Hardware Intent Parsing ---');
  const p1 = parseUserHardwareIntent('build cấu hình với 30 triệu');
  assert('Query "build cấu hình với 30 triệu" is recognized as isPcBuild', p1.isPcBuild === true);
  assert('Query "build cấu hình với 30 triệu" category is pc_build', p1.category === 'pc_build');
  assert('Query "build cấu hình với 30 triệu" targetPrice is 30.000.000', p1.targetPrice === 30000000);
  assert('Query "build cấu hình với 30 triệu" has no peripheral brand', !p1.brand);

  const p2 = parseUserHardwareIntent('Chuột Logitech dưới 500k');
  assert('Query "Chuột Logitech dưới 500k" category is mouse', p2.category === 'mouse');
  assert('Query "Chuột Logitech dưới 500k" brand is Logitech', p2.brand === 'Logitech');
  assert('Query "Chuột Logitech dưới 500k" maxPrice is 500.000', p2.maxPrice === 500000);

  const p3 = parseUserHardwareIntent('Màn hình Dell dưới 15 triệu');
  assert('Query "Màn hình Dell dưới 15 triệu" category is monitor', p3.category === 'monitor');
  assert('Query "Màn hình Dell dưới 15 triệu" brand is Dell', p3.brand === 'Dell');

  const p4 = parseUserHardwareIntent('VGA RTX 4060 tầm 8 - 10 triệu');
  assert('Query "VGA RTX 4060" category is gpu', p4.category === 'gpu');

  // -----------------------------------------------------------------
  // Test 2: Build Presets budget matcher
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 2: Build Presets Budget Matcher ---');
  assert('matchPresetKeyFromText("build cấu hình với 30 triệu") === "30m"', matchPresetKeyFromText('build cấu hình với 30 triệu') === '30m');
  assert('matchPresetKeyFromText("cấu hình 10 triệu") === "10m"', matchPresetKeyFromText('cấu hình 10 triệu') === '10m');
  assert('matchPresetKeyFromText("pc 15 triệu") === "15m"', matchPresetKeyFromText('pc 15 triệu') === '15m');
  assert('matchPresetKeyFromText("dàn pc 25tr") === "25m"', matchPresetKeyFromText('dàn pc 25tr') === '25m');
  assert('matchPresetKeyFromText("build pc 35 triệu") === "35m"', matchPresetKeyFromText('build pc 35 triệu') === '35m');
  assert('matchPresetKeyFromText("cấu hình 50 triệu") === "50m"', matchPresetKeyFromText('cấu hình 50 triệu') === '50m');

  // Verify preset component integrity
  const preset30m = AI_BUILD_PRESETS['30m'];
  assert('Preset 30m has CPU i5-14600KF', preset30m.components.cpu.name.includes('14600KF'));
  assert('Preset 30m has Mainboard B760', preset30m.components.mainboard.name.includes('B760'));
  assert('Preset 30m has GPU RTX 4070', preset30m.components.gpu.name.includes('RTX 4070'));
  assert('Preset 30m has 32GB RAM DDR5', preset30m.components.ram.name.includes('32GB'));
  assert('Preset 30m has SSD 1TB', preset30m.components.storage.name.includes('1TB'));
  assert('Preset 30m has 750W Gold PSU', preset30m.components.psu.name.includes('750W'));

  // -----------------------------------------------------------------
  // Test 3: Advisory output for "build cấu hình với 30 triệu"
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 3: Advisory Output Integrity ---');
  const dummyCatalog = `
- [CPU] CPU Intel Core i5-14600KF (Intel) — Giá: 6.290.000₫ [Tồn kho: 25] | Thông số: 14 nhân, 20 luồng, Socket LGA1700
- [Mainboard] Mainboard ASUS TUF GAMING B760-PLUS WIFI DDR5 (Asus) — Giá: 4.590.000₫ [Tồn kho: 18]
- [VGA] VGA GIGABYTE GeForce RTX 4070 WINDFORCE OC 12G (Gigabyte) — Giá: 15.490.000₫ [Tồn kho: 10]
- [Bàn Phím & Chuột] Chuột Logitech G PRO X SUPERLIGHT 2 (Logitech) — Giá: 3.290.000₫ [Tồn kho: 50]
`;

  const replyDirect = await askGeminiPCHubAdvisor('build cấu hình với 30 triệu', [], dummyCatalog);
  assert('Response contains "30 Triệu"', replyDirect.text.includes('30 Triệu') || replyDirect.text.includes('30.000.000'));
  assert('Response contains CPU', replyDirect.text.includes('CPU') && replyDirect.text.includes('14600KF'));
  assert('Response contains Mainboard', replyDirect.text.includes('Mainboard') && replyDirect.text.includes('B760'));
  assert('Response contains VGA RTX 4070', replyDirect.text.includes('RTX 4070'));
  assert('Response DOES NOT misroute to Logitech brand overview', !replyDirect.text.includes('Tư vấn sản phẩm thương hiệu Logitech'));

  // -----------------------------------------------------------------
  // Test 4: Sequential Context & Turn-switch Verification
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 4: Sequential Conversation Integrity ---');
  const historyWithLogitech: ChatMessage[] = [
    { role: 'user', content: 'Chuột Logitech dưới 500k' },
    { role: 'model', content: 'Chào bạn! Dưới đây là các mẫu chuột Logitech...' }
  ];

  const turnMessage = 'build cấu hình với 30 triệu';
  const currentIntent = parseUserHardwareIntent(turnMessage);

  const isCurrentExplicitBuild = currentIntent.isPcBuild || currentIntent.category === 'pc_build';
  const hasCurrentExplicitCat = Boolean(currentIntent.category && currentIntent.category !== 'pc_build');
  const hasCurrentExplicitBrand = Boolean(currentIntent.brand);

  let inheritedCategory = currentIntent.category;
  let inheritedCategoryName = currentIntent.categoryName;
  let inheritedBrand = currentIntent.brand;
  let inheritedBrandSlug = currentIntent.brandSlug;
  let isPcBuild = isCurrentExplicitBuild;

  if ((!hasCurrentExplicitCat || !hasCurrentExplicitBrand || !isPcBuild) && Array.isArray(historyWithLogitech)) {
    for (let i = historyWithLogitech.length - 1; i >= 0; i--) {
      const pastIntent = parseUserHardwareIntent(historyWithLogitech[i].content);
      if (isCurrentExplicitBuild) break;
      if (hasCurrentExplicitCat) break;
      if (!inheritedCategory && pastIntent.category && pastIntent.category !== 'pc_build') inheritedCategory = pastIntent.category;
      if (!inheritedBrand && pastIntent.brand) inheritedBrand = pastIntent.brand;
      if (!isPcBuild && pastIntent.isPcBuild && !hasCurrentExplicitCat) isPcBuild = pastIntent.isPcBuild;
    }
  }

  const resolvedIntent = {
    ...currentIntent,
    category: isCurrentExplicitBuild ? 'pc_build' as const : (inheritedCategory || currentIntent.category),
    categoryName: isCurrentExplicitBuild ? 'PC Trọn Bộ' : (inheritedCategoryName || currentIntent.categoryName),
    brand: isCurrentExplicitBuild ? currentIntent.brand : (currentIntent.brand || inheritedBrand),
    brandSlug: isCurrentExplicitBuild ? currentIntent.brandSlug : (currentIntent.brandSlug || inheritedBrandSlug),
    isPcBuild: isCurrentExplicitBuild || isPcBuild,
  };

  assert('Sequential test: brand is NOT contaminated by Logitech', resolvedIntent.brand === undefined);
  assert('Sequential test: isPcBuild is TRUE', resolvedIntent.isPcBuild === true);

  const sequentialReply = await askGeminiPCHubAdvisor(turnMessage, historyWithLogitech, dummyCatalog, resolvedIntent);
  assert('Sequential reply produces 30M PC build instead of Logitech mice', 
    sequentialReply.text.includes('30 Triệu') && !sequentialReply.text.includes('Tư vấn sản phẩm thương hiệu Logitech'));

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Runner Failed:', err);
  process.exit(1);
});
