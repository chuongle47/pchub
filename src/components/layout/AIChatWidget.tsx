'use client';

import { FormEvent, useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, MessageCircle, Send, X, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { matchPresetKeyFromText, AI_BUILD_PRESETS } from '@/lib/buildPresets';

type RecommendedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  image_url: string;
  category_name?: string;
  brand_name?: string;
};

type Message = {
  from: 'ai' | 'user';
  text: string;
  timestamp?: string;
  isError?: boolean;
  products?: RecommendedProduct[];
};

const QUICK_QUESTIONS = [
  '💡 Tư vấn PC gaming 20 - 25 triệu',
  '⚡ RTX 4070 Ti SUPER chọn PSU mấy Watt?',
  '🖥️ Mainboard Z790 khác B760 thế nào?',
  '💾 Nên chọn RAM DDR4 hay DDR5?',
];

export default function AIChatWidget() {
  const router = useRouter();
  const open = useUIStore(state => state.isChatOpen);
  const setOpen = useUIStore(state => state.setChatOpen);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'ai',
      text: 'Xin chào! Mình là **PCHub AI Advisor** 🤖\nMình hỗ trợ tư vấn chọn CPU, VGA, RAM, Mainboard, nguồn PSU & build cấu hình PC tối ưu theo ngân sách của bạn. Bạn đang cần hỗ trợ gì nhé?',
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleApplyBuild = (text: string) => {
    const key = matchPresetKeyFromText(text);
    const preset = AI_BUILD_PRESETS[key] || AI_BUILD_PRESETS['25m'];
    try {
      localStorage.setItem('pchub_pending_ai_preset', JSON.stringify(preset));
      window.dispatchEvent(new CustomEvent('pchub_apply_ai_preset', { detail: preset }));
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
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '84px',
            width: 'min(380px, calc(100vw - 32px))',
            height: '520px',
            maxHeight: 'calc(100vh - 110px)',
            zIndex: 1000,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(15,23,42,.22)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0055d4, #1d4ed8)',
              padding: '14px 16px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', fontWeight: 800 }}>
                  PCHub AI Advisor ⚡
                </strong>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#4ade80',
                    }}
                  />
                  Powered by Gemini AI · Trực tuyến 24/7
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng AI Advisor"
              style={{
                color: '#fff',
                padding: '4px',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
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
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#0055d4',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '6px',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius:
                      message.from === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: message.from === 'user' ? '#0055d4' : '#ffffff',
                    color: message.from === 'user' ? '#ffffff' : '#1e293b',
                    border: message.from === 'user' ? 'none' : '1px solid #e2e8f0',
                    fontSize: '12.5px',
                    lineHeight: '1.5',
                    boxShadow: message.from === 'user' ? 'none' : '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                    {renderFormattedText(message.text)}

                    {/* Interactive Recommended Products Cards */}
                    {message.products && message.products.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          🛒 Sản phẩm có sẵn tại PCHub (Sbuy API):
                        </div>
                        {message.products.map(prod => (
                          <div
                            key={prod.id}
                            onClick={() => { setOpen(false); router.push(`/product/${prod.slug}`); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 10px',
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
                              style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '6px', background: '#fff', padding: '2px', border: '1px solid #f1f5f9' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prod.name}
                              </div>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
                                {prod.price ? `${prod.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                              </div>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', flexShrink: 0 }}>
                              Xem →
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.from === 'ai' && index > 0 && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                        <button
                          type="button"
                          onClick={() => handleApplyBuild(message.text)}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 12px',
                            fontSize: '11.5px',
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
                          <Sparkles size={13} />
                          <span>⚡ Áp Dụng Cấu Hình Này Vào PC Builder →</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', paddingLeft: '32px' }}>
                <Loader2 size={14} className="animate-spin" style={{ color: '#0055d4' }} />
                <span>Gemini AI đang phân tích dữ liệu phần cứng...</span>
              </div>
            )}
          </div>

          {/* Quick Questions Chips & Input Form */}
          <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
            <div
              style={{
                display: 'flex',
                gap: '6px',
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
                    padding: '5px 11px',
                    fontSize: '10.5px',
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
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder="Hỏi AI về CPU, VGA, PSU, build PC..."
                aria-label="Nhập câu hỏi cho AI Advisor"
                disabled={loading}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  fontSize: '12.5px',
                  outline: 'none',
                  background: loading ? '#f8fafc' : '#fff',
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Gửi câu hỏi"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  color: '#fff',
                  background: loading || !input.trim() ? '#94a3b8' : '#0055d4',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
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

