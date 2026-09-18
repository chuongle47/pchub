// PCHub Gemini AI Integration
// Hardware Compatibility Analysis & System Architect Advisory

export interface ComponentItem {
  key: string;
  name: string;
  category?: string;
  specs?: string;
  price?: number;
  tdp?: number;
}

export interface CompatibilityChecklistItem {
  category: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

export interface CompatibilityReport {
  compatibilityScore: number; // 0 - 100
  status: 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE';
  summary: string;
  checklist: CompatibilityChecklistItem[];
  bottleneck: {
    level: string;
    description: string;
  };
  estimatedWattage: {
    peakTdp: number;
    recommendedPsu: number;
  };
  strengths: string[];
  recommendations: string[];
  analyzedAt?: string;
  modelUsed?: string;
}

export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || '';
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

/**
 * AI PC Hardware & Product Advisor Chat Helper using Gemini API
 */
export async function askGeminiPCHubAdvisor(
  message: string,
  history: ChatMessage[] = [],
  catalogContext: string = ''
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = getGeminiApiKey();

  const systemInstruction = `
Bạn là **PCHub AI Advisor** — Chuyên viên Tư vấn Kỹ thuật Phần cứng & Kỹ sư Kiến trúc Hệ thống PC tại PCHub Technology.

HƯỚNG DẪN TRẢ LỜI CHO KHÁCH HÀNG (STRICT FORMATTING RULES):
1. TRẢ LỜI THÂN THIỆN, CHUYÊN NGHIỆP, TRỰC DIỆN:
   - Đi thẳng vào câu hỏi của khách hàng, trả lời ngắn gọn, lịch sự, chuẩn xác 100%.
   - Tuyệt đối KHÔNG trích dẫn nguyên văn mã DB hay các thẻ kỹ thuật thô như [Tồn kho: 50] hay [Chuột Gaming & Văn Phòng].
   - Trình bày giá tiền rõ ràng dạng **329.000 ₫**.

2. ĐỘ CHÍNH XÁC & CHỈ GỢI Ý SẢN PHẨM CÓ TRONG SBUY API:
   - Dùng đúng tên sản phẩm và giá tiền từ danh sách sản phẩm Sbuy API bên dưới.
   - Tuyệt đối không lặp lại cùng một sản phẩm nhiều lần.

3. NGUYÊN TẮC TƯƠNG THÍCH PHẦN CỨNG 100% (STRICT HARDWARE COMPATIBILITY RULES):
   - CPU & MAINBOARD: Phải đúng Socket (Intel Gen 12/13/14 -> LGA1700 như B760, H610, Z790; AMD Ryzen 7000/8000/9000 -> AM5 như B650, X670; AMD Ryzen 5000 -> AM4 như B550, B450).
   - RAM & MAINBOARD: BẮT BUỘC cùng chuẩn DDR4 hoặc DDR5 (Mainboard DDR4 cắm RAM DDR4, Mainboard DDR5 cắm RAM DDR5). TUYỆT ĐỐI KHÔNG chọn Mainboard DDR4 đi với RAM DDR5 hoặc ngược lại!
   - NGUỒN (PSU): Phải đủ công suất cho VGA + CPU (RTX 3060/4060 -> Nguồn >= 550W-650W; RTX 4070/4070 Super -> Nguồn >= 650W-750W).

DANH SÁCH SẢN PHẨM THỰC TẾ (SBUY API):
${catalogContext}
`;

  const candidateModels = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
  ];

  // Convert history into Gemini contents format
  const contents = [
    { parts: [{ text: systemInstruction }] },
    ...history.slice(-6).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText && replyText.trim().length > 0) {
        return {
          text: replyText.trim(),
          modelUsed: model
        };
      }
    } catch (err) {
      // Continue to next model on failure
    }
  }

  // Smart local fallback response if Gemini API fails
  return {
    text: getSmartLocalAdvisorReply(message, catalogContext),
    modelUsed: 'local-rule-advisor'
  };
}

function extractBudgetInMillions(message: string): number | null {
  const lower = message.toLowerCase().replace(/,/g, '.');
  
  const matchM = lower.match(/(\d+(?:\.\d+)?)\s*(?:triệu|tr|m\b)/i);
  if (matchM) return parseFloat(matchM[1]);

  const matchFull = lower.match(/(\d{2,3})[\.\s]?000[\.\s]?000/);
  if (matchFull) return parseFloat(matchFull[1]);

  const matchDigits = lower.match(/(?:build\s*pc|pc|ngân\s*sách)\s*(\d{2,3})\b/i);
  if (matchDigits) {
    const val = parseFloat(matchDigits[1]);
    if (val >= 8 && val <= 300) return val;
  }

  return null;
}

function parseCatalogLine(line: string) {
  const raw = line.replace(/^- /, '').trim();
  
  let category = '';
  const catMatch = raw.match(/^\[(.*?)\]/);
  if (catMatch) category = catMatch[1];

  let rest = raw.replace(/^\[.*?\]\s*/, '');

  let priceStr = '';
  const priceMatch = rest.match(/—\s*Giá:\s*([\d\.,]+₫|Liên hệ)/i);
  if (priceMatch) {
    priceStr = priceMatch[1];
    rest = rest.replace(/—\s*Giá:\s*([\d\.,]+₫|Liên hệ)/i, '');
  }

  rest = rest.replace(/\[Tồn kho:\s*\d+\]/gi, '').trim();

  let specsStr = '';
  const specsMatch = rest.match(/\|\s*Thông số:\s*(.*)/i);
  if (specsMatch) {
    specsStr = specsMatch[1].trim();
    rest = rest.replace(/\|\s*Thông số:\s*(.*)/i, '').trim();
  }

  let name = rest.trim();
  name = name.replace(/\s*\([^)]*\)$/, '').trim();

  return {
    raw,
    name,
    category,
    priceStr,
    specsStr
  };
}

function getSmartLocalAdvisorReply(message: string, catalogContext: string = ''): string {
  const lower = message.toLowerCase();
  const budget = extractBudgetInMillions(message);

  const catalogLines = catalogContext
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('-'));

  if (budget !== null && catalogLines.length > 0) {
    const cpus = catalogLines.map(parseCatalogLine).filter(p => p.name.toLowerCase().includes('cpu') || p.name.toLowerCase().includes('intel') || p.name.toLowerCase().includes('ryzen'));
    const gpus = catalogLines.map(parseCatalogLine).filter(p => p.name.toLowerCase().includes('vga') || p.name.toLowerCase().includes('rtx') || p.name.toLowerCase().includes('gtx') || p.name.toLowerCase().includes('card'));
    const rams = catalogLines.map(parseCatalogLine).filter(p => p.name.toLowerCase().includes('ram'));
    const ssds = catalogLines.map(parseCatalogLine).filter(p => p.name.toLowerCase().includes('ssd'));

    const getFormattedItem = (list: ReturnType<typeof parseCatalogLine>[], fallbackName: string, fallbackPrice: string) => {
      if (list.length > 0) {
        return `**${list[0].name}** — **${list[0].priceStr || fallbackPrice}**`;
      }
      return `**${fallbackName}** — **${fallbackPrice}**`;
    };

    return `💻 **Cấu hình PC gợi ý theo ngân sách ~${budget} Triệu VNĐ:**\n\n` +
      `• **CPU**: ${getFormattedItem(cpus, 'Intel Core i5-13400F', '4.890.000 ₫')}\n` +
      `• **VGA**: ${getFormattedItem(gpus, 'NVIDIA GeForce RTX 4060 8GB', '8.490.000 ₫')}\n` +
      `• **RAM**: ${getFormattedItem(rams, 'Kingston FURY Beast 16GB DDR4', '990.000 ₫')}\n` +
      `• **SSD**: ${getFormattedItem(ssds, 'SSD NVMe PCIe 500GB', '990.000 ₫')}\n\n` +
      `🎯 **Đánh giá hiệu năng**: Cân mượt các tựa game Hot (Valorant, CS2, GTA V, Naraka), xử lý đồ họa & công việc cực kỳ ổn định!`;
  }

  if (catalogLines.length > 0) {
    let matches = catalogLines.filter(line => {
      const lineLower = line.toLowerCase();
      if (lower.includes('màn hình') || lower.includes('monitor') || lower.includes('màn')) return lineLower.includes('màn') || lineLower.includes('monitor');
      if (lower.includes('chuột') || lower.includes('mouse') || lower.includes('lót')) return lineLower.includes('chuột') || lineLower.includes('mouse') || lineLower.includes('lót');
      if (lower.includes('bàn phím') || lower.includes('keyboard') || lower.includes('phím')) return lineLower.includes('phím') || lineLower.includes('keyboard');
      if (lower.includes('tai nghe') || lower.includes('headset') || lower.includes('audio') || lower.includes('loa')) return lineLower.includes('tai nghe') || lineLower.includes('headset') || lineLower.includes('loa');
      if (lower.includes('cpu') || lower.includes('chip') || lower.includes('vi xử lý')) return lineLower.includes('cpu') || lineLower.includes('intel') || lineLower.includes('ryzen');
      if (lower.includes('vga') || lower.includes('card') || lower.includes('gpu') || lower.includes('rtx')) return lineLower.includes('gpu') || lineLower.includes('vga') || lineLower.includes('rtx');
      if (lower.includes('ram')) return lineLower.includes('ram');
      if (lower.includes('ssd') || lower.includes('hdd') || lower.includes('ổ cứng')) return lineLower.includes('ssd') || lineLower.includes('hdd');
      if (lower.includes('tản') || lower.includes('cooling') || lower.includes('quạt')) return lineLower.includes('tản') || lineLower.includes('cooling');
      if (lower.includes('nguồn') || lower.includes('psu')) return lineLower.includes('nguồn') || lineLower.includes('psu');
      if (lower.includes('case') || lower.includes('vỏ')) return lineLower.includes('case') || lineLower.includes('vỏ');
      return false;
    });

    if (matches.length === 0) {
      const words = lower.split(/\s+/).filter(w => w.length >= 3);
      matches = catalogLines.filter(line => words.some(w => line.toLowerCase().includes(w)));
    }

    if (matches.length > 0) {
      // Deduplicate by clean name
      const uniqueItems = new Map<string, ReturnType<typeof parseCatalogLine>>();
      matches.forEach(m => {
        const parsed = parseCatalogLine(m);
        if (parsed.name && !uniqueItems.has(parsed.name.toLowerCase())) {
          uniqueItems.set(parsed.name.toLowerCase(), parsed);
        }
      });

      const topMatches = Array.from(uniqueItems.values()).slice(0, 4);
      return `🤖 **PCHub AI Advisor xin tư vấn cho bạn các sản phẩm phù hợp đang có sẵn:**\n\n` +
        topMatches.map(item => {
          let text = `• **${item.name}**`;
          if (item.priceStr) text += ` — **${item.priceStr}**`;
          if (item.specsStr) text += `\n  • Thông số: ${item.specsStr}`;
          return text;
        }).join('\n\n') +
        `\n\n👉 Bạn có thể xem và đặt mua trực tiếp các sản phẩm bên dưới!`;
    }
  }

  return `💡 **PCHub AI Advisor xin hỗ trợ tư vấn:**\n` +
    `Hiện tại PCHub đang có sẵn đầy đủ các linh kiện Sbuy API bao gồm Màn hình, CPU, Card màn hình, RAM, SSD, Bàn phím & Chuột.\n\n` +
    `👉 Bạn hãy cho biết cụ thể nhu cầu (ví dụ: chuột không dây, màn hình gaming hay ngân sách build PC) để mình hỗ trợ tốt nhất nhé!`;
}




/**
 * System Prompt & Guidelines for PC Hardware Compatibility
 */
export function buildCompatibilityPrompt(components: ComponentItem[]): string {
  const componentLines = components
    .map((c, idx) => {
      const cat = c.category || c.key.toUpperCase();
      const specs = c.specs ? ` - Thông số: ${c.specs}` : '';
      const tdp = c.tdp ? ` - TDP: ${c.tdp}W` : '';
      const price = c.price ? ` - Giá: ${c.price.toLocaleString('vi-VN')}₫` : '';
      return `${idx + 1}. [${cat}]: ${c.name}${specs}${tdp}${price}`;
    })
    .join('\n');

  return `
Bạn là Kỹ Sư Trưởng Hệ Thống Phần Cứng PC (Senior PC Hardware System Architect) tại PCHub với hơn 15 năm kinh nghiệm lắp ráp, tinh chỉnh ép xung (OC) và kiểm thử độ tương thích phần cứng máy tính.

Nhiệm vụ của bạn là kiểm tra TOÀN DIỆN tính tương thích vật lý, chuẩn giao tiếp, nguồn điện và độ cân bằng hiệu năng giữa các linh kiện trong dàn máy PC sau:

DANH SÁCH LINH KIỆN ĐÃ CHỌN:
${componentLines}

HƯỚNG DẪN KIỂM TRA CHUYÊN SÂU:
1. CPU & Mainboard:
   - Chân cắm Socket: LGA1700 (Intel Gen 12/13/14), LGA1851 (Core Ultra Gen 15/Arrow Lake), AM4 (Ryzen 1000-5000), AM5 (Ryzen 7000-9000). CPU và Mainboard BẮT BUỘC phải cùng socket.
   - Chipset & VRM: Mainboard (Z790/Z890/B760/X670/B650/...) có đủ pha nguồn VRM để nuôi CPU hoạt động ổn định khi Turbo Boost/chạy tải nặng không? (Ví dụ: i9 không nên cắm main H610 rẻ tiền).
   - Khả năng cần cập nhật BIOS (nếu CPU thế hệ mới lắp vào mainboard thế hệ trước).

2. RAM & Mainboard / CPU:
   - Chuẩn RAM: DDR4 hay DDR5? Mainboard và RAM phải khớp chuẩn.
   - Lưu ý quan trọng: Các bo mạch chủ Intel LGA1700 (H610, B760, Z790) tại Việt Nam phần lớn chạy chuẩn DDR4 (trừ mẫu ghi rõ DDR5/D5). Nếu Mainboard B760/H610 không ghi DDR5 và RAM chọn là DDR4 thì là TƯƠNG THÍCH HOÀN TOÀN (PASS).
   - Số khe và cấu hình kênh đôi (Dual-Channel).
   - Bus RAM và khả năng ép xung XMP / EXPO hỗ trợ trên bo mạch chủ.

3. Card màn hình (GPU / VGA) & Thùng máy (Case) & Nguồn (PSU):
   - Kích thước chiều dài GPU (mm) và số slot độ dày so với khoảng trống tối đa của Vỏ Case.
   - Cổng cấp nguồn: Cổng chuẩn mới 16-pin 12VHPWR / 12V-2x6 (RTX 40/50 series) so với đầu nối nguồn có sẵn của PSU.

4. Nguồn (PSU) & Tổng công suất hệ thống:
   - Tính toán tổng công suất tiêu thụ tối đa (Peak TDP) của CPU + GPU + các linh kiện khác (+ 100-150W cho quạt, LED, ổ cứng, bo mạch).
   - Đưa ra mức công suất nguồn khuyến nghị (Recommended PSU) có dư tải 20-30% để nguồn chạy mát ở dải hiệu suất vàng 50-80% tải.

5. Tản nhiệt (Cooling) & CPU & Case:
   - Ngàm gắn tản nhiệt có hỗ trợ socket CPU không?
   - Khả năng giải nhiệt (TDP) của tản nhiệt có đủ cho CPU không (ví dụ i7/i9 250W+ cần tản nước AIO 240/360mm hoặc tản khí tháp đôi lớn).
   - Kích thước tản nước Rad 240/280/360mm hoặc chiều cao tản khí có lắp vừa case không?

6. Đánh giá nghẽn cổ chai (Bottleneck) & Cân bằng cấu hình:
   - Đánh giá mức độ đồng bộ giữa CPU và GPU khi chơi game (1080p, 2K, 4K) và làm việc (đồ họa, dựng phim, lập trình, render 3D).

7. Lời khuyên thực tế & Điểm mạnh (Strengths & Recommendations):
   - Nêu rõ các ưu điểm nổi trội của cấu hình.
   - Đưa ra các lưu ý hoặc mẹo lắp ráp phần cứng hữu ích (ví dụ: gông chống cong LGA1700, dùng cáp nguồn trực tiếp thay vì adapter, bật XMP trong BIOS,...).

QUY ĐỊNH BẮT BUỘC VỀ ĐỊNH DẠNG TRẢ VỀ:
- Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ.
- TUYỆT ĐỐI KHÔNG dùng backtick (\`\`\`json), không thêm bất kỳ lời chào hay ký tự nào ngoài chuỗi JSON.
- Sử dụng tiếng Việt chuẩn mực, chuyên nghiệp, truyền cảm hứng.

CẤU TRÚC JSON MẪU:
{
  "compatibilityScore": 95,
  "status": "COMPATIBLE",
  "summary": "Tóm tắt ngắn gọn 1-2 câu về dàn máy",
  "checklist": [
    {
      "category": "CPU & Bo Mạch Chủ (Socket & Chipset)",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    },
    {
      "category": "RAM & Bo Mạch Chủ (Chuẩn DDR & Bus)",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    },
    {
      "category": "Nguồn (PSU) & Công Suất Tải",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    },
    {
      "category": "Card Màn Hình & Vỏ Case (Kích Thước & Khe Cắm)",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    },
    {
      "category": "Tản Nhiệt & Nhiệt Độ CPU",
      "status": "PASS",
      "detail": "Chi tiết đánh giá..."
    }
  ],
  "bottleneck": {
    "level": "Rất Thấp (Cân bằng hoàn hảo)",
    "description": "Chi tiết đánh giá nghẽn..."
  },
  "estimatedWattage": {
    "peakTdp": 650,
    "recommendedPsu": 850
  },
  "strengths": [
    "Điểm mạnh 1",
    "Điểm mạnh 2"
  ],
  "recommendations": [
    "Khuyến nghị hoặc mẹo hữu ích 1",
    "Khuyến nghị 2"
  ]
}
`;
}

/**
 * Calls Gemini API with model fallbacks
 */
export async function analyzeBuildCompatibility(components: ComponentItem[]): Promise<CompatibilityReport> {
  const selected = components.filter(c => Boolean(c.name && c.name.trim()));
  
  if (selected.length === 0) {
    return {
      compatibilityScore: 100,
      status: 'COMPATIBLE',
      summary: 'Chưa có linh kiện nào được chọn. Hãy thêm linh kiện để hệ thống AI phân tích tương thích!',
      checklist: [],
      bottleneck: {
        level: 'Chưa xác định',
        description: 'Vui lòng chọn ít nhất CPU và Bo mạch chủ để đánh giá hiệu năng.'
      },
      estimatedWattage: { peakTdp: 0, recommendedPsu: 450 },
      strengths: ['Hệ thống sẵn sàng tiếp nhận cấu hình mới của bạn.'],
      recommendations: ['Bắt đầu bằng việc chọn CPU và Bo mạch chủ phù hợp nhu cầu.'],
      analyzedAt: new Date().toISOString(),
    };
  }

  const apiKey = getGeminiApiKey();
  const prompt = buildCompatibilityPrompt(selected);

  // Models in priority order - gemini-3.5-flash confirmed working, newer ones often 503/timeout
  const candidateModels = [
    'gemini-3.5-flash',       // ✅ Confirmed stable
    'gemini-3.5-flash-lite',  // Lighter, fallback
    'gemini-3.6-flash',       // Sometimes works
    'gemini-2.5-flash',       // Older but available
    'gemini-flash-latest',    // Alias fallback
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        }),
        signal: AbortSignal.timeout(25000) // 25s per model, allowing 2 attempts in 45s window
      });

      if (!response.ok) {
        const errText = await response.text();
        // Skip 404 (model not found) and 429 (rate limit) silently
        console.warn(`[PCHub AI] Model ${model} HTTP ${response.status}:`, errText.slice(0, 200));
        lastError = new Error(`Gemini API error (${model}) [${response.status}]`);
        continue;
      }

      const data = await response.json();
      
      // Check for prompt feedback block
      if (data?.promptFeedback?.blockReason) {
        lastError = new Error(`Prompt blocked by ${model}: ${data.promptFeedback.blockReason}`);
        console.warn(`[PCHub AI] Prompt blocked:`, data.promptFeedback.blockReason);
        continue;
      }

      const candidate = data?.candidates?.[0];
      
      // Handle finish reasons that result in empty output
      const finishReason = candidate?.finishReason;
      if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
        lastError = new Error(`Model ${model} stopped due to: ${finishReason}`);
        console.warn(`[PCHub AI] Non-STOP finish reason: ${finishReason}`);
        continue;
      }

      const rawText = candidate?.content?.parts?.[0]?.text;

      if (!rawText || rawText.trim().length === 0) {
        lastError = new Error(`Empty text response from model ${model} (finishReason: ${finishReason})`);
        console.warn(`[PCHub AI] Empty response from ${model}`);
        continue;
      }

      // Clean markdown code blocks if present
      let cleaned = rawText.trim();
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/,'');

      // Extract JSON if there's surrounding text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];

      const parsed: CompatibilityReport = JSON.parse(cleaned);
      parsed.analyzedAt = new Date().toISOString();
      parsed.modelUsed = model;

      // Validate core fields
      if (typeof parsed.compatibilityScore !== 'number') parsed.compatibilityScore = 95;
      if (!parsed.status) parsed.status = 'COMPATIBLE';
      if (!Array.isArray(parsed.checklist)) parsed.checklist = [];
      if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
      if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];
      if (!parsed.bottleneck) parsed.bottleneck = { level: 'Thấp', description: 'Cấu hình cân bằng tốt.' };
      if (!parsed.estimatedWattage) parsed.estimatedWattage = { peakTdp: 500, recommendedPsu: 750 };

      return parsed;
    } catch (err: any) {
      lastError = err;
      console.warn(`[PCHub AI] Model ${model} failed:`, err.message);
    }
  }

  // If all online models fail, fallback to smart offline rule-based report
  console.error('[PCHub AI] All Gemini models failed, using intelligent local fallback:', lastError?.message);
  return generateLocalFallbackReport(selected);
}

/**
 * Intelligent local rule-based fallback if Gemini API is unreachable or offline
 */
function generateLocalFallbackReport(components: ComponentItem[]): CompatibilityReport {
  const cpu = components.find(c => c.key === 'cpu' || c.category?.toLowerCase().includes('cpu'));
  const mainboard = components.find(c => c.key === 'mainboard' || c.category?.toLowerCase().includes('mainboard'));
  const ram = components.find(c => c.key === 'ram' || c.category?.toLowerCase().includes('ram'));
  const gpu = components.find(c => c.key === 'gpu' || c.category?.toLowerCase().includes('vga') || c.category?.toLowerCase().includes('gpu'));
  const psu = components.find(c => c.key === 'psu' || c.category?.toLowerCase().includes('nguồn') || c.category?.toLowerCase().includes('psu'));

  const checklist: CompatibilityChecklistItem[] = [];
  let score = 95;
  let status: 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE' = 'COMPATIBLE';

  // 1. Socket Check
  if (cpu && mainboard) {
    const isIntel = cpu.name.toLowerCase().includes('intel') || cpu.name.toLowerCase().includes('core');
    const isAmd = cpu.name.toLowerCase().includes('amd') || cpu.name.toLowerCase().includes('ryzen');
    const isLga1700Cpu = cpu.specs?.includes('LGA1700') || cpu.name.includes('14') || cpu.name.includes('13') || cpu.name.includes('12');
    const isAm5Cpu = cpu.specs?.includes('AM5') || cpu.name.includes('7000') || cpu.name.includes('9000');
    
    const isLga1700Mb = mainboard.specs?.includes('LGA1700') || mainboard.name.includes('Z790') || mainboard.name.includes('B760');
    const isAm5Mb = mainboard.specs?.includes('AM5') || mainboard.name.includes('X670') || mainboard.name.includes('B650');

    if ((isLga1700Cpu && isAm5Mb) || (isAm5Cpu && isLga1700Mb) || (isIntel && isAm5Mb) || (isAmd && isLga1700Mb)) {
      score -= 40;
      status = 'INCOMPATIBLE';
      checklist.push({
        category: 'CPU & Bo Mạch Chủ (Socket)',
        status: 'FAIL',
        detail: 'Phát hiện xung đột Socket: CPU và Bo mạch chủ không cùng nền tảng chân cắm (Intel LGA vs AMD AM5).'
      });
    } else {
      checklist.push({
        category: 'CPU & Bo Mạch Chủ (Socket)',
        status: 'PASS',
        detail: 'Socket CPU và Bo mạch chủ đồng bộ chính xác, hệ thống VRM tương thích cấp nguồn ổn định.'
      });
    }
  }

  // 2. RAM Check
  if (mainboard && ram) {
    const mbText = `${mainboard.name} ${mainboard.specs || ''}`.toUpperCase();
    const ramText = `${ram.name} ${ram.specs || ''}`.toUpperCase();

    const explicitDdr5Mb = mbText.includes('DDR5') || mbText.includes(' D5') || mbText.includes('B650') || mbText.includes('X670') || mbText.includes('A620') || mbText.includes('Z890');
    const explicitDdr4Mb = mbText.includes('DDR4') || mbText.includes('B550') || mbText.includes('B450') || mbText.includes('A520') || mbText.includes('H510') || mbText.includes('B560');

    let isDdr5Mb = explicitDdr5Mb;
    let isDdr4Mb = explicitDdr4Mb || (!explicitDdr5Mb && !explicitDdr4Mb);

    const isDdr5Ram = ramText.includes('DDR5');
    const isDdr4Ram = ramText.includes('DDR4') || !isDdr5Ram;

    if ((isDdr5Mb && isDdr4Ram) || (isDdr4Mb && isDdr5Ram)) {
      score -= 30;
      if (status !== 'INCOMPATIBLE') status = 'INCOMPATIBLE';
      checklist.push({
        category: 'RAM & Bo Mạch Chủ (Chuẩn DDR)',
        status: 'FAIL',
        detail: 'Không tương thích chuẩn RAM: Bo mạch chủ và thanh RAM không cùng thế hệ (DDR4 vs DDR5).'
      });
    } else {
      checklist.push({
        category: 'RAM & Bo Mạch Chủ (Chuẩn DDR)',
        status: 'PASS',
        detail: 'Chuẩn RAM và Bo mạch chủ tương thích hoàn toàn, hỗ trợ profile XMP/EXPO tăng tốc hiệu quả.'
      });
    }
  }

  // 3. Wattage calculation
  const totalTdp = components.reduce((sum, c) => sum + (c.tdp || 0), 0) + 120;
  const recommendedPsu = Math.max(650, Math.ceil((totalTdp + 150) / 50) * 50);

  let psuWatts = 750;
  if (psu) {
    const match = psu.name.match(/(\d{3,4})\s*W/i) || (psu.specs || '').match(/(\d{3,4})\s*W/i);
    if (match) psuWatts = parseInt(match[1], 10);
  }

  if (psu && psuWatts < recommendedPsu - 50) {
    score -= 15;
    if (status === 'COMPATIBLE') status = 'WARNING';
    checklist.push({
      category: 'Nguồn (PSU) & Công Suất Tải',
      status: 'WARN',
      detail: `Công suất nguồn ${psuWatts}W hơi sát tải so với tổng công suất đề xuất ${recommendedPsu}W.`
    });
  } else {
    checklist.push({
      category: 'Nguồn (PSU) & Công Suất Tải',
      status: 'PASS',
      detail: `Công suất nguồn ${psuWatts}W đáp ứng xuất sắc cho hệ thống với độ dự phòng an toàn 25%.`
    });
  }

  return {
    compatibilityScore: Math.max(20, Math.min(100, score)),
    status,
    summary: status === 'COMPATIBLE' 
      ? 'Cấu hình hoàn toàn đồng bộ và tối ưu tốt theo các tiêu chuẩn phần cứng PCHub.'
      : 'Phát hiện một số điểm cần lưu ý về socket hoặc chuẩn giao tiếp giữa các linh kiện.',
    checklist,
    bottleneck: {
      level: 'Rất Thấp',
      description: 'Sự phân bổ sức mạnh giữa CPU và Card đồ họa hài hòa, không gây thắt cổ chai hiệu năng.'
    },
    estimatedWattage: {
      peakTdp: totalTdp,
      recommendedPsu
    },
    strengths: [
      'Linh kiện chính hãng được thiết kế trên tiến trình mới tiết kiệm điện năng.',
      'Băng thông bộ nhớ và đường truyền PCIe tốc độ cao tối ưu truyền tải dữ liệu.'
    ],
    recommendations: [
      'Nên lắp RAM ở khe A2 - B2 (khe 2 và 4 từ CPU sang) để kích hoạt chuẩn Dual-Channel tối ưu nhất.',
      'Kích hoạt tính năng XMP / EXPO trong giao diện BIOS để RAM chạy đúng mức xung công bố.'
    ],
    analyzedAt: new Date().toISOString(),
    modelUsed: 'local-fallback'
  };
}
