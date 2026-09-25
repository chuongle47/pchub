'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, User, CheckCircle2, 
  Phone, ShieldCheck, Clock, HelpCircle, ThumbsUp, 
  Search, Headset, ChevronDown, Check
} from 'lucide-react';

export interface QAItem {
  id: string;
  authorName: string;
  authorPhoneOrEmail?: string;
  question: string;
  createdAt: string;
  category?: 'compatibility' | 'warranty' | 'shipping' | 'general';
  likes: number;
  answer?: {
    staffName: string;
    staffRole: string;
    content: string;
    answeredAt: string;
  };
}

interface ProductQASectionProps {
  productId: string;
  productName: string;
  categoryName?: string;
  brandName?: string;
}

export default function ProductQASection({
  productId,
  productName,
  categoryName = 'Linh kiện',
  brandName = 'Chính hãng',
}: ProductQASectionProps) {
  // Form State
  const [authorName, setAuthorName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<'all' | 'compatibility' | 'warranty' | 'shipping'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  // Default seed questions tailored to the product
  const defaultQuestions: QAItem[] = [
    {
      id: `qa-seed-1-${productId}`,
      authorName: 'Trần Hoàng Long',
      question: `Sản phẩm ${productName} này có được bảo hành chính hãng tại Việt Nam không và thời gian bao lâu vậy shop?`,
      createdAt: '2 ngày trước',
      category: 'warranty',
      likes: 14,
      answer: {
        staffName: 'Lê Minh Tuấn',
        staffRole: 'Chuyên viên Kỹ thuật PCHub',
        content: `Chào bạn Long, sản phẩm ${productName} được bảo hành chính hãng 36 tháng 1 đổi 1 trong 30 ngày đầu nếu phát sinh lỗi từ nhà sản xuất. Bạn có thể mang đến bất kỳ showroom nào của PCHub hoặc gửi về trung tâm bảo hành hãng trên toàn quốc nhé!`,
        answeredAt: '1 ngày trước',
      },
    },
    {
      id: `qa-seed-2-${productId}`,
      authorName: 'Đặng Minh Quân',
      question: `Dàn máy của mình đang dùng nguồn 650W chuẩn 80 Plus Bronze thì có lắp và vận hành ổn định được ${productName} không shop?`,
      createdAt: '3 ngày trước',
      category: 'compatibility',
      likes: 9,
      answer: {
        staffName: 'Nguyễn Quốc Bảo',
        staffRole: 'Kỹ sư Hệ thống PCHub',
        content: `Chào bạn Quân, bộ nguồn 650W hoàn toàn đủ công suất để vận hành sản phẩm này cùng cấu hình phổ thông. Tuy nhiên nếu bạn có ép xung (OC) hoặc dùng kèm nhiều ổ cứng, bạn có thể cân nhắc lên nguồn 750W để đạt dải hiệu suất mát nhất nhé!`,
        answeredAt: '2 ngày trước',
      },
    },
    {
      id: `qa-seed-3-${productId}`,
      authorName: 'Vũ Thanh Hằng',
      question: `PCHub có dịch vụ giao hàng hỏa tốc trong 2 giờ và hỗ trợ kỹ thuật viên đến tận nhà lắp ráp không ạ?`,
      createdAt: '5 ngày trước',
      category: 'shipping',
      likes: 7,
      answer: {
        staffName: 'Trần Thảo Vy',
        staffRole: 'Trưởng nhóm CSKH PCHub',
        content: `Chào bạn Hằng, PCHub hỗ trợ Giao hàng Hỏa tốc trong 2H tại nội thành Hà Nội và TP.HCM. Đội ngũ kỹ thuật viên của PCHub cũng sẵn sàng hỗ trợ lắp đặt, đi dây gọn gàng và test tương thích tận nơi cho khách hàng ạ!`,
        answeredAt: '4 ngày trước',
      },
    },
  ];

  const [questions, setQuestions] = useState<QAItem[]>(defaultQuestions);

  // Load persisted user questions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`pchub-qa-${productId}`);
      if (stored) {
        const parsed: QAItem[] = JSON.parse(stored);
        setQuestions([...parsed, ...defaultQuestions]);
      }
    } catch (e) {
      console.error('Error loading QA from localStorage:', e);
    }
  }, [productId]);

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || !contactInfo.trim() || !questionContent.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại/Email và nội dung câu hỏi!');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newQA: QAItem = {
        id: `qa-${Date.now()}`,
        authorName: authorName.trim(),
        authorPhoneOrEmail: contactInfo.trim(),
        question: questionContent.trim(),
        createdAt: 'Vừa xong',
        category: 'compatibility',
        likes: 0,
        answer: {
          staffName: 'Kỹ thuật viên PCHub',
          staffRole: 'Trực kỹ thuật 24/7',
          content: `Chào bạn ${authorName.trim()}, PCHub đã tiếp nhận thắc mắc của bạn về "${productName}". Chuyên viên kỹ thuật phụ trách sẽ liên hệ qua ${contactInfo.trim()} trong vòng 5-15 phút để tư vấn chuẩn xác nhất cho bạn nhé!`,
          answeredAt: 'Vừa xong',
        },
      };

      const updated = [newQA, ...questions];
      setQuestions(updated);

      try {
        const userQuestions = updated.filter(q => !q.id.startsWith('qa-seed'));
        localStorage.setItem(`pchub-qa-${productId}`, JSON.stringify(userQuestions));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }

      setQuestionContent('');
      setSuccessNotice(`Cảm ơn bạn ${authorName}! Câu hỏi đã được gửi thành công. Nhân viên kỹ thuật PCHub sẽ phản hồi ngay!`);
      setIsSubmitting(false);

      setTimeout(() => setSuccessNotice(null), 5000);
    }, 600);
  };

  const handleToggleLike = (id: string) => {
    if (likedIds.includes(id)) {
      setLikedIds(prev => prev.filter(i => i !== id));
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, likes: Math.max(0, q.likes - 1) } : q));
    } else {
      setLikedIds(prev => [...prev, id]);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, likes: q.likes + 1 } : q));
    }
  };

  // Filtering
  const filteredQuestions = questions.filter(q => {
    if (selectedTag !== 'all' && q.category !== selectedTag) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      return (
        q.question.toLowerCase().includes(qLower) ||
        (q.answer && q.answer.content.toLowerCase().includes(qLower)) ||
        q.authorName.toLowerCase().includes(qLower)
      );
    }
    return true;
  });

  return (
    <section
      id="product-qa"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '28px',
        marginBottom: '40px',
        scrollMarginTop: '100px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header Section */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '20px',
        marginBottom: '24px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(37, 99, 235, 0.25)',
            }}>
              <MessageSquare size={18} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Hỏi & Đáp Về Sản Phẩm
            </h2>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              background: '#dcfce7',
              color: '#15803d',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
              Nhân viên trực 24/7
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Thắc mắc về tương thích chân cắm, hiệu năng hoặc dịch vụ? Hãy để lại câu hỏi để được Kỹ thuật viên PCHub hỗ trợ nhanh nhất!
          </p>
        </div>

        {/* Quick Contact Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="tel:19008888"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              color: '#1d4ed8',
              fontSize: '12.5px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Phone size={14} />
            <span>Hotline: 1900 8888</span>
          </a>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#475569',
            fontSize: '12.5px',
            fontWeight: 600,
          }}>
            <Clock size={14} color="#16a34a" />
            <span>Phản hồi: ~5-15 phút</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '13.5px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Interactive Ask Question Form */}
      <form
        onSubmit={handleSubmitQuestion}
        style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '28px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={16} color="#2563eb" />
          <span>Đặt câu hỏi mới về sản phẩm này:</span>
        </div>

        {/* Textarea for question */}
        <textarea
          rows={3}
          value={questionContent}
          onChange={e => setQuestionContent(e.target.value)}
          placeholder={`Nhập câu hỏi của bạn về ${productName} (Ví dụ: Sản phẩm này có gắn vừa case của mình không? Nguồn bao nhiêu W là tối ưu?...)`}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '13.5px',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            color: '#0f172a',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: '14px',
          }}
          required
        />

        {/* User Info Fields & Submit Button */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '12px',
          alignItems: 'center',
        }}>
          <input
            type="text"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="Họ và tên của bạn *"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            required
          />

          <input
            type="text"
            value={contactInfo}
            onChange={e => setContactInfo(e.target.value)}
            placeholder="Số điện thoại hoặc Email để nhận giải đáp *"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 3px 8px rgba(37, 99, 235, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            <Send size={14} />
            <span>{isSubmitting ? 'Đang gửi...' : 'Gửi câu hỏi'}</span>
          </button>
        </div>

        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color="#16a34a" />
          <span>Thông tin số điện thoại / email của bạn được bảo mật tuyệt đối và chỉ dùng để nhân viên kỹ thuật hỗ trợ.</span>
        </div>
      </form>

      {/* Filter and Search Bar for Existing Q&As */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedTag === 'all' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedTag === 'all' ? '#2563eb' : '#f8fafc',
              color: selectedTag === 'all' ? '#ffffff' : '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Tất cả ({questions.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTag('compatibility')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedTag === 'compatibility' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedTag === 'compatibility' ? '#2563eb' : '#f8fafc',
              color: selectedTag === 'compatibility' ? '#ffffff' : '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Tương thích & Cấu hình
          </button>

          <button
            type="button"
            onClick={() => setSelectedTag('warranty')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedTag === 'warranty' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedTag === 'warranty' ? '#2563eb' : '#f8fafc',
              color: selectedTag === 'warranty' ? '#ffffff' : '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Bảo hành & Đổi trả
          </button>

          <button
            type="button"
            onClick={() => setSelectedTag('shipping')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedTag === 'shipping' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedTag === 'shipping' ? '#2563eb' : '#f8fafc',
              color: selectedTag === 'shipping' ? '#ffffff' : '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Giao hàng 2H
          </button>
        </div>

        {/* Search Input */}
        <div style={{
          position: 'relative',
          minWidth: '220px',
        }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi..."
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Q&A List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(item => (
            <div
              key={item.id}
              style={{
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
                padding: '18px',
                background: '#ffffff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
              }}
            >
              {/* Question Row */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  Q
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{item.authorName}</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>• {item.createdAt}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: 600, lineHeight: '1.45' }}>
                    {item.question}
                  </p>
                </div>
              </div>

              {/* Staff Answer Box */}
              {item.answer && (
                <div style={{
                  marginLeft: '44px',
                  background: '#f8fafc',
                  borderLeft: '3px solid #2563eb',
                  borderRadius: '0 10px 10px 0',
                  padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{item.answer.staffName}</strong>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: '#eff6ff',
                        color: '#2563eb',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid #bfdbfe',
                      }}>
                        {item.answer.staffRole}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.answer.answeredAt}</span>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.55' }}>
                    {item.answer.content}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleLike(item.id)}
                      style={{
                        background: likedIds.includes(item.id) ? '#eff6ff' : 'transparent',
                        border: 'none',
                        color: likedIds.includes(item.id) ? '#2563eb' : '#64748b',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <ThumbsUp size={12} />
                      <span>Hữu ích ({item.likes})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '36px 20px',
            color: '#64748b',
            background: '#f8fafc',
            borderRadius: '12px',
          }}>
            <MessageSquare size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Chưa tìm thấy câu hỏi phù hợp</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Hãy là người đầu tiên đặt câu hỏi về sản phẩm này ở khung phía trên!</p>
          </div>
        )}
      </div>
    </section>
  );
}
