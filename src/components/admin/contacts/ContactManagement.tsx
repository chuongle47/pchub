'use client';

import React, { useState, useMemo } from 'react';
import {
  Mail,
  Phone,
  User,
  Clock,
  Trash2,
  CheckCircle,
  Eye,
  Search,
  Filter,
  Download,
  Send,
  Ticket,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Inbox
} from 'lucide-react';
import {
  updateContactStatusAction,
  deleteContactAction,
  toggleVoucherSentAction,
  deleteSubscriberAction,
} from '@/lib/actions/admin-content';

export interface ContactMessage {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  voucher_sent: boolean;
  created_at: string;
}

interface Props {
  initialContacts: ContactMessage[];
  initialSubscribers: NewsletterSubscriber[];
}

export function ContactManagement({ initialContacts, initialSubscribers }: Props) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'subscribers'>('contacts');

  const [contacts, setContacts] = useState(initialContacts);
  const [searchContact, setSearchContact] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [searchSub, setSearchSub] = useState('');
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'sent' | 'pending'>('all');

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        !searchContact ||
        c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
        c.email.toLowerCase().includes(searchContact.toLowerCase()) ||
        (c.phone && c.phone.includes(searchContact)) ||
        c.message.toLowerCase().includes(searchContact.toLowerCase());

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [contacts, searchContact, statusFilter]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      const matchSearch = !searchSub || s.email.toLowerCase().includes(searchSub.toLowerCase());
      const matchVoucher =
        voucherFilter === 'all' ||
        (voucherFilter === 'sent' && s.voucher_sent) ||
        (voucherFilter === 'pending' && !s.voucher_sent);

      return matchSearch && matchVoucher;
    });
  }, [subscribers, searchSub, voucherFilter]);

  const handleUpdateStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    setLoadingId(id);
    try {
      await updateContactStatusAction(id, status);
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn liên hệ này?')) return;
    setLoadingId(id);
    try {
      await deleteContactAction(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa');
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleVoucher = async (id: string, current: boolean) => {
    setLoadingId(id);
    try {
      await toggleVoucherSentAction(id, !current);
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, voucher_sent: !current } : s))
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa email đăng ký này?')) return;
    setLoadingId(id);
    try {
      await deleteSubscriberAction(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa');
    } finally {
      setLoadingId(null);
    }
  };

  const exportSubscribersCSV = () => {
    const headers = ['Email', 'Đã gửi voucher', 'Ngày đăng ký'];
    const rows = filteredSubscribers.map((s) => [
      s.email,
      s.voucher_sent ? 'Đã gửi' : 'Chưa gửi',
      new Date(s.created_at).toLocaleDateString('vi-VN'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const newContactsCount = contacts.filter((c) => c.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Liên hệ & Tiếp thị</h1>
          <p className="text-sm text-slate-400 mt-1">
            Hộp thư góp ý từ khách hàng và danh sách email đăng ký nhận khuyến mãi.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-sm">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Tin nhắn liên hệ
            {newContactsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-600 text-white font-bold">
                {newContactsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'subscribers'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Email nhận tin ({subscribers.length})
          </button>
        </div>
      </div>

      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, sđt, nội dung..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
              {(['all', 'new', 'read', 'replied'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'all'
                    ? 'Tất cả'
                    : st === 'new'
                    ? 'Tin mới'
                    : st === 'read'
                    ? 'Đã đọc'
                    : 'Đã phản hồi'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredContacts.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-sm">
                Không có tin nhắn liên hệ nào.
              </div>
            ) : (
              filteredContacts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMessage(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    item.status === 'new'
                      ? 'bg-slate-900 border-red-500/30 hover:border-red-500/60'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                        item.status === 'new'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.name}</span>
                        {item.status === 'new' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase">
                            Mới
                          </span>
                        )}
                        {item.status === 'replied' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Đã phản hồi
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</span>
                        {item.phone && (
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</span>
                        )}
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 pt-1">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                    {item.status !== 'replied' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'replied')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-medium transition-colors"
                      >
                        Đánh dấu đã trả lời
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteContact(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm theo email đăng ký..."
                value={searchSub}
                onChange={(e) => setSearchSub(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
                {(['all', 'sent', 'pending'] as const).map((vt) => (
                  <button
                    key={vt}
                    onClick={() => setVoucherFilter(vt)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      voucherFilter === vt
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {vt === 'all'
                      ? 'Tất cả'
                      : vt === 'sent'
                      ? 'Đã gửi voucher'
                      : 'Chưa gửi'}
                  </button>
                ))}
              </div>

              <button
                onClick={exportSubscribersCSV}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Xuất CSV
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase font-medium text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Email người đăng ký</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái Voucher Chào mừng</th>
                  <th className="py-3.5 px-4 text-center">Ngày đăng ký</th>
                  <th className="py-3.5 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500 text-sm">
                      Không có email nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" /> {sub.email}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            sub.voucher_sent
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {sub.voucher_sent ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Đã gửi voucher
                            </>
                          ) : (
                            'Chưa gửi voucher'
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                        {new Date(sub.created_at).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleVoucher(sub.id, sub.voucher_sent)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
                        >
                          {sub.voucher_sent ? 'Thu hồi' : 'Đánh dấu đã gửi'}
                        </button>
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Chi tiết tin nhắn liên hệ</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Người gửi:</span>
                  <span className="text-white font-semibold">{selectedMessage.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày gửi:</span>
                  <span className="text-slate-300">{new Date(selectedMessage.created_at).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email:</span>
                  <a href={`mailto:${selectedMessage.email}`} className="text-red-400 hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Số điện thoại:</span>
                  <a href={`tel:${selectedMessage.phone}`} className="text-slate-300 hover:underline">
                    {selectedMessage.phone || 'Không có'}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Nội dung thư:
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Phản hồi từ PCHub về câu hỏi của ${encodeURIComponent(selectedMessage.name)}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi email trả lời
                </a>

                <div className="flex items-center gap-2">
                  {selectedMessage.status !== 'replied' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                    >
                      Đánh dấu đã giải quyết
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteContact(selectedMessage.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
