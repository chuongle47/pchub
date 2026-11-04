'use client';

import { FormEvent, useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, MessageCircle, Send, X, Loader2, Sparkles, RefreshCw, ShoppingCart, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUIStore, useCartStore } from '@/lib/store';
import { matchPresetKeyFromText, AI_BUILD_PRESETS, reconcileBuildComponents, balanceSystemComponents } from '@/lib/buildPresets';

const DEFAULT_SLOT_IMAGES: Record<string, string> = {
  cpu: '/images/cpu-box.jpg',
  mainboard: '/images/cat-mainboard.jpg',
  ram: '/images/ram-rgb.jpg',
  gpu: '/images/gpu-strix.jpg',
  storage: '/images/ssd-nvme.jpg',
  psu: '/images/cat-psu.jpg',
  case: '/images/hero-pc.jpg',
  cooling: '/images/hero-pc.jpg',
};

export function extractBuildComponentsFromText(text: string): Record<string, any> {
  const compMap: Record<string, any> = {};
  if (!text) return compMap;

  const lines = text.split('\n');
  let currentKey = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Pattern matches: "1. CPU (Bộ vi xử lý): Intel Core i9-14900K... — 13.990.000₫"
    const match = line.match(/^\d+\.\s*\*{0,2}(CPU|Mainboard|VGA|RAM|Ổ cứng|Nguồn|Vỏ Case|Tản nhiệt)[^:]*\*{0,2}:\s*\*{0,2}(.*?)\*{0,2}\s*[—–-]\s*\*{0,2}([\d\.,]+)\s*₫/i);
    if (match) {
      const label = match[1].toLowerCase();
      const rawName = match[2].trim().replace(/\*+/g, '');
      const rawPrice = match[3].replace(/[\.,]/g, '');
      const price = parseInt(rawPrice, 10) || 0;

      let key = '';
      if (label.includes('cpu')) key = 'cpu';
      else if (label.includes('mainboard')) key = 'mainboard';
      else if (label.includes('vga')) key = 'gpu';
      else if (label.includes('ram')) key = 'ram';
      else if (label.includes('ổ cứng')) key = 'storage';
      else if (label.includes('nguồn')) key = 'psu';
      else if (label.includes('vỏ') || label.includes('case')) key = 'case';
      else if (label.includes('tản')) key = 'cooling';

      if (key) {
        currentKey = key;
        compMap[key] = {
          key,
          id: `ai-parsed-${key}-${Date.now()}`,
          name: rawName,
          price,
          tdp: key === 'cpu' ? 125 : key === 'gpu' ? 250 : key === 'mainboard' ? 40 : 15,
          specs: '',
          image: DEFAULT_SLOT_IMAGES[key] || '/images/hero-pc.jpg',
          slug: '',
        };
      }
    } else if (currentKey && compMap[currentKey] && (line.includes('Thông số') || line.includes('•'))) {
      const specText = line.replace(/^[\s•\*\-]+/, '').replace(/^Thông số\*?:\s*/i, '').trim();
      compMap[currentKey].specs = specText;
      if (currentKey === 'cpu') {
        const tdpMatch = specText.match(/(\d+)w/i);
        if (tdpMatch) compMap[currentKey].tdp = parseInt(tdpMatch[1], 10);
      }
      currentKey = '';
    }
  }

  return compMap;
}

type RecommendedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  image_url: string;
  category_name?: string;
  category_slug?: string;
  brand_name?: string;
};

type Message = {
  from: 'ai' | 'user';
  text: string;
  timestamp?: string;
  isError?: boolean;
  products?: RecommendedProduct[];
};

const INITIAL_MESSAGE: Message = {
  from: 'ai',
  text: 'Xin chào! Mình là **PCHub AI Advisor** 🤖\n\n' +
    'Mình là chuyên gia tư vấn công nghệ chuyên sâu, sẵn sàng hỗ trợ bạn:\n' +
    '• **Tư vấn theo Mức giá / Ngân sách**: *"chuột dưới 500k"*, *"màn hình dưới 15 triệu"*, *"tai nghe tầm 1 triệu"*\n' +
    '• **Tư vấn theo Thương hiệu chính hãng**: **Logitech**, **Dell**, **Samsung**, **Asus**, **MSI**, **Sony**, **Rapoo**, **HyperX**, **Kingston**...\n' +
    '• **Tư vấn theo Nhu cầu sử dụng**: Chơi game (FPS/MOBA/AAA), Thiết kế đồ họa 2D/3D, Dựng phim 4K hay Văn phòng yên tĩnh\n' +
    '• **Xây dựng cấu hình PC trọn bộ**: Cân bằng hiệu năng trên giá thành (P/P) và đảm bảo 100% tương thích phần cứng.\n\n' +
    '👉 Bạn đang cần tìm sản phẩm hoặc ngân sách nào nhé?',
};

const QUICK_QUESTIONS = [
  '🐭 Chuột Logitech dưới 500k',
  '🖥️ Màn hình Dell dưới 15 triệu',
  '🎧 Tai nghe Sony tầm 1 triệu',
  '⌨️ Bàn phím cơ dưới 1 triệu',
  '⚡ VGA RTX 4060 tầm 8 - 10 triệu',
  '🎮 Build PC Gaming 15 - 20 triệu',
  '💼 Cấu hình PC Văn phòng 8 - 10 triệu',
];

export default function AIChatWidget() {
  const router = useRouter();
  const open = useUIStore(state => state.isChatOpen);
  const setOpen = useUIStore(state => state.setChatOpen);
  const addItemToCart = useCartStore(state => state.addItem);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [addedId, setAddedId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleAddToCart = (e: React.MouseEvent, prod: RecommendedProduct) => {
    e.stopPropagation();
    addItemToCart({
      id: prod.id,
      name: prod.name,
      price: prod.price || 0,
      originalPrice: prod.original_price,
      image: prod.image_url,
      slug: prod.slug,
      category: prod.category_name,
      brand: prod.brand_name,
      quantity: 1,
    });
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleApplyBuild = (text: string, products?: RecommendedProduct[]) => {
    // 1. Direct high-fidelity extraction of all 8 components from the AI Advisor recommendation text
    const textComponents = extractBuildComponentsFromText(text);
    const componentsMap: Record<string, any> = { ...textComponents };

    // 2. Supplement from recommended products if any slot was not captured by text parser
    if (products && products.length > 0) {
      products.forEach(p => {
        const nameLower = p.name.toLowerCase();
        const catLower = (p.category_name || '').toLowerCase();
        const catSlug = (p.category_slug || '').toLowerCase();

        let slotKey = '';
        if (catSlug === 'cpu' || nameLower.includes('cpu') || nameLower.includes('intel') || nameLower.includes('ryzen')) slotKey = 'cpu';
        else if (catSlug === 'gpu' || catSlug === 'vga' || nameLower.includes('vga') || nameLower.includes('rtx') || nameLower.includes('rx ') || nameLower.includes('card')) slotKey = 'gpu';
        else if (catSlug === 'ram' || nameLower.includes('ram')) slotKey = 'ram';
        else if (catSlug === 'storage' || catSlug === 'ssd' || nameLower.includes('ssd') || nameLower.includes('hdd') || nameLower.includes('ổ cứng')) slotKey = 'storage';
        else if (catSlug === 'mainboard' || nameLower.includes('mainboard') || nameLower.includes('bo mạch')) slotKey = 'mainboard';
        else if (catSlug === 'psu' || nameLower.includes('psu') || nameLower.includes('nguồn')) slotKey = 'psu';
        else if (catSlug === 'case' || nameLower.includes('case') || nameLower.includes('vỏ')) slotKey = 'case';
        else if (catSlug === 'cooling' || nameLower.includes('tản nhiệt') || nameLower.includes('cooling')) slotKey = 'cooling';

        if (slotKey && !componentsMap[slotKey]) {
          componentsMap[slotKey] = {
            key: slotKey,
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            tdp: slotKey === 'cpu' ? 125 : slotKey === 'gpu' ? 250 : slotKey === 'mainboard' ? 40 : 15,
            specs: p.category_name || 'Khớp từ tư vấn AI',
            image: p.image_url || DEFAULT_SLOT_IMAGES[slotKey],
            slug: p.slug,
          };
        }
      });
    }

    // 3. Fallback to matched balanced preset for any component still missing
    const key = matchPresetKeyFromText(text);
    const rawFallbackPreset = AI_BUILD_PRESETS[key] || AI_BUILD_PRESETS['25m'];
    const lowerText = text.toLowerCase();
    const targetGpu = (lowerText.match(/(rtx\s*\d+|4090|4080|4070|4060|3060)/) || [])[0];
    const targetRam = (lowerText.match(/(16gb|32gb|64gb|128gb|\d+\s*gb)/) || [])[0];
    const targetStorage = (lowerText.match(/(1tb|2tb|4tb|\d+\s*tb)/) || [])[0];
    const aesthetic = lowerText.includes('trắng') || lowerText.includes('white') ? 'white' : undefined;
    const fallbackPreset = balanceSystemComponents(rawFallbackPreset, { targetGpu, targetRam, targetStorage, aesthetic });

    Object.keys(fallbackPreset.components).forEach(slotKey => {
      if (!componentsMap[slotKey]) {
        componentsMap[slotKey] = fallbackPreset.components[slotKey];
      }
    });

    // 4. Enforce 100% hardware compatibility (CPU socket matching, RAM DDR generation & PSU capacity)
    const reconciledComponents = reconcileBuildComponents(componentsMap);

    const dynamicPreset = {
      id: `custom-ai-${Date.now()}`,
      title: 'Cấu hình tối ưu từ PCHub AI Advisor',
      budgetLabel: fallbackPreset.budgetLabel,
      totalPrice: Object.values(reconciledComponents).reduce((acc: number, c: any) => acc + (c.price || 0), 0),
      components: reconciledComponents,
    };

    try {
      localStorage.setItem('pchub_pending_ai_preset', JSON.stringify(dynamicPreset));
      window.dispatchEvent(new CustomEvent('pchub_apply_ai_preset', { detail: dynamicPreset }));
    } catch (e) {
      console.error('Failed to save preset to storage:', e);
    }
    setOpen(false);
    router.push('/build-pc');
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open, loading]);

  const sendMessage = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // Add user message
    const userMsg: Message = { from: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history payload for Gemini
      const history = messages
        .filter(m => !m.isError)
        .slice(-6)
        .map(m => ({
          role: m.from === 'user' ? ('user' as const) : ('model' as const),
          content: m.text,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { from: 'ai', text: data.reply, products: data.recommendedProducts }]);
      } else {
        throw new Error(data.error || 'API Error');
      }
    } catch (err: any) {
      console.error('Gemini Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          from: 'ai',
          text: '⚡ PCHub AI Advisor đang cập nhật thêm dữ liệu phần cứng. Bạn có thể thử lại hoặc để lại câu hỏi cụ thể hơn nhé!',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  const renderFormattedText = (text: string) => {
    // Basic Markdown formatting for bold and lists
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span
          key={idx}
          style={{ display: 'block', marginBottom: idx === lines.length - 1 ? 0 : '4px' }}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            paddingTop: 'clamp(64px, 8vh, 96px)',
            paddingBottom: '24px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(980px, calc(100vw - 32px))',
              height: 'min(700px, calc(100vh - 120px))',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0055d4 0%, #1d4ed8 100%)',
                padding: '14px 24px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Bot size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '15px', fontWeight: 800 }}>
                    PCHub AI Advisor ⚡
                  </strong>
                  <span
                    style={{
                      fontSize: '11.5px',
                      color: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#4ade80',
                        boxShadow: '0 0 6px #4ade80',
                      }}
                    />
                    Powered by Gemini AI · Tư vấn phần cứng PC 24/7
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Làm mới cuộc trò chuyện"
                  aria-label="Làm mới cuộc trò chuyện"
                  style={{
                    color: '#fff',
                    padding: '8px',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <RefreshCw size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Đóng AI Advisor (ESC)"
                  aria-label="Đóng AI Advisor"
                  style={{
                    color: '#fff',
                    padding: '8px',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <X size={19} />
                </button>
              </div>
            </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              padding: '20px 24px',
              overflowY: 'auto',
              background: '#f8fafc',
            }}
          >
            <div
              style={{
                maxWidth: '100%',
                margin: '0 auto',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.from}-${index}`}
                  style={{
                    display: 'flex',
                    justifyContent: message.from === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {message.from === 'ai' && (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#0055d4',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '10px',
                        flexShrink: 0,
                        marginTop: '2px',
                        boxShadow: '0 2px 6px rgba(0,85,212,0.2)',
                      }}
                    >
                      <Bot size={18} />
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '12px 16px',
                      borderRadius:
                        message.from === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: message.from === 'user' ? 'linear-gradient(135deg, #0055d4, #1d4ed8)' : '#ffffff',
                      color: message.from === 'user' ? '#ffffff' : '#1e293b',
                      border: message.from === 'user' ? 'none' : '1px solid #e2e8f0',
                      fontSize: '13.5px',
                      lineHeight: '1.6',
                      boxShadow: message.from === 'user' ? '0 4px 12px rgba(0,85,212,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {renderFormattedText(message.text)}

                    {/* Interactive Recommended Products Cards */}
                    {message.products && message.products.length > 0 && (
                      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          🛒 Sản phẩm gợi ý tại PCHub:
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '10px',
                          }}
                        >
                          {message.products.map(prod => (
                            <div
                              key={prod.id}
                              onClick={() => { setOpen(false); router.push(`/product/${prod.slug}`); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                              <img
                                src={prod.image_url}
                                alt={prod.name}
                                style={{ width: '46px', height: '46px', objectFit: 'contain', borderRadius: '6px', background: '#fff', padding: '2px', border: '1px solid #f1f5f9' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {prod.name}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
                                  {prod.price ? `${prod.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={(e) => handleAddToCart(e, prod)}
                                  title="Thêm nhanh vào giỏ hàng"
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: addedId === prod.id ? '#16a34a' : '#2563eb',
                                    background: addedId === prod.id ? '#dcfce7' : '#eff6ff',
                                    border: addedId === prod.id ? '1px solid #86efac' : '1px solid #bfdbfe',
                                    padding: '4px 7px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {addedId === prod.id ? (
                                    <>
                                      <Check size={12} />
                                      <span>Đã thêm</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart size={12} />
                                      <span>+ Giỏ</span>
                                    </>
                                  )}
                                </button>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '4px 7px', borderRadius: '6px' }}>
                                  Xem →
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.from === 'ai' && index > 0 && (() => {
                      const txt = (message.text || '').toLowerCase();
                      let isBuild = false;
                      if (message.products && message.products.length >= 2) {
                        const pcSlots = new Set<string>();
                        for (const p of message.products) {
                          const cat = ((p.category_slug || '') + ' ' + (p.category_name || '')).toLowerCase();
                          const n = (p.name || '').toLowerCase();
                          if (cat.includes('cpu') || n.includes('intel core') || n.includes('ryzen')) pcSlots.add('cpu');
                          if (cat.includes('gpu') || cat.includes('vga') || n.includes('rtx ') || n.includes('gtx ') || n.includes('rx ') || n.includes('radeon')) pcSlots.add('gpu');
                          if (cat.includes('main') || n.includes('bo mạch') || n.includes('b760') || n.includes('z790') || n.includes('b650') || n.includes('a620')) pcSlots.add('main');
                          if (cat.includes('ram') || n.includes('ddr4') || n.includes('ddr5')) pcSlots.add('ram');
                          if (cat.includes('psu') || n.includes('nguồn máy tính')) pcSlots.add('psu');
                          if (cat.includes('case') || n.includes('vỏ case')) pcSlots.add('case');
                          if (cat.includes('cooling') || n.includes('tản nhiệt')) pcSlots.add('cooling');
                          if (cat.includes('ssd') || cat.includes('storage') || n.includes('ổ cứng')) pcSlots.add('storage');
                        }
                        if (pcSlots.size >= 2) isBuild = true;
                      }
                      if (!isBuild) {
                        const hasBuildKeywords = txt.includes('cấu hình') || txt.includes('build pc') || txt.includes('dàn pc') || txt.includes('bộ pc');
                        const hasHardwareKeywords = (txt.includes('cpu') || txt.includes('vi xử lý')) && (txt.includes('main') || txt.includes('vga') || txt.includes('card đồ họa') || txt.includes('ram'));
                        if (hasBuildKeywords && hasHardwareKeywords) isBuild = true;
                      }

                      if (!isBuild) return null;

                      return (
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                          <button
                            type="button"
                            onClick={() => handleApplyBuild(message.text, message.products)}
                            style={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px 16px',
                              fontSize: '13px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Sparkles size={15} />
                            <span>⚡ Áp Dụng Cấu Hình Này Vào PC Builder →</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', paddingLeft: '42px' }}>
                  <Loader2 size={16} className="animate-spin" style={{ color: '#0055d4' }} />
                  <span>Gemini AI đang phân tích dữ liệu phần cứng & tính toán độ tương thích...</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Questions Chips & Input Form */}
          <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
            <div style={{ maxWidth: '100%', margin: '0 auto', width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  marginBottom: '8px',
                  scrollbarWidth: 'none',
                }}
              >
                {QUICK_QUESTIONS.map(question => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question.replace(/^[\s\S]*?\s/, ''))}
                    disabled={loading}
                    style={{
                      whiteSpace: 'nowrap',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      background: '#eff6ff',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="ai-chat-input"
                  autoComplete="off"
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  placeholder="Hỏi AI về CPU, VGA, PSU, tư vấn cấu hình PC theo ngân sách..."
                  aria-label="Nhập câu hỏi cho AI Advisor"
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '13.5px',
                    outline: 'none',
                    color: '#0f172a',
                    caretColor: '#2563eb',
                    background: loading ? '#f8fafc' : '#ffffff',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Gửi câu hỏi"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    color: '#fff',
                    background: loading || !input.trim() ? '#94a3b8' : 'linear-gradient(135deg, #0055d4, #1d4ed8)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: loading || !input.trim() ? 'none' : '0 4px 12px rgba(0,85,212,0.3)',
                  }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Floating Toggle Icon */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Đóng AI Advisor' : 'Mở AI Advisor'}
        className="ai-chat-floating-btn"
        style={{
          position: 'fixed',
          right: '22px',
          bottom: '22px',
          zIndex: 1001,
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: '#0055d4',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,85,212,.4)',
          border: '2px solid #ffffff',
          transition: 'transform 0.2s ease',
        }}
      >
        {open ? <ChevronDown size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}

