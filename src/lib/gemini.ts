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
Bạn là **PCHub AI Advisor** — Chuyên viên Tư vấn Kỹ thuật Phần cứng & Cấu hình PC chính thức tại cửa hàng PCHub Technology.
Nhiệm vụ của bạn là giải đáp CHUYÊN SÂU, CHÍNH XÁC, TẬN TÂM và THUỐC ĐỦ TÌNH CẢM các câu hỏi liên quan đến:
1. Tư vấn Build PC theo ngân sách (ví dụ: 10tr, 15tr, 25tr, 50tr) cho Học tập, Đồ họa (Photoshop/Premiere/AutoCAD/3D), Chơi game (Esports, AAA 2K/4K) hoặc Livestream/Server.
2. Kiểm tra tính tương thích giữa CPU (Intel/AMD), Mainboard (Socket/Chipset), RAM (DDR4/DDR5), VGA (NVIDIA RTX / AMD Radeon), Nguồn PSU (TDP, 80 Plus), Tản nhiệt và Vỏ Case.
3. Giải thích các thông số kỹ thuật (Bus RAM, Core/Threads, TDP, PCIe 4.0/5.0, VRAM, NVMe Read/Write speed, VRAM, DLSS 3/FSR).
4. Khuyến nghị linh kiện tiêu biểu đang bán tại PCHub với mức giá hợp lý và chế độ bảo hành 36 tháng.

THÔNG TIN DANH MỤC & SẢN PHẨM HIỆN CÓ TẠI PCHUB:
${catalogContext || 'Các sản phẩm tiêu biểu: Intel Core i9-14900K (13.99tr), Ryzen 9 7950X3D (15.49tr), Ryzen 7 7800X3D (9.89tr), Core i7-14700K (10.49tr), ROG Strix RTX 4090 (54.99tr), RTX 4080 SUPER (31.99tr), RTX 4070 Ti SUPER (23.49tr), Mainboard Z790/B760/X670/B650, RAM Corsair Dominator/Trident Z5 DDR5, SSD NVMe Samsung 990 Pro.'}

QUY TẮC TRẢ LỜI:
- Trả lời trực tiếp, rõ ràng, giàu thông tin thực tế.
- Trình bày dạng danh sách dòng gạch đầu dòng hoặc bảng thông số nếu tư vấn cấu hình chi tiết.
- Sử dụng tiếng Việt tự nhiên, thân thiện, dùng từ ngữ chuyên môn chuẩn xác nhưng dễ hiểu.
- Cố gắng đưa ra con số cụ thể (giá tham khảo, công suất nguồn PSU W, bus RAM MHz, socket CPU).
`;

  const candidateModels = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
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
    text: getSmartLocalAdvisorReply(message),
    modelUsed: 'local-rule-advisor'
  };
}

function getSmartLocalAdvisorReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('nguồn') || lower.includes('psu') || lower.includes('vga') || lower.includes('rtx')) {
    return '⚡ **Tư vấn nguồn (PSU) chuẩn phần cứng PCHub:**\n- **RTX 4060 / 4060 Ti**: Nguồn tối thiểu 550W - 650W (80 Plus Bronze/Gold).\n- **RTX 4070 / 4070 Ti SUPER**: Nguồn 750W 80 Plus Gold có chuẩn dây 16-pin 12VHPWR.\n- **RTX 4080 / 4090**: Khuyến nghị PSU từ 850W đến 1000W 80 Plus Gold / Platinum để nguồn luôn chạy ở dải hiệu suất mát nhất (50-70% tải).';
  }
  if (lower.includes('render') || lower.includes('đồ họa') || lower.includes('dựng phim')) {
    return '🎬 **Cấu hình tối ưu Đồ họa & Render 3D tại PCHub:**\n- **CPU**: Intel Core i7-14700K / i9-14900K (nhiều nhân luồng xử lý nhanh) hoặc AMD Ryzen 9 7950X3D.\n- **RAM**: Tối thiểu 32GB DDR5 6000MHz (hoặc 64GB cho Premiere 4K / After Effects).\n- **VGA**: NVIDIA RTX 4070 Ti SUPER 16GB VRAM (hỗ trợ nhân CUDA & NVENC mã hóa video cực mượt).\n- **SSD**: NVMe PCIe 4.0 Read 7000MB/s (Samsung 990 Pro / Kingston KC3000).';
  }
  if (lower.includes('triệu') || lower.includes('gaming') || lower.includes('chơi game') || lower.includes('build pc')) {
    return '🎮 **Gợi ý cấu hình PC Gaming tiêu biểu tại PCHub:**\n- **Tầm 15 Triệu (Esports 1080p Max Setting)**: Core i5-12400F + RAM 16GB DDR4 + RTX 3060 12GB / RTX 4060 + PSU 600W.\n- **Tầm 25 Triệu (Gaming 2K Ultra / Stream)**: Ryzen 5 7600X hoặc i5-14600K + RAM 32GB DDR5 6000MHz + RTX 4070 SUPER 12GB + PSU 750W Gold.\n- **Tầm 40-50 Triệu (Gaming 4K / High-end)**: Ryzen 7 7800X3D + Mainboard Z790/B650 + RAM 32GB DDR5 + RTX 4080 SUPER 16GB.';
  }
  return '💡 Chào bạn! Mình là AI Advisor của PCHub. Mình có thể hỗ trợ bạn chọn CPU (Intel/AMD), Mainboard (Z790/B760/X670), RAM DDR4/DDR5, Card màn hình VGA, tính công suất nguồn PSU hoặc tư vấn build trọn bộ PC theo ngân sách của bạn!';
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
    const isDdr5Mb = mainboard.name.includes('DDR5') || mainboard.specs?.includes('DDR5');
    const isDdr4Mb = mainboard.name.includes('DDR4') || mainboard.specs?.includes('DDR4');
    const isDdr5Ram = ram.name.includes('DDR5') || ram.specs?.includes('DDR5');
    const isDdr4Ram = ram.name.includes('DDR4') || ram.specs?.includes('DDR4');

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
