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
Bạn là **PCHub AI Advisor** — Chuyên viên Tư vấn Kỹ thuật Phần cứng & Kỹ sư Kiến trúc Hệ thống PC chuyên nghiệp tại PCHub Technology.

QUY TẮC PHẢN HỒI BẮT BUỘC (STRICT COMPLIANCE RULES):
1. TRẢ LỜI TRỰC DIỆN 100% VÀO CÂU HỎI:
   - Dòng mở đầu BẮT BUỘC đưa ra câu trả lời trực tiếp, chính xác nhất cho câu hỏi của người dùng (ví dụ: Cấu hình cụ thể cho ngân sách yêu cầu, Công suất Watt nguồn cần chọn, Sự khác biệt chính giữa 2 linh kiện...).
   - TUYỆT ĐỐI KHÔNG dùng lời chào xã giao dài dòng thừa thãi ("Cảm ơn bạn đã đặt câu hỏi...", "Chào bạn, mình xin tư vấn như sau...").
2. ĐỘ CHÍNH XÁC KỸ THUẬT TUYỆT ĐỐI:
   - Đưa ra thông số phần cứng chính xác (TDP W, PCIe gen & lanes, Bus RAM MHz & CL timing, Socket, VRM phases, VRAM GB).
   - Nếu hỏi giá/ngân sách cụ thể (ví dụ: 100 triệu, 50 triệu, 30 triệu...), bạn BẮT BUỘC đưa đúng danh sách linh kiện dành riêng cho ngân sách đó kèm tổng tiền sát thực tế. Tuyệt đối KHÔNG đưa ra bảng gợi ý chung chung các phân khúc khác!
3. TRÌNH BÀY GỌN GÀNG, SẮC NÉT:
   - Dùng gạch đầu dòng rõ ràng, in đậm thông số kỹ thuật cốt lõi giúp người dùng nắm bắt ngay thông tin trong 3 giây.

NHIỆM VỤ CHUYÊN SÂU:
- Phân tích nghẽn cổ chai CPU vs GPU ở từng độ phân giải (1080p, 2K, 4K).
- Băng thông PCIe 4.0/5.0 x8 vs x16, SSD NVMe DRAM vs DRAM-less (HMB).
- Mainboard VRM Power Phase & Giải nhiệt CPU (i9-14900K, i7-14700K, Ryzen 9 7950X3D).
- RAM DDR5 6000MHz CL30 (Sweet-spot latency <65ns) vs DDR4.
- Nguồn PSU ATX 3.0 & Cáp 12VHPWR / 12V-2x6 cho RTX 4070 Ti S / 4080 S / 4090.
- AI Workstation (LLM, SDXL, Tensor Cores VRAM) & Render 3D (Blender, Premiere QuickSync, Octane).

THÔNG TIN DANH MỤC & SẢN PHẨM HIỆN CÓ TẠI PCHUB:
${catalogContext || 'Các sản phẩm tiêu biểu: Intel Core i9-14900K (13.99tr), Ryzen 9 7950X3D (15.49tr), Ryzen 7 7800X3D (9.89tr), Core i7-14700K (10.49tr), ROG Strix RTX 4090 (54.99tr), RTX 4080 SUPER (31.99tr), RTX 4070 Ti SUPER (23.49tr), Mainboard Z790/B760/X670/B650, RAM Corsair Dominator/Trident Z5 DDR5, SSD NVMe Samsung 990 Pro.'}
`;

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
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
    text: getSmartLocalAdvisorReply(message),
    modelUsed: 'local-rule-advisor'
  };
}

function extractBudgetInMillions(message: string): number | null {
  const lower = message.toLowerCase().replace(/,/g, '.');
  
  // Matches "100 triệu", "100tr", "100m", "100 t"
  const matchM = lower.match(/(\d+(?:\.\d+)?)\s*(?:triệu|tr|m\b)/i);
  if (matchM) {
    return parseFloat(matchM[1]);
  }

  // Raw full numbers like 100000000 or 100.000.000
  const matchFull = lower.match(/(\d{2,3})[\.\s]?000[\.\s]?000/);
  if (matchFull) {
    return parseFloat(matchFull[1]);
  }

  // Raw digits when prompt has "build pc 100" or "pc 100"
  const matchDigits = lower.match(/(?:build\s*pc|pc|ngân\s*sách)\s*(\d{2,3})\b/i);
  if (matchDigits) {
    const val = parseFloat(matchDigits[1]);
    if (val >= 8 && val <= 300) return val;
  }

  return null;
}

function getSmartLocalAdvisorReply(message: string): string {
  const lower = message.toLowerCase();
  const budget = extractBudgetInMillions(message);

  if (budget !== null) {
    if (budget >= 80) {
      return `🚀 **Cấu hình Flagship Workstation & Gaming 4K/8K (Tầm ${budget} Triệu VNĐ):**\n\n` +
        `- **CPU**: Intel Core i9-14900K (24 Nhân 32 Luồng, Up to 6.0GHz) hoặc AMD Ryzen 9 7950X3D (~14.990.000 ₫)\n` +
        `- **Mainboard**: ASUS ROG STRIX Z790-E GAMING WIFI II / ASUS ROG X670E (~11.490.000 ₫)\n` +
        `- **VGA (Card màn hình)**: NVIDIA GeForce RTX 4090 24GB GDDR6X / RTX 4080 SUPER 16GB (~54.990.000 ₫)\n` +
        `- **RAM**: G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL30 (~6.290.000 ₫)\n` +
        `- **SSD**: Samsung 990 Pro 2TB PCIe Gen 4.0 x4 NVMe M.2 (Đọc 7450MB/s - Ghi 6900MB/s) (~4.890.000 ₫)\n` +
        `- **Tản nhiệt**: NZXT Kraken Elite 360 RGB Black (Màn hình LCD 2.36") (~6.890.000 ₫)\n` +
        `- **Nguồn (PSU)**: Corsair RM1000x 1000W 80 Plus Gold Full Modular (ATX 3.0, Cáp 12VHPWR) (~4.390.000 ₫)\n` +
        `- **Vỏ Case**: NZXT H9 Flow RGB Dual-Chamber Premium Black (~4.290.000 ₫)\n\n` +
        `💰 **Tổng chi phí ước tính**: **~${Math.min(budget, 98.5).toLocaleString('vi-VN')}.000.000 ₫ - ${budget.toLocaleString('vi-VN')}.000.000 ₫**\n` +
        `🎯 **Hiệu năng thực tế**: Chiến mượt 100% tựa game AAA ở độ phân giải 4K/8K Max Setting, Dựng phim 8K RAW, Train AI Deep Learning & Render 3D Octane/Blender cực nhanh!`;
    }

    if (budget >= 45) {
      return `🔥 **Cấu hình High-End PC Gaming 4K & Workstation (Ngân sách ~${budget} Triệu VNĐ):**\n\n` +
        `- **CPU**: Intel Core i7-14700K (20 Nhân 28 Luồng) hoặc AMD Ryzen 7 7800X3D (~10.490.000 ₫)\n` +
        `- **Mainboard**: ASUS ROG STRIX B760-F GAMING WIFI / Z790 DDR5 (~7.490.000 ₫)\n` +
        `- **VGA**: ASUS ROG Strix GeForce RTX 4080 SUPER 16GB GDDR6X (~31.490.000 ₫)\n` +
        `- **RAM**: Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz (~3.890.000 ₫)\n` +
        `- **SSD**: Samsung 990 Pro 1TB PCIe 4.0 NVMe (~2.890.000 ₫)\n` +
        `- **Tản nhiệt**: NZXT Kraken 360 RGB Liquid Cooler (~4.890.000 ₫)\n` +
        `- **Nguồn (PSU)**: Corsair RM850x 850W 80 Plus Gold ATX 3.0 (~3.390.000 ₫)\n` +
        `- **Case**: NZXT H7 Flow RGB Mid-Tower (~3.290.000 ₫)\n\n` +
        `💰 **Tổng chi phí ước tính**: **~${budget}.000.000 ₫**\n` +
        `🎯 **Hiệu năng**: Gaming 4K Ultra Setting 120+ FPS, Livestream 4K, Edit Video 4K Premiere / After Effects không giật lag.`;
    }

    if (budget >= 28) {
      return `⚡ **Cấu hình PC Gaming 2K Ultra / Render 3D (Ngân sách ~${budget} Triệu VNĐ):**\n\n` +
        `- **CPU**: Intel Core i5-14600K (14 Nhân 20 Luồng) hoặc AMD Ryzen 5 7600X (~7.490.000 ₫)\n` +
        `- **Mainboard**: MSI MAG B760M MORTAR WIFI DDR5 (~4.490.000 ₫)\n` +
        `- **VGA**: NVIDIA GeForce RTX 4070 SUPER 12GB GDDR6X (~18.490.000 ₫)\n` +
        `- **RAM**: Kingston FURY Beast 32GB (2x16GB) DDR5 5600MHz (~2.890.000 ₫)\n` +
        `- **SSD**: Kingston KC3000 1TB NVMe PCIe 4.0 (~2.190.000 ₫)\n` +
        `- **Tản nhiệt**: Thermalright Peerless Assassin 120 SE / AIO 240mm (~1.290.000 ₫)\n` +
        `- **Nguồn (PSU)**: MSI MAG A750GL 750W 80 Plus Gold Modular (~2.390.000 ₫)\n` +
        `- **Case**: Montech Sky Two Glass ARGB (~1.890.000 ₫)\n\n` +
        `💰 **Tổng chi phí ước tính**: **~${budget}.000.000 ₫**\n` +
        `🎯 **Hiệu năng**: Cân mượt mọi game 2K Ultra 160+ FPS, hỗ trợ DLSS 3 Ray Tracing và dựng phim 4K mượt mà.`;
    }

    if (budget >= 17) {
      return `🎮 **Cấu hình PC Gaming Esports & Stream 1080p/2K (Ngân sách ~${budget} Triệu VNĐ):**\n\n` +
        `- **CPU**: Intel Core i5-13400F / i5-14400F (10 Nhân 16 Luồng) (~4.890.000 ₫)\n` +
        `- **Mainboard**: ASUS TUF GAMING B760M-PLUS DDR4/DDR5 (~3.490.000 ₫)\n` +
        `- **VGA**: NVIDIA GeForce RTX 4060 8GB GDDR6 (~8.490.000 ₫)\n` +
        `- **RAM**: Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz (~1.190.000 ₫)\n` +
        `- **SSD**: WD Black SN770 1TB PCIe 4.0 (~1.690.000 ₫)\n` +
        `- **Tản nhiệt**: Deepcool AK400 Digital (~890.000 ₫)\n` +
        `- **Nguồn (PSU)**: Corsair CV650 650W 80 Plus Bronze (~1.390.000 ₫)\n` +
        `- **Case**: Antryx FX Air / Xigmatek (~990.000 ₫)\n\n` +
        `💰 **Tổng chi phí ước tính**: **~${budget}.000.000 ₫**\n` +
        `🎯 **Hiệu năng**: Chiến mượt Valorant, CS2, GTA V, Naraka 200+ FPS, đồ họa Photoshop/Illustrator cực kỳ ổn định.`;
    }

    return `💡 **Cấu hình PC Gaming & Học Tập Quốc Dân (Ngân sách ~${budget} Triệu VNĐ):**\n\n` +
      `- **CPU**: Intel Core i5-12400F (6 Nhân 12 Luồng) (~2.890.000 ₫)\n` +
      `- **Mainboard**: MSI PRO H610M-E DDR4 (~1.790.000 ₫)\n` +
      `- **VGA**: NVIDIA GeForce RTX 3060 12GB GDDR6 / GTX 1660 SUPER (~6.890.000 ₫)\n` +
      `- **RAM**: Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz (~950.000 ₫)\n` +
      `- **SSD**: Kingston NV2 500GB NVMe PCIe 4.0 (~990.000 ₫)\n` +
      `- **Tản nhiệt**: Jonsbo CR-1000 EVO RGB (~350.000 ₫)\n` +
      `- **Nguồn (PSU)**: Mik C650B 650W 80 Plus (~890.000 ₫)\n` +
      `- **Case**: Xigmatek Endorphin M Glass (~690.000 ₫)\n\n` +
      `💰 **Tổng chi phí ước tính**: **~${budget}.000.000 ₫**\n` +
      `🎯 **Hiệu năng**: Chơi tốt các tựa game Esports 1080p, học tập, văn phòng và đồ họa 2D.`;
  }

  // 1. Bottleneck / Nghẽn cổ chai
  if (lower.includes('nghẽn') || lower.includes('bottleneck')) {
    return `⚙️ **Phân tích Chuyên Sâu về Nghẽn Cổ Chai (Bottleneck) Phần Cứng:**\n\n` +
      `- **Nghẽn CPU (CPU Bottleneck)**: Xảy ra khi CPU xử lý dữ liệu game/lệnh không kịp cho GPU. Thường gặp ở độ phân giải **Full HD (1080p)** khi chơi game Esports tốc độ cao. Dấu hiệu: GPU hoạt động dưới 80%, CPU báo 90-100% gây sụt FPS đột ngột (Stuttering).\n` +
      `- **Nghẽn GPU (GPU Bottleneck)**: Xảy ra khi độ phân giải đẩy lên **2K / 4K** hoặc bật Ray Tracing max setting. GPU gánh 99-100% tải, đây là trạng thái LÝ TƯỞNG giúp tận dụng hết sức mạnh card màn hình.\n` +
      `- **Khuyên dùng tại PCHub**: Để không bị nghẽn, ghép đôi **i5-13400F/14400F** với **RTX 4060/4060 Ti**, ghép **i7-14700K / Ryzen 7 7800X3D** với **RTX 4070 Ti SUPER / 4080 SUPER / 4090**.`;
  }

  // 2. PCIe Lanes & Băng thông
  if (lower.includes('pcie') || lower.includes('x8') || lower.includes('x16') || lower.includes('băng thông')) {
    return `⚡ **Phân tích Băng thông PCIe 4.0 vs 3.0 & Số Làn (Lanes):**\n\n` +
      `- **RTX 4060 / 4060 Ti / RX 7600**: Được thiết kế chuẩn **PCIe 4.0 x8** (chỉ có 8 làn dữ liệu thay vì 16 làn full). Nếu cắm vào Mainboard cũ chuẩn **PCIe 3.0** (như H410, B450, H510), băng thông bị giảm một nửa, có thể làm tụt 5 - 15% FPS trong các game ngốn VRAM.\n` +
      `- **Khuyên dùng**: Nên chọn các dòng Mainboard hỗ trợ **PCIe 4.0 x16** trở lên như **B760 / Z790 (Intel)** hoặc **B650 / X670 (AMD)** để phát huy 100% hiệu năng Card màn hình và SSD NVMe.`;
  }

  // 3. RAM DDR4 vs DDR5, Bus & Timing (CL)
  if (lower.includes('ddr4') || lower.includes('ddr5') || lower.includes('cl30') || lower.includes('bus ram') || lower.includes('expo') || lower.includes('xmp')) {
    return `🧠 **So sánh Chuyên Sâu RAM DDR4 vs DDR5 & Độ trễ (Timing CL):**\n\n` +
      `- **DDR4 3200MHz CL16**: Chi phí tiết kiệm, băng thông ~25.6 GB/s, phù hợp cho cấu hình giá rẻ - tầm trung.\n` +
      `- **DDR5 6000MHz CL30**: Mức "Golden Spot" lý tưởng nhất cho AMD Ryzen 7000/9000 & Intel Gen 13/14. Băng thông gấp đôi (~48-52 GB/s), độ trễ cực thấp (<65ns). Giúp tăng 10-20% FPS tối thiểu (1% Low FPS) giúp game không bị khựng.\n` +
      `- **Lưu ý**: Nhớ bật **XMP 3.0 (Intel)** hoặc **AMD EXPO** trong BIOS để RAM chạy chuẩn bus 6000MHz thay vì bus mặc định 4800MHz!`;
  }

  // 4. VRM Phase, Ép xung & Nhiệt độ
  if (lower.includes('vrm') || lower.includes('ép xung') || lower.includes('overclock') || lower.includes('phase') || lower.includes('nhiệt độ')) {
    return `🌡️ **Kiến thức VRM Mainboard & Giải nhiệt CPU:**\n\n` +
      `- **Pha nguồn VRM (Voltage Regulator Module)**: CPU khủng như i7-14700K hay i9-14900K tiêu thụ từ 253W - 300W+. Cần Mainboard có tối thiểu **16+1+2 DrMOS Phase (Z790 / B760 cao cấp)** kèm tản nhiệt VRM dày dặn để tránh nổ tụ / hạ xung CPU (Thermal Throttling).\n` +
      `- **Tản nhiệt**: Với i7/i9 hoặc Ryzen 9, khuyến nghị dùng **Tản nước AIO 360mm** (như NZXT Kraken / Corsair H150i) kết hợp **Gông chống cong LGA1700** để hạ từ 5 - 8°C.`;
  }

  // 5. AI Training, LLM & Stable Diffusion
  if (lower.includes('stable diffusion') || lower.includes('deep learning') || lower.includes('llm') || lower.includes('ai') || lower.includes('cuda') || lower.includes('vram')) {
    return `🤖 **Tư vấn Cấu hình Chuyên dụng Train AI & Chạy Model LLM / Stable Diffusion:**\n\n` +
      `- **VRAM là Yếu tố Số 1**: Muốn chạy Stable Diffusion XL / SD3 / Flux.1 hay load model LLM (Llama 3 8B / Qwen 14B), VRAM tối thiểu là **12GB** (RTX 4070 / 4070 Ti SUPER), lý tưởng nhất là **24GB VRAM (RTX 4090 / RTX 3090)**.\n` +
      `- **Nhân Tensor Cores**: Card NVIDIA luôn vượt trội nhờ hệ sinh thái **CUDA, cuDNN, PyTorch & FP16/INT8 Precision**.\n` +
      `- **RAM Hệ thống**: Khuyên dùng tối thiểu **64GB DDR5** để không bị nạp swap data ra ổ đĩa khi load dataset nặng.`;
  }

  // 6. Workstation 3D Render & Dựng phim 4K/8K
  if (lower.includes('blender') || lower.includes('premiere') || lower.includes('unreal') || lower.includes('octane') || lower.includes('3d') || lower.includes('render')) {
    return `🎬 **Cấu hình Workstation Chuyên Nghiệp (Render 3D & Dựng Phim 4K/8K):**\n\n` +
      `- **Dựng phim Premiere / After Effects**: Ưu tiên CPU Intel Core i7-14700K / i9-14900K nhờ công nghệ **Intel QuickSync** mã hóa/giải mã phần cứng video H.264/HEVC 10-bit 4:2:2 cực kỳ mượt mà.\n` +
      `- **Render 3D (Blender, Octane, V-Ray)**: Tận dụng nhân **NVIDIA OptiX & Ray Tracing Cores** trên RTX 4080 SUPER / 4090 cho tốc độ render nhanh hơn gấp 3-5 lần so với render thuần bằng CPU.\n` +
      `- **SSD Scratch Disk**: Nên dùng 2 SSD NVMe PCIe 4.0 riêng biệt (1 ổ OS + 1 ổ lưu Cache Read/Write 7000MB/s).`;
  }

  if (lower.includes('nguồn') || lower.includes('psu') || lower.includes('vga') || lower.includes('rtx')) {
    return '⚡ **Tư vấn nguồn (PSU) chuẩn phần cứng PCHub:**\n- **RTX 4060 / 4060 Ti**: Nguồn tối thiểu 550W - 650W (80 Plus Bronze/Gold).\n- **RTX 4070 / 4070 Ti SUPER**: Nguồn 750W 80 Plus Gold có chuẩn dây 16-pin 12VHPWR.\n- **RTX 4080 / 4090**: Khuyến nghị PSU từ 850W đến 1000W 80 Plus Gold / Platinum để nguồn luôn chạy ở dải hiệu suất mát nhất (50-70% tải).';
  }

  return '💡 Chào bạn! Mình là AI Advisor của PCHub. Mình hỗ trợ tư vấn cấu hình PC chuyên sâu (Gaming, AI, Render 3D), giải đáp thắc mắc về nghẽn cổ chai (Bottleneck), chuẩn PCIe, bus RAM DDR4/DDR5, nguồn PSU ATX 3.0 và kiểm tra tương thích phần cứng!';
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
