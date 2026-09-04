'use client';

import Link from 'next/link';
import { Bot, Sparkles, ChevronRight, Calendar, ArrowRight } from 'lucide-react';

const AI_HISTORY = [
  {
    title: 'Build PC Gaming 30 triệu',
    desc: 'AI Advisor đã phân tích & đề xuất 8 linh kiện tương thích tối ưu hiệu năng 4K Ultra.',
    date: '20/08/2026',
    score: '9.8/10',
    type: 'Cấu hình PC',
  },
  {
    title: 'Chọn PSU cho RTX 4070 Ti Super',
    desc: 'Khuyến nghị nguồn 750W 80 Plus Gold chuẩn PCIe Gen 5 12VHPWR.',
    date: '18/08/2026',
    score: '9.9/10',
    type: 'Tương thích linh kiện',
  },
  {
    title: 'Tư vấn nâng cấp RAM bo mạch B650',
    desc: 'Mainboard hiện hỗ trợ tối đa 64GB DDR5 Dual Channel bus 6000MHz.',
    date: '12/08/2026',
    score: '9.5/10',
    type: 'Tư vấn kỹ thuật',
  },
];

export default function AIHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Lịch sử AI Chat & Tư vấn</h1>
          <p className="text-sm text-slate-500 mt-1">Xem lại các đoạn hội thoại tư vấn và phân tích từ AI Advisor</p>
        </div>
        <Link
          href="/kiem-tra-tuong-thich"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
        >
          <Sparkles size={16} /> Hỏi AI Advisor mới
        </Link>
      </div>

      <div className="space-y-4">
        {AI_HISTORY.map((item) => (
          <div
            key={item.title}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                  <span>✨ Điểm tương thích AI: <strong className="text-emerald-600">{item.score}</strong></span>
                </div>
              </div>
            </div>

            <Link
              href="/kiem-tra-tuong-thich"
              className="inline-flex items-center gap-1 px-4 py-2.5 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all shrink-0 self-start sm:self-center"
            >
              Xem chi tiết <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}