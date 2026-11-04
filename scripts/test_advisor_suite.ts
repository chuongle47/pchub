import { parseUserHardwareIntent } from '../src/lib/ai-query-parser';
import { matchPresetKeyFromText, AI_BUILD_PRESETS, reconcileBuildComponents } from '../src/lib/buildPresets';
import { extractBuildComponentsFromText } from '../src/components/layout/AIChatWidget';
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

  const p5 = parseUserHardwareIntent('build pc cao nhất hiện tại');
  assert('Query "build pc cao nhất hiện tại" is recognized as isPcBuild', p5.isPcBuild === true);
  assert('Query "build pc cao nhất hiện tại" is recognized as isPremium', p5.isPremium === true);
  assert('Query "build pc cao nhất hiện tại" targetPrice is high-end', (p5.targetPrice || 0) >= 40000000);

  // -----------------------------------------------------------------
  // Test 2: Build Presets budget matcher
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 2: Build Presets Budget Matcher ---');
  assert('matchPresetKeyFromText("build cấu hình với 30 triệu") === "30m"', matchPresetKeyFromText('build cấu hình với 30 triệu') === '30m');
  assert('matchPresetKeyFromText("build pc cao nhất hiện tại") === "50m"', matchPresetKeyFromText('build pc cao nhất hiện tại') === '50m');
  assert('matchPresetKeyFromText("pc mạnh nhất") === "50m"', matchPresetKeyFromText('pc mạnh nhất') === '50m');
  assert('matchPresetKeyFromText("cấu hình khủng nhất") === "50m"', matchPresetKeyFromText('cấu hình khủng nhất') === '50m');
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

  const replyMax = await askGeminiPCHubAdvisor('build pc cao nhất hiện tại', [], dummyCatalog);
  assert('Query "build pc cao nhất hiện tại" returns Flagship / 50+ Triệu build', replyMax.text.includes('Flagship') || replyMax.text.includes('Đỉnh Cao') || replyMax.text.includes('50+ Triệu') || replyMax.text.includes('83.730.000'));
  assert('Query "build pc cao nhất hiện tại" contains i9-14900K', replyMax.text.includes('14900K'));
  assert('Query "build pc cao nhất hiện tại" contains RTX 4080 SUPER', replyMax.text.includes('RTX 4080 SUPER'));
  assert('Query "build pc cao nhất hiện tại" DOES NOT return 25 Triệu i5-13400F', !replyMax.text.includes('24.730.000') && !replyMax.text.includes('i5-13400F'));

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

  // -----------------------------------------------------------------
  // Test 5: Multi-turn Component Swap & Platform Auto-Reconciliation
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 5: Multi-turn Component Swap & AM5 Reconciliation ---');
  // Turn 1: User asked for best PC -> Got Flagship 50M
  const historyTurn1: ChatMessage[] = [
    { role: 'user', content: 'build pc cấu hình tốt nhất' },
    { role: 'model', content: '📌 Cấu hình PC Flagship Đỉnh Cao Nhất Hiện Tại (Top-Tier Workstation & Gaming 4K/8K) (50.000.000đ+) — Đề xuất từ PCHub AI Advisor:\n1. CPU: Intel Core i9-14900K...' }
  ];

  // Turn 2: User says: "muốn chip amd"
  const turn2Message = 'muốn chip amd';
  
  // Test route-level intent detection for swap
  const lowerMsg2 = turn2Message.trim().toLowerCase();
  let hadPastBuild2 = false;
  let pastPresetKey2: string | undefined = undefined;

  for (let i = historyTurn1.length - 1; i >= 0; i--) {
    const turnText = historyTurn1[i].content;
    const pastIntent = parseUserHardwareIntent(turnText);
    if (pastIntent.isPcBuild || turnText.toLowerCase().includes('cấu hình') || turnText.toLowerCase().includes('bảng cấu hình')) {
      hadPastBuild2 = true;
      pastPresetKey2 = matchPresetKeyFromText(turnText);
      break;
    }
  }

  const isComponentSwap2 = hadPastBuild2 && (
    lowerMsg2.includes('muốn') || lowerMsg2.includes('đổi') || lowerMsg2.includes('thay') || lowerMsg2.includes('chuyển') ||
    lowerMsg2.includes('amd') || lowerMsg2.includes('ryzen') || lowerMsg2.includes('intel')
  );

  assert('Turn 2 "muốn chip amd" detected as active build customization', isComponentSwap2 === true);
  assert('Turn 2 past preset correctly recognized as "50m"', pastPresetKey2 === '50m');

  const resolvedPresetKey2 = matchPresetKeyFromText(turn2Message, pastPresetKey2);
  assert('Turn 2 mapped to "50m_amd" preset', resolvedPresetKey2 === '50m_amd');

  const resolvedIntent2 = {
    ...parseUserHardwareIntent(turn2Message),
    category: 'pc_build' as const,
    categoryName: 'PC Trọn Bộ',
    brand: undefined,
    brandSlug: undefined,
    isPcBuild: true,
  };

  const swapReply = await askGeminiPCHubAdvisor(turn2Message, historyTurn1, dummyCatalog, resolvedIntent2);
  assert('Turn 2 maintains PC Build intent (not single CPU list)', swapReply.text.includes('Bảng cấu hình linh kiện chi tiết'));
  assert('Turn 2 swaps CPU to AMD Ryzen 9 7950X3D', swapReply.text.includes('Ryzen 9 7950X3D'));
  assert('Turn 2 automatically reconciles Mainboard to Socket AM5 (X670E)', swapReply.text.includes('X670E') || swapReply.text.includes('AM5'));
  assert('Turn 2 keeps Flagship RTX 4080 SUPER and other top-tier parts', swapReply.text.includes('RTX 4080 SUPER'));
  assert('Turn 2 DOES NOT regress into Ryzen 3 4100 office CPU', !swapReply.text.includes('Ryzen 3 4100'));

  // Turn 3: User says "đổi lại chip intel"
  const turn3Message = 'đổi lại chip intel';
  const historyTurn2: ChatMessage[] = [
    ...historyTurn1,
    { role: 'user', content: turn2Message },
    { role: 'model', content: swapReply.text }
  ];
  const resolvedPresetKey3 = matchPresetKeyFromText(turn3Message, resolvedPresetKey2);
  assert('Turn 3 "đổi lại chip intel" switches back to "50m" Intel', resolvedPresetKey3 === '50m');

  // -----------------------------------------------------------------
  // Test 6: System-wide Task & Workload Adaptation (Render 3D, AI, White Theme)
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 6: System-wide Task & Workload Adaptation ---');
  
  // 1. Render 3D / Đồ họa
  const renderMsg = 'build pc 35 triệu làm đồ họa và render 3d';
  const renderIntent = parseUserHardwareIntent(renderMsg);
  assert('Query "làm đồ họa và render 3d" detects workload = "render_3d"', renderIntent.workload === 'render_3d');
  
  const renderReply = await askGeminiPCHubAdvisor(renderMsg, [], dummyCatalog, renderIntent);
  assert('Render 3D response contains workload evaluation for Blender / Premiere', renderReply.text.includes('Blender') || renderReply.text.includes('Premiere') || renderReply.text.includes('Render 3D'));
  assert('Render 3D response provides 32GB+ RAM', renderReply.text.includes('32GB') || renderReply.text.includes('64GB'));

  // 2. AI & Deep Learning
  const aiMsg = 'cấu hình 50 triệu chạy AI deep learning';
  const aiIntent = parseUserHardwareIntent(aiMsg);
  assert('Query "chạy AI deep learning" detects workload = "ai_dev"', aiIntent.workload === 'ai_dev');
  
  const aiReply = await askGeminiPCHubAdvisor(aiMsg, [], dummyCatalog, aiIntent);
  assert('AI Deep Learning response evaluates Tensor Cores / PyTorch / LLM', aiReply.text.includes('Tensor') || aiReply.text.includes('PyTorch') || aiReply.text.includes('AI') || aiReply.text.includes('LLM'));

  // 3. System-wide GPU swap + Auto-PSU scaling to 1000W
  const rtx4090Msg = 'muốn nâng card rtx 4090';
  const rtx4090Reply = await askGeminiPCHubAdvisor(rtx4090Msg, historyTurn1, dummyCatalog);
  assert('Upgrading GPU to RTX 4090 automatically scales PSU to 1000W Gold', rtx4090Reply.text.includes('RTX 4090') && rtx4090Reply.text.includes('1000W'));

  // 4. Aesthetic White Theme adaptation
  const whiteMsg = 'đổi sang case vỏ màu trắng';
  const whiteReply = await askGeminiPCHubAdvisor(whiteMsg, historyTurn1, dummyCatalog);
  assert('Switching to White theme adapts Case to White', whiteReply.text.includes('White') || whiteReply.text.includes('Trắng'));

  // -----------------------------------------------------------------
  // Test 7: Complete 8/8 Hardware Extraction & Builder Preset Application
  // -----------------------------------------------------------------
  console.log('\n--- Test Group 7: Complete 8/8 Hardware Extraction & Builder Application ---');
  
  // Verify 36MB cache does not wrongly match 35m
  const specText36MB = 'CPU Intel Core i9-14900K (LGA1700, 36MB Cache, 125W-253W)';
  const matchedKey36MB = matchPresetKeyFromText(specText36MB);
  assert('CPU specs with 36MB cache DOES NOT falsely match 35m preset', matchedKey36MB !== '35m');

  // Verify explicit million formatting
  assert('matchPresetKeyFromText("50.000.000đ") matches 50m', matchPresetKeyFromText('50.000.000đ') === '50m');
  assert('matchPresetKeyFromText("83.730.000đ") matches 50m', matchPresetKeyFromText('83.730.000đ') === '50m');

  // Verify Z790 board preserves DDR5 RAM
  const testComponentsZ790D5: Record<string, any> = {
    cpu: { key: 'cpu', name: 'Intel Core i9-14900K', specs: 'LGA1700 | 125W' },
    mainboard: { key: 'mainboard', name: 'ASUS ROG STRIX Z790-E GAMING WIFI II', specs: 'Bo Mạch Chủ' },
    ram: { key: 'ram', name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz', price: 6290000, specs: 'DDR5 6000MHz' }
  };
  const reconciledZ790 = reconcileBuildComponents(testComponentsZ790D5);
  assert('Z790 board strictly preserves DDR5 RAM (does not downgrade to DDR4)', reconciledZ790.ram.specs.includes('DDR5') && reconciledZ790.ram.price === 6290000);

  // Verify AI Advisory text contains all 8 components
  const flagshipReply = await askGeminiPCHubAdvisor('build pc cao nhất hiện tại', [], dummyCatalog);
  const required8Slots = ['CPU', 'Mainboard', 'VGA', 'RAM', 'Ổ cứng', 'Nguồn', 'Vỏ Case', 'Tản nhiệt'];
  const all8SlotsPresent = required8Slots.every((slot, idx) => {
    return flagshipReply.text.includes(`${idx + 1}.`) && flagshipReply.text.includes(slot);
  });
  assert('AI Advisor Flagship response contains all 8 core hardware component slots (1-8)', all8SlotsPresent);

  // Verify extractBuildComponentsFromText accurately parses all 8 items with exact prices
  const extractedComps = extractBuildComponentsFromText(flagshipReply.text);
  assert('extractBuildComponentsFromText extracts CPU with exact name and price', extractedComps.cpu?.name.includes('i9-14900K') && extractedComps.cpu?.price === 13990000);
  assert('extractBuildComponentsFromText extracts Mainboard with exact name and price', extractedComps.mainboard?.name.includes('Z790-E') && extractedComps.mainboard?.price === 11490000);
  assert('extractBuildComponentsFromText extracts GPU with exact name and price', extractedComps.gpu?.name.includes('RTX 4080 SUPER') && extractedComps.gpu?.price === 31490000);
  assert('extractBuildComponentsFromText extracts RAM with exact name and price', extractedComps.ram?.name.includes('64GB') && extractedComps.ram?.price === 6290000);
  assert('extractBuildComponentsFromText extracts Storage with exact name and price', extractedComps.storage?.name.includes('990 Pro') && extractedComps.storage?.price === 4890000);
  assert('extractBuildComponentsFromText extracts PSU with exact name and price', extractedComps.psu?.name.includes('1000W') && extractedComps.psu?.price === 4390000);
  assert('extractBuildComponentsFromText extracts Case with exact name and price', extractedComps.case?.name.includes('H9 Flow') && extractedComps.case?.price === 4290000);
  assert('extractBuildComponentsFromText extracts Cooling with exact name and price', extractedComps.cooling?.name.includes('Kraken Elite 360') && extractedComps.cooling?.price === 6890000);

  const totalExtractedPrice = Object.values(extractedComps).reduce((acc: number, c: any) => acc + (c.price || 0), 0);
  assert('Total extracted price from AI Advisory text equals 83.720.000₫ exactly', totalExtractedPrice === 83720000);

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
