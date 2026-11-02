'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sliders,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Share2,
  Eye,
  Check,
  X,
  Play,
  Cpu,
} from 'lucide-react';
import {
  createCompatRuleAction,
  updateCompatRuleAction,
  deleteCompatRuleAction,
  moderateCommunityBuildAction,
} from '@/lib/actions/admin-quotes';

interface CompatRule {
  id: string;
  rule_type: string;
  source_category: string;
  target_category: string;
  config: any;
  is_active: boolean;
}

interface CommunityBuild {
  id: string;
  title: string;
  author_name: string | null;
  total_price: number;
  status: string;
  likes_count: number;
  created_at: string;
  items: any;
}

interface Props {
  rules: CompatRule[];
  builds: CommunityBuild[];
  products: any[];
}

export function CompatRulesManager({ rules, builds, products }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'rules' | 'simulator' | 'community'>('simulator');

  // Simulator state
  const [selectedCpu, setSelectedCpu] = useState('');
  const [selectedMain, setSelectedMain] = useState('');
  const [selectedRam, setSelectedRam] = useState('');
  const [selectedGpu, setSelectedGpu] = useState('');
  const [selectedPsu, setSelectedPsu] = useState('');
  const [simResult, setSimResult] = useState<{
    compatible: boolean;
    issues: string[];
    passed: string[];
  } | null>(null);

  // Filter products by category for simulator
  const cpus = products.filter((p) => p.category?.slug === 'cpu');
  const mains = products.filter((p) => p.category?.slug === 'mainboard');
  const rams = products.filter((p) => p.category?.slug === 'ram');
  const gpus = products.filter((p) => p.category?.slug === 'gpu');
  const psus = products.filter((p) => p.category?.slug === 'psu');

  const runSimulation = () => {
    const issues: string[] = [];
    const passed: string[] = [];

    const cpu = cpus.find((p) => p.id === selectedCpu);
    const main = mains.find((p) => p.id === selectedMain);
    const ram = rams.find((p) => p.id === selectedRam);
    const gpu = gpus.find((p) => p.id === selectedGpu);
    const psu = psus.find((p) => p.id === selectedPsu);

    // 1. Check CPU - Mainboard Socket
    if (cpu && main) {
      const cpuSocket = cpu.specs?.socket;
      const mainSocket = main.specs?.socket;
      if (cpuSocket && mainSocket) {
        if (cpuSocket.toLowerCase() === mainSocket.toLowerCase()) {
          passed.push(`Socket tương thích hoàn hảo: ${cpuSocket}`);
        } else {
          issues.push(`Xung đột Socket: CPU (${cpuSocket}) KHÔNG gắn được vào Mainboard (${mainSocket})!`);
        }
      }
    }

    // 2. Check RAM - Mainboard standard
    if (main && ram) {
      const mainRamType = main.specs?.ram_type;
      const ramType = ram.specs?.ram_type;
      if (mainRamType && ramType) {
        if (mainRamType.toLowerCase() === ramType.toLowerCase()) {
          passed.push(`Chuẩn RAM tương thích: ${ramType}`);
        } else {
          issues.push(`Xung đột chuẩn RAM: Mainboard yêu cầu ${mainRamType} nhưng RAM bạn chọn là ${ramType}!`);
        }
      }
    }

    // 3. Check GPU - PSU Wattage
    if (gpu && psu) {
      const minPsu = Number(gpu.specs?.recommended_psu || 0);
      const psuWatt = Number(psu.specs?.wattage || 0);
      if (minPsu > 0 && psuWatt > 0) {
        if (psuWatt >= minPsu) {
          passed.push(`Công suất nguồn đáp ứng tốt: PSU ${psuWatt}W >= Đề xuất ${minPsu}W cho VGA`);
        } else {
          issues.push(`Nguồn không đủ công suất: VGA yêu cầu tối thiểu ${minPsu}W nhưng nguồn chỉ có ${psuWatt}W!`);
        }
      }
    }

    if (issues.length === 0 && passed.length === 0) {
      issues.push('Vui lòng chọn ít nhất CPU và Mainboard để kiểm tra tương thích.');
    }

    setSimResult({
      compatible: issues.length === 0,
      issues,
      passed,
    });
  };

  const handleModerateBuild = async (id: string, status: 'approved' | 'hidden') => {
    try {
      await moderateCommunityBuildAction(id, status);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi duyệt cấu hình');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Bộ Luật Tương Thích & Build PC Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quy tắc kiểm tra tự động giữa CPU - Mainboard - RAM - GPU - Nguồn và duyệt cấu hình cộng đồng
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'simulator'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Kiểm tra thử cấu hình (Simulator)</span>
        </button>

        <button
          onClick={() => setTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'rules'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Danh sách bộ luật ({rules.length})</span>
        </button>

        <button
          onClick={() => setTab('community')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'community'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Cấu hình cộng đồng ({builds.length})</span>
        </button>
      </div>

      {/* TAB 1: SIMULATOR */}
      {tab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Chọn cấu hình kiểm tra</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">1. Vi xử lý (CPU)</label>
              <select
                value={selectedCpu}
                onChange={(e) => setSelectedCpu(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">-- Chọn CPU --</option>
                {cpus.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.specs?.socket || 'N/A'}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">2. Bo mạch chủ (Mainboard)</label>
              <select
                value={selectedMain}
                onChange={(e) => setSelectedMain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">-- Chọn Mainboard --</option>
                {mains.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.specs?.socket || 'N/A'} - {p.specs?.ram_type || 'RAM'}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">3. Bộ nhớ trong (RAM)</label>
              <select
                value={selectedRam}
                onChange={(e) => setSelectedRam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">-- Chọn RAM --</option>
                {rams.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.specs?.ram_type || 'N/A'}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">4. Card đồ họa (VGA)</label>
              <select
                value={selectedGpu}
                onChange={(e) => setSelectedGpu(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">-- Chọn VGA --</option>
                {gpus.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [Khuyên dùng nguồn: {p.specs?.recommended_psu || 'N/A'}W]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">5. Nguồn máy tính (PSU)</label>
              <select
                value={selectedPsu}
                onChange={(e) => setSelectedPsu(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">-- Chọn Nguồn --</option>
                {psus.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.specs?.wattage || 'N/A'}W]
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={runSimulation}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chạy kiểm tra tương thích AI</span>
            </button>
          </div>

          {/* Simulator Result */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Kết quả đánh giá tương thích
            </h2>

            {simResult ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl flex items-center gap-3 ${
                    simResult.compatible
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {simResult.compatible ? (
                    <CheckCircle className="w-6 h-6 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 flex-shrink-0 text-rose-400" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {simResult.compatible ? 'CẤU HÌNH TƯƠNG THÍCH 100%' : 'PHÁT HIỆN XUNG ĐỘT PHẦN CỨNG!'}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">
                      {simResult.compatible
                        ? 'Các linh kiện hoạt động mượt mà, đồng bộ socket và đủ nguồn.'
                        : 'Không thể lắp đặt cấu hình này do sai lệch chuẩn kỹ thuật.'}
                    </div>
                  </div>
                </div>

                {simResult.passed.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-emerald-400">Điểm tương thích đạt:</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {simResult.passed.map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {simResult.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-rose-400">Cảnh báo lỗi:</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {simResult.issues.map((err, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <X className="w-3.5 h-3.5 text-rose-400 mt-0.5" />
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Chọn linh kiện ở bảng bên trái và bấm "Chạy kiểm tra tương thích AI" để xem báo cáo.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RULES LIST */}
      {tab === 'rules' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Loại luật</th>
                <th className="p-4">Áp dụng giữa</th>
                <th className="p-4">Mô tả quy tắc</th>
                <th className="p-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white font-mono text-xs">{r.rule_type}</td>
                  <td className="p-4 text-blue-400 font-semibold uppercase">
                    {r.source_category} ⟷ {r.target_category}
                  </td>
                  <td className="p-4 text-slate-300">
                    {r.config?.description || JSON.stringify(r.config)}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Đang bật
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: COMMUNITY BUILDS */}
      {tab === 'community' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Tên cấu hình</th>
                <th className="p-4">Tác giả</th>
                <th className="p-4">Tổng chi phí</th>
                <th className="p-4 text-center">Lượt thích</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {builds.length > 0 ? (
                builds.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-white">{b.title}</td>
                    <td className="p-4 text-slate-300">{b.author_name || 'Khách vãng lai'}</td>
                    <td className="p-4 font-bold text-amber-400">
                      {Number(b.total_price).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="p-4 text-center text-slate-400">{b.likes_count}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {b.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status !== 'approved' && (
                          <button
                            onClick={() => handleModerateBuild(b.id, 'approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                          >
                            Duyệt
                          </button>
                        )}
                        {b.status !== 'hidden' && (
                          <button
                            onClick={() => handleModerateBuild(b.id, 'hidden')}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-semibold text-[11px]"
                          >
                            Ẩn
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Chưa có cấu hình PC cộng đồng nào chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}