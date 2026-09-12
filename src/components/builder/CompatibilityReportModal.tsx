'use client';

import React, { useState } from 'react';
import { 
  X, Check, AlertTriangle, AlertCircle, Sparkles, 
  Bot, Zap, Cpu, Layers, Copy, CheckCheck, RefreshCw, ShieldCheck
} from 'lucide-react';
import { CompatibilityReport } from '@/lib/gemini';

interface CompatibilityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CompatibilityReport | null;
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
}

export default function CompatibilityReportModal({
  isOpen,
  onClose,
  report,
  onReanalyze,
  isAnalyzing = false
}: CompatibilityReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const score = report.compatibilityScore ?? 95;
  const isExcellent = score >= 90;
  const isWarning = score >= 70 && score < 90;

  const scoreColor = isExcellent ? '#16a34a' : isWarning ? '#f59e0b' : '#ef4444';
  const scoreBg = isExcellent ? '#f0fdf4' : isWarning ? '#fffbeb' : '#fef2f2';
  const scoreBorder = isExcellent ? '#bbf7d0' : isWarning ? '#fde68a' : '#fecaca';

  const handleCopyReport = () => {
    let text = `=== BÁO CÁO TƯƠNG THÍCH CẤU HÌNH PC — PCHUB AI (GEMINI) ===\n`;
    text += `Điểm tương thích: ${score}/100 [${report.status}]\n`;
    text += `Đánh giá chung: ${report.summary}\n\n`;
    text += `CHI TIẾT KIỂM TRA:\n`;
    report.checklist.forEach(item => {
      text += `• [${item.status}] ${item.category}: ${item.detail}\n`;
    });
    if (report.bottleneck) {
      text += `\nĐÁNH GIÁ NGHẼN CỔ CHAI: ${report.bottleneck.level} - ${report.bottleneck.description}\n`;
    }
    if (report.strengths?.length) {
      text += `\nĐIỂM MẠNH NỔI BẬT:\n` + report.strengths.map(s => `+ ${s}`).join('\n') + '\n';
    }
    if (report.recommendations?.length) {
      text += `\nLỜI KHUYÊN & MẸO LẮP RÁP:\n` + report.recommendations.map(r => `* ${r}`).join('\n') + '\n';
    }
    text += `\nĐược phân tích bởi PCHub AI (Google Gemini)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Báo Cáo Tương Thích & Tối Ưu Cấu Hình
                </h3>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}>
                  Gemini AI
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Phân tích kỹ thuật chi tiết bởi Chuyên gia Hệ thống Phần cứng PCHub
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Top Overview Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}>
            {/* Score box */}
            <div style={{
              background: scoreBg,
              border: `1.5px solid ${scoreBorder}`,
              borderRadius: '14px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ffffff',
                border: `3px solid ${scoreColor}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8' }}>/100</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Độ Tương Thích
                </span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: scoreColor, marginTop: '2px' }}>
                  {isExcellent ? 'Tương thích hoàn hảo' : isWarning ? 'Cần lưu ý một số điểm' : 'Xung đột phần cứng'}
                </div>
              </div>
            </div>

            {/* Wattage & Power box */}
            {report.estimatedWattage && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  flexShrink: 0,
                }}>
                  <Zap size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Công Suất Đỉnh / Nguồn Đề Xuất
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {report.estimatedWattage.peakTdp}W <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>/ Nguồn {report.estimatedWattage.recommendedPsu}W</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Executive Summary */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderLeft: `4px solid ${scoreColor}`,
            borderRadius: '10px',
            padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              <Sparkles size={14} color="#2563eb" />
              <span>Nhận định từ Kỹ Sư Trưởng AI:</span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#1e293b', lineHeight: '1.55', fontWeight: 500 }}>
              {report.summary}
            </p>
          </div>

          {/* Detailed Technical Checklist */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#2563eb" />
              Hạng Mục Kiểm Tra Kỹ Thuật Chi Tiết:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report.checklist.map((item, idx) => {
                const isPass = item.status === 'PASS';
                const isWarn = item.status === 'WARN';
                return (
                  <div
                    key={idx}
                    style={{
                      background: isPass ? '#fcfdfc' : isWarn ? '#fffdfa' : '#fefcfc',
                      border: `1px solid ${isPass ? '#e2e8f0' : isWarn ? '#fde68a' : '#fecaca'}`,
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      padding: '4px',
                      borderRadius: '6px',
                      background: isPass ? '#dcfce7' : isWarn ? '#fef3c7' : '#fee2e2',
                      color: isPass ? '#16a34a' : isWarn ? '#d97706' : '#dc2626',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}>
                      {isPass ? <Check size={14} /> : isWarn ? <AlertTriangle size={14} /> : <AlertCircle size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {item.category}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isPass ? '#dcfce7' : isWarn ? '#fef3c7' : '#fee2e2',
                          color: isPass ? '#15803d' : isWarn ? '#b45309' : '#b91c1c',
                        }}>
                          {isPass ? 'ĐẠT' : isWarn ? 'LƯU Ý' : 'XUNG ĐỘT'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.45' }}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottleneck Analysis */}
          {report.bottleneck && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={15} color="#2563eb" />
                  Đánh giá độ nghẽn cổ chai (Bottleneck):
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                  {report.bottleneck.level}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#1e40af', lineHeight: '1.45' }}>
                {report.bottleneck.description}
              </p>
            </div>
          )}

          {/* Strengths & Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {/* Strengths */}
            {report.strengths && report.strengths.length > 0 && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                  ✓ Điểm Mạnh Cấu Hình
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#15803d', lineHeight: '1.5' }}>
                  {report.strengths.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400e', marginBottom: '8px' }}>
                  💡 Mẹo & Khuyến Nghị Kỹ Thuật
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#b45309', lineHeight: '1.5' }}>
                  {report.recommendations.map((r, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <button
            type="button"
            onClick={handleCopyReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? <CheckCheck size={15} color="#16a34a" /> : <Copy size={15} />}
            {copied ? 'Đã sao chép báo cáo!' : 'Sao chép báo cáo'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onReanalyze && (
              <button
                type="button"
                onClick={onReanalyze}
                disabled={isAnalyzing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#2563eb',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={13} className={isAnalyzing ? 'animate-spin' : ''} />
                Phân tích lại
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
