'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Settings2,
  Sliders,
  Save,
  MessageSquare,
  AlertTriangle,
  Flag,
  CheckCircle,
  Clock,
  Eye,
  Check,
  X,
  Loader2,
  Cpu,
  Layers,
  ShieldAlert,
  Search
} from 'lucide-react';
import { updateAiSettingsAction, flagAiConversationAction } from '@/lib/actions/admin-content';

export interface AiSettings {
  id: number;
  enabled: boolean;
  system_prompt: string;
  model: string;
  daily_token_limit: number;
  updated_at: string;
}

export interface AiConversation {
  id: string;
  session_id: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'model';
    content: string;
    timestamp?: string;
  }>;
  flagged: boolean;
  created_at: string;
}

interface Props {
  initialSettings: AiSettings;
  initialConversations: AiConversation[];
}

function maskPII(text: string): string {
  if (!text) return '';
  let result = text.replace(/(\b0\d{2})\d{4}(\d{3}\b)/g, '$1****$2');
  result = result.replace(/(\b[A-Za-z0-9._%+-]{2})[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/g, '$1***$2');
  return result;
}

export function AiAdvisorManager({ initialSettings, initialConversations }: Props) {
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');

  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [model, setModel] = useState(initialSettings.model || 'gemini-1.5-flash');
  const [dailyTokenLimit, setDailyTokenLimit] = useState(initialSettings.daily_token_limit || 1000000);
  const [systemPrompt, setSystemPrompt] = useState(initialSettings.system_prompt || '');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const [conversations, setConversations] = useState<AiConversation[]>(initialConversations);
  const [searchLog, setSearchLog] = useState('');
  const [filterFlagged, setFilterFlagged] = useState<'all' | 'flagged'>('all');
  const [selectedConversation, setSelectedConversation] = useState<AiConversation | null>(null);
  const [togglingFlagId, setTogglingFlagId] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await updateAiSettingsAction({
        enabled,
        model,
        daily_token_limit: Number(dailyTokenLimit),
        system_prompt: systemPrompt,
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu cấu hình AI');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleFlag = async (id: string, currentFlagged: boolean) => {
    setTogglingFlagId(id);
    try {
      await flagAiConversationAction(id, !currentFlagged);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, flagged: !currentFlagged } : c))
      );
      if (selectedConversation?.id === id) {
        setSelectedConversation((prev) => (prev ? { ...prev, flagged: !currentFlagged } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đánh dấu hội thoại');
    } finally {
      setTogglingFlagId(null);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchFlag = filterFlagged === 'all' || (filterFlagged === 'flagged' && c.flagged);
    const contentStr = JSON.stringify(c.messages).toLowerCase();
    const matchSearch = !searchLog || c.session_id.toLowerCase().includes(searchLog.toLowerCase()) || contentStr.includes(searchLog.toLowerCase());
    return matchFlag && matchSearch;
  });

  const flaggedCount = conversations.filter((c) => c.flagged).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Trợ lý AI & Kiểm tra tương thích</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Cấu hình mô hình Gemini, tinh chỉnh System Prompt và kiểm duyệt nhật ký tư vấn.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-sm">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-4 h-4" /> Cấu hình AI
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Nhật ký tư vấn ({conversations.length})
            {flaggedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                {flaggedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" /> System Prompt (Chỉ dẫn hệ thống)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Xác lập vai trò chuyên gia phần cứng PC, phong cách nói chuyện và quy tắc kiểm tra tương thích linh kiện.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSystemPrompt(
                        'Bạn là chuyên gia tư vấn phần cứng cao cấp của PCHub (pchub.vn).\nNhiệm vụ của bạn là tư vấn cấu hình máy tính, kiểm tra độ tương thích giữa các linh kiện (Socket CPU vs Mainboard, Khe cắm RAM DDR4/DDR5, Công suất nguồn PSU, Kích thước Case & VGA).\nPhong cách: Chuyên nghiệp, khách quan, trung thực, thân thiện, trả lời bằng tiếng Việt gãy gọn, ưu tiên hiệu năng trên giá thành (Price/Performance).\nKhông bao giờ đưa ra lời khuyên sai lệch về nguồn công suất thực và socket vật lý.'
                      )
                    }
                    className="text-xs text-red-400 hover:underline"
                  >
                    Nạp prompt mẫu
                  </button>
                </div>

                <textarea
                  rows={14}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Nhập hướng dẫn chi tiết cho Gemini AI..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 font-mono leading-relaxed focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trạng thái hoạt động</h3>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-white">Kích hoạt trợ lý AI</div>
                    <div className="text-xs text-slate-500">Cho phép khách hàng trò chuyện trên storefront</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mô hình AI & Giới hạn</h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Mô hình Gemini (Google DeepMind)</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Tốc độ cao, tối ưu chi phí)</option>
                    <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Tư vấn phức tạp, suy luận sâu)</option>
                    <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Thế hệ mới nhất)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Hạn mức Token mỗi ngày</label>
                  <input
                    type="number"
                    value={dailyTokenLimit}
                    onChange={(e) => setDailyTokenLimit(Number(e.target.value))}
                    min={10000}
                    step={50000}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Mặc định: 1.000.000 tokens/ngày để phòng ngừa lạm dụng chi phí.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu cấu hình AI
                </button>
                {settingsSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4" /> Đã cập nhật cấu hình AI thành công
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm theo Session ID hoặc nội dung chat..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterFlagged('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterFlagged === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả cuộc trò chuyện
              </button>
              <button
                onClick={() => setFilterFlagged('flagged')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  filterFlagged === 'flagged'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                Cần rà soát ({flaggedCount})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredConversations.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-sm">
                Không có phiên trò chuyện nào phù hợp.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const messageCount = conv.messages?.length || 0;
                const lastMsg = conv.messages?.[conv.messages.length - 1]?.content || '';
                const isToggling = togglingFlagId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      conv.flagged
                        ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400 font-semibold">
                          #{conv.session_id.slice(0, 16)}...
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(conv.created_at).toLocaleString('vi-VN')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {messageCount} tin nhắn
                        </span>
                        {conv.flagged && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Flag className="w-3 h-3" /> Cần rà soát
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {maskPII(lastMsg)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        disabled={isToggling}
                        onClick={() => handleToggleFlag(conv.id, conv.flagged)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          conv.flagged
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title={conv.flagged ? 'Bỏ đánh dấu' : 'Gắn cờ kiểm tra'}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        {conv.flagged ? 'Đã gắn cờ' : 'Gắn cờ'}
                      </button>

                      <button
                        onClick={() => setSelectedConversation(conv)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                      >
                        Xem hội thoại
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Chi tiết cuộc trò chuyện</h3>
                  <p className="text-xs font-mono text-slate-500">
                    Session: {selectedConversation.session_id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFlag(selectedConversation.id, selectedConversation.flagged)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                    selectedConversation.flagged
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {selectedConversation.flagged ? 'Đã gắn cờ' : 'Gắn cờ'}
                </button>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {selectedConversation.messages?.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">Không có tin nhắn nào</div>
              ) : (
                selectedConversation.messages.map((m, idx) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 px-1">
                        <span>{isUser ? 'Khách hàng' : 'PCHub Gemini AI'}</span>
                        {m.timestamp && <span>• {new Date(m.timestamp).toLocaleTimeString('vi-VN')}</span>}
                      </div>
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm'
                        }`}
                      >
                        {maskPII(m.content)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
              <span className="text-xs text-slate-500">
                * Thông tin nhạy cảm (SĐT, Email) đã được tự động che (PII Masking).
              </span>
              <button
                onClick={() => setSelectedConversation(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
