'use client';

import { FormEvent, useState } from 'react';
import { Bot, ChevronDown, MessageCircle, Send, X } from 'lucide-react';
import { useUIStore } from '@/lib/store';

type Message = { from: 'ai' | 'user'; text: string };

const QUICK_QUESTIONS = [
  'Tư vấn build PC gaming 25 triệu',
  'RTX 4070 cần nguồn bao nhiêu W?',
  'CPU nào phù hợp để render video?',
];

function getReply(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('nguồn') || lower.includes('psu')) return 'Với RTX 4070, PCHub khuyến nghị PSU từ 650W đến 750W chuẩn 80 Plus Gold.';
  if (lower.includes('render')) return 'Bạn có thể chọn Intel Core i9-14900K hoặc AMD Ryzen 9 7950X3D, kết hợp RAM từ 32GB.';
  if (lower.includes('25 triệu') || lower.includes('gaming')) return 'Mình có thể gợi ý cấu hình gaming 2K trong tầm 25 triệu. Bạn ưu tiên FPS cao hay ngoại hình RGB?';
  return 'Mình đã ghi nhận câu hỏi. Bạn cho mình thêm ngân sách hoặc linh kiện đang quan tâm nhé.';
}

export default function AIChatWidget() {
  const open = useUIStore(state => state.isChatOpen);
  const setOpen = useUIStore(state => state.setChatOpen);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'ai', text: 'Xin chào! Mình là AI Advisor của PCHub. Bạn cần tư vấn linh kiện hay build PC?' },
  ]);

  const sendMessage = (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(current => [...current, { from: 'user', text: trimmed }, { from: 'ai', text: getReply(trimmed) }]);
    setInput('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  return <>
    {open && <div style={{ position: 'fixed', right: '22px', bottom: '84px', width: 'min(360px, calc(100vw - 32px))', zIndex: 1000, background: '#fff', border: '1px solid #dbe3ee', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 16px 45px rgba(15,23,42,.22)' }}>
      <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '14px 16px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}><div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={18} /></div><div><strong style={{ display: 'block', fontSize: '14px' }}>PCHub AI Advisor</strong><span style={{ fontSize: '10px', color: '#dbeafe' }}>Đang trực tuyến · Tư vấn miễn phí</span></div></div><button type="button" onClick={() => setOpen(false)} aria-label="Đóng AI Advisor" style={{ color: '#fff', padding: '4px', cursor: 'pointer' }}><X size={18} /></button></div>
  <div style={{ padding: '12px', maxHeight: '280px', overflowY: 'auto', background: '#f8fafc' }}>{messages.map((message, index) => <div key={`${message.from}-${index}`} style={{ display: 'flex', justifyContent: message.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: '9px' }}><div style={{ maxWidth: '85%', padding: '9px 11px', borderRadius: message.from === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: message.from === 'user' ? '#2563eb' : '#fff', color: message.from === 'user' ? '#fff' : '#334155', border: message.from === 'user' ? 'none' : '1px solid #e2e8f0', fontSize: '12px', lineHeight: 1.45 }}>{message.text}</div></div>)}</div>
      <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>{QUICK_QUESTIONS.map(question => <button key={question} type="button" onClick={() => sendMessage(question)} style={{ display: 'block', width: '100%', textAlign: 'left', border: '1px solid #dbeafe', color: '#2563eb', background: '#eff6ff', borderRadius: '7px', padding: '6px 8px', marginBottom: '5px', fontSize: '10px', cursor: 'pointer' }}>{question}</button>)}<form onSubmit={submit} style={{ display: 'flex', gap: '6px', marginTop: '8px' }}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Nhập câu hỏi..." aria-label="Nhập câu hỏi cho AI" style={{ flex: 1, minWidth: 0, border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }} /><button type="submit" aria-label="Gửi câu hỏi" style={{ width: '34px', borderRadius: '8px', color: '#fff', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={15} /></button></form></div>
    </div>}
    <button type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Đóng AI Advisor' : 'Mở AI Advisor'} style={{ position: 'fixed', right: '22px', bottom: '22px', zIndex: 1001, width: '50px', height: '50px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 18px rgba(37,99,235,.35)' }}>{open ? <ChevronDown size={22} /> : <MessageCircle size={22} />}</button>
  </>;
}
