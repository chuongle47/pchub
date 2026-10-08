'use client';

import React, { useState, useEffect, useMemo, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Heart, Search, Plus, Sparkles, MessageSquare, 
  Cpu, Layers, Eye, Share2, ThumbsUp, Filter, 
  ArrowUpDown, Check, Bookmark, BookOpen, Clock, 
  User, ArrowRight, X, AlertCircle, Zap, ShieldCheck
} from 'lucide-react';
import { 
  CommunityBuild, CommunityPost, CommunityCategory, NewsCategory,
  INITIAL_COMMUNITY_BUILDS, INITIAL_COMMUNITY_POSTS,
  getStoredCommunityBuilds, getLikedBuildIds, toggleLikeBuildId,
  getSavedCommunityBuildIds, toggleSaveCommunityBuildId, saveCommunityBuild
} from '@/data/community-data';
import { useAuthStore } from '@/lib/store';

const BUILD_CATEGORIES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Tất cả cấu hình' },
  { id: 'Gaming', label: 'Gaming' },
  { id: 'Workstation', label: 'Workstation' },
  { id: 'Streaming', label: 'Streaming' },
  { id: 'Budget', label: 'Budget' },
];

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { id: 'under_20m', label: 'Dưới 20 triệu', min: 0, max: 20000000 },
  { id: '20m_40m', label: '20 – 40 triệu', min: 20000000, max: 40000000 },
  { id: '40m_70m', label: '40 – 70 triệu', min: 40000000, max: 70000000 },
  { id: 'over_70m', label: 'Trên 70 triệu', min: 70000000, max: Infinity },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'most_liked', label: 'Nhiều lượt thích' },
  { id: 'price_asc', label: 'Giá: Thấp đến Cao' },
  { id: 'price_desc', label: 'Giá: Cao đến Thấp' },
];

const NEWS_CATEGORIES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Tất cả bài viết' },
  { id: 'Hướng dẫn build PC', label: 'Hướng dẫn build PC' },
  { id: 'Tin công nghệ', label: 'Tin công nghệ' },
  { id: 'Đánh giá linh kiện', label: 'Đánh giá linh kiện' },
  { id: 'Mẹo & thủ thuật', label: 'Mẹo & thủ thuật' },
];

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function CommunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // URL Query Sync
  const currentTab = searchParams.get('tab') === 'news' ? 'news' : 'builds';
  const currentCategory = searchParams.get('category') || 'ALL';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPriceRange = searchParams.get('priceRange') || 'all';
  const currentNewsCategory = searchParams.get('newsCategory') || 'ALL';

  // State
  const [activeTab, setActiveTab] = useState<'builds' | 'news'>(currentTab);
  const [activeCategory, setActiveCategory] = useState<string>(currentCategory);
  const [searchQuery, setSearchQuery] = useState<string>(currentSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(currentSearch);
  const [selectedSort, setSelectedSort] = useState<string>(currentSort);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(currentPriceRange);
  const [activeNewsCategory, setActiveNewsCategory] = useState<string>(currentNewsCategory);
  
  const [builds, setBuilds] = useState<CommunityBuild[]>(INITIAL_COMMUNITY_BUILDS);
  const [posts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [likedBuildIds, setLikedBuildIds] = useState<string[]>([]);
  const [savedBuildIds, setSavedBuildIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Quick Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: '',
    category: 'Gaming' as CommunityCategory,
    description: '',
    cpu: '',
    gpu: '',
    ram: '',
    mainboard: '',
    ssd: '',
    psu: '',
    case: '',
    cooler: '',
    price: '',
  });
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const authUser = useAuthStore(s => s.user);

  // Read stored builds & likes on client mount
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setBuilds(getStoredCommunityBuilds());
      setLikedBuildIds(getLikedBuildIds());
      setSavedBuildIds(getSavedCommunityBuildIds());
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync state to URL Query
  const updateQueryParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'ALL' || value === 'all' || (key === 'tab' && value === 'builds') || (key === 'sort' && value === 'newest')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `/community?${queryString}` : '/community', { scroll: false });
    });
  };

  const handleTabChange = (tab: 'builds' | 'news') => {
    setActiveTab(tab);
    updateQueryParams({ tab: tab === 'news' ? 'news' : null });
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    updateQueryParams({ category: cat });
  };

  const handlePriceRangeChange = (rangeId: string) => {
    setSelectedPriceRange(rangeId);
    updateQueryParams({ priceRange: rangeId });
  };

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
    updateQueryParams({ sort: sortId });
  };

  const handleNewsCategoryChange = (cat: string) => {
    setActiveNewsCategory(cat);
    updateQueryParams({ newsCategory: cat });
  };

  // Like Toggle
  const handleToggleLike = (e: React.MouseEvent, buildId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const result = toggleLikeBuildId(buildId);
    if (result.isLiked) {
      setLikedBuildIds(prev => [...prev, buildId]);
      setBuilds(prev => prev.map(b => b.id === buildId ? { ...b, likes: b.likes + 1 } : b));
    } else {
      setLikedBuildIds(prev => prev.filter(id => id !== buildId));
      setBuilds(prev => prev.map(b => b.id === buildId ? { ...b, likes: Math.max(0, b.likes - 1) } : b));
    }
  };

  // Save/Bookmark Toggle
  const handleToggleSave = (e: React.MouseEvent, buildId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const isSaved = toggleSaveCommunityBuildId(buildId);
    if (isSaved) {
      setSavedBuildIds(prev => [...prev, buildId]);
      showToast('Đã lưu cấu hình vào danh sách yêu thích!');
    } else {
      setSavedBuildIds(prev => prev.filter(id => id !== buildId));
      showToast('Đã bỏ lưu cấu hình');
    }
  };

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Open in Build PC
  const handleLoadCommunityBuild = (e: React.MouseEvent, b: CommunityBuild) => {
    e.stopPropagation();
    e.preventDefault();
    const preset = {
      title: b.title,
      budgetLabel: formatVND(b.price),
      components: {
        cpu: b.parts.cpu.name,
        gpu: b.parts.gpu.name,
        ram: b.parts.ram.name,
        mainboard: b.parts.mainboard?.name,
        storage: b.parts.ssd?.name,
        psu: b.parts.psu?.name,
        case: b.parts.case?.name,
        cooling: b.parts.cooler?.name,
      }
    };
    try {
      localStorage.setItem('pchub_pending_ai_preset', JSON.stringify(preset));
    } catch (err) {
      console.error('Failed to save pending community preset:', err);
    }
    router.push('/build-pc');
  };

  // Filtered Builds
  const filteredBuilds = useMemo(() => {
    let list = [...builds];

    // Filter by Category
    if (activeCategory !== 'ALL') {
      list = list.filter(b => b.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Filter by Search Query
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.name.toLowerCase().includes(q) ||
        b.parts.cpu.name.toLowerCase().includes(q) ||
        b.parts.gpu.name.toLowerCase().includes(q) ||
        b.parts.ram.name.toLowerCase().includes(q) ||
        (b.parts.mainboard && b.parts.mainboard.name.toLowerCase().includes(q)) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Filter by Price Range
    const priceConfig = PRICE_RANGES.find(p => p.id === selectedPriceRange);
    if (priceConfig && priceConfig.id !== 'all') {
      list = list.filter(b => b.price >= priceConfig.min && b.price <= priceConfig.max);
    }

    // Sort
    if (selectedSort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (selectedSort === 'most_liked') {
      list.sort((a, b) => b.likes - a.likes);
    } else if (selectedSort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [builds, activeCategory, debouncedSearch, selectedPriceRange, selectedSort]);

  // Filtered News
  const filteredPosts = useMemo(() => {
    let list = [...posts];
    if (activeNewsCategory !== 'ALL') {
      list = list.filter(p => p.category === activeNewsCategory);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [posts, activeNewsCategory, debouncedSearch]);

  // Submit Modal Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!submitForm.title.trim()) {
      errors.title = 'Vui lòng nhập tên cấu hình PC';
    }
    if (!submitForm.cpu.trim()) {
      errors.cpu = 'Vui lòng nhập tên CPU';
    }
    if (!submitForm.gpu.trim()) {
      errors.gpu = 'Vui lòng nhập tên Card đồ họa (GPU)';
    }
    if (!submitForm.ram.trim()) {
      errors.ram = 'Vui lòng nhập dung lượng & bus RAM';
    }
    if (!submitForm.description.trim()) {
      errors.description = 'Vui lòng viết vài dòng chia sẻ về cấu hình';
    }

    const priceNum = parseInt(submitForm.price.replace(/\D/g, '')) || 0;
    if (priceNum <= 0) {
      errors.price = 'Vui lòng nhập ước tính tổng giá tiền (VD: 25000000)';
    }

    if (Object.keys(errors).length > 0) {
      setSubmitErrors(errors);
      return;
    }

    setSubmitErrors({});

    const newBuild: CommunityBuild = {
      id: `custom-${Date.now()}`,
      slug: submitForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: submitForm.title,
      category: submitForm.category,
      image: '/images/hero-pc.jpg',
      author: {
        name: authUser?.name || 'Thành viên PCHub',
        avatar: (authUser?.name || 'T').charAt(0).toUpperCase(),
        role: 'Community Member',
      },
      parts: {
        cpu: { name: submitForm.cpu, price: Math.round(priceNum * 0.25), specs: 'Hiệu năng cao' },
        gpu: { name: submitForm.gpu, price: Math.round(priceNum * 0.45), specs: 'Chiến game đỉnh cao' },
        ram: { name: submitForm.ram, price: Math.round(priceNum * 0.08), specs: 'Dual Channel' },
        mainboard: { name: submitForm.mainboard || 'Bo mạch chủ tương thích', price: Math.round(priceNum * 0.1) },
        ssd: { name: submitForm.ssd || 'SSD NVMe M.2 1TB', price: Math.round(priceNum * 0.05) },
        psu: { name: submitForm.psu || 'Nguồn 650W - 850W Bronze/Gold', price: Math.round(priceNum * 0.04) },
        case: { name: submitForm.case || 'Vỏ case thoáng khí', price: Math.round(priceNum * 0.03) },
        cooler: { name: submitForm.cooler || 'Tản nhiệt tháp hiệu năng cao', price: Math.round(priceNum * 0.02) },
      },
      price: priceNum,
      performanceNote: `💡 Cấu hình ${submitForm.category} do cộng đồng chia sẻ, tối ưu cho nhu cầu làm việc và giải trí mượt mà.`,
      fpsBenchmarks: [
        { game: 'Valorant / CS2', res1080p: 280, res1440p: 190, res4k: 110, settings: 'High' },
        { game: 'Cyberpunk 2077', res1080p: 110, res1440p: 75, res4k: 45, settings: 'Ultra DLSS' },
        { game: 'Black Myth: Wukong', res1080p: 90, res1440p: 62, res4k: 38, settings: 'High' },
      ],
      powerConsumption: {
        idleWatt: 50,
        loadWatt: 380,
        recommendedPsuWatt: 750,
      },
      aiCompatibility: {
        status: 'compatible',
        score: 98,
        socketMatch: true,
        socketInfo: 'Hệ thống kiểm tra các linh kiện đã lựa chọn ăn khớp chuẩn socket.',
        psuAdequate: true,
        psuInfo: 'Công suất nguồn đề xuất đáp ứng đủ tải tối đa.',
        clearanceOk: true,
        clearanceInfo: 'Chiều dài card đồ họa và kích thước case phù hợp.',
        coolerOk: true,
        coolerInfo: 'Tản nhiệt đảm bảo kiểm soát tốt nhiệt độ khi vận hành.',
        summary: 'Cấu hình đã được AI kiểm tra sơ bộ và đạt chuẩn tương thích.',
      },
      aiVerified: true,
      likes: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'approved',
      description: submitForm.description,
      tags: [submitForm.category, 'Community Build', 'PCHub 2026'],
    };

    saveCommunityBuild(newBuild);
    setBuilds(prev => [newBuild, ...prev]);
    setSubmitSuccess(true);

    setTimeout(() => {
      setSubmitSuccess(false);
      setIsSubmitModalOpen(false);
      setSubmitForm({
        title: '',
        category: 'Gaming',
        description: '',
        cpu: '',
        gpu: '',
        ram: '',
        mainboard: '',
        ssd: '',
        psu: '',
        case: '',
        cooler: '',
        price: '',
      });
      showToast('🎉 Đăng cấu hình thành công!');
    }, 1500);
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '36px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Toast Notification */}
        {copiedToast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <Check size={16} color="#22c55e" />
            <span>{copiedToast}</span>
          </div>
        )}

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(37, 99, 235, 0.1)',
            color: '#2563eb',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <Sparkles size={14} /> PCHub Hub & Cộng Đồng Phần Cứng
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.5px' }}>
            Cộng Đồng & Tri Thức PC
          </h1>
          <p style={{ fontSize: '14.5px', color: '#64748b', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Khám phá hàng trăm bộ PC cấu hình chuẩn được chia sẻ và thẩm định bởi AI, cùng kho kiến thức hướng dẫn chuyên sâu từ chuyên gia phần cứng.
          </p>
        </div>

        {/* Top 2 Main Navigation Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '28px',
        }}>
          <button
            type="button"
            onClick={() => handleTabChange('builds')}
            style={{
              padding: '12px 20px',
              fontSize: '15.5px',
              fontWeight: 800,
              color: activeTab === 'builds' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'builds' ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            🖥️ Cấu hình cộng đồng ({builds.length})
          </button>
          
          <button
            type="button"
            onClick={() => handleTabChange('news')}
            style={{
              padding: '12px 20px',
              fontSize: '15.5px',
              fontWeight: 800,
              color: activeTab === 'news' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'news' ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            📰 Tin tức & Hướng dẫn ({posts.length})
          </button>
        </div>

        {/* ======================= TAB 1: BUILDS ======================= */}
        {activeTab === 'builds' && (
          <div>
            {/* Filter Bar & Action Controls */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px 20px',
              marginBottom: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Row 1: Search + Share Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <input
                    type="text"
                    placeholder="Tìm theo tên build, tác giả, CPU (i9, Ryzen 7), GPU (RTX 4070)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Tìm kiếm cấu hình PC"
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13.5px',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Xóa từ khóa tìm kiếm"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Sort Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Sắp xếp:</span>
                    <select
                      value={selectedSort}
                      onChange={(e) => handleSortChange(e.target.value)}
                      aria-label="Sắp xếp danh sách cấu hình"
                      style={{
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Share Build Button */}
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 18px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Plus size={16} />
                    Đăng build của bạn
                  </button>
                </div>
              </div>

              {/* Row 2: Category Chips + Price Filter */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '14px'
              }}>
                {/* Category Pills (Horizontal scroll on mobile) */}
                <div className="touch-scroll-row no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {BUILD_CATEGORIES.map(cat => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '9999px',
                          fontSize: '13px',
                          fontWeight: isActive ? 700 : 600,
                          border: '1.5px solid',
                          background: isActive ? '#2563eb' : '#ffffff',
                          color: isActive ? '#ffffff' : '#475569',
                          borderColor: isActive ? '#2563eb' : '#e2e8f0',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                          boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.2)' : 'none'
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Price Range Pills */}
                <div className="touch-scroll-row no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>Khoảng giá:</span>
                  {PRICE_RANGES.map(p => {
                    const isSelected = selectedPriceRange === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePriceRangeChange(p.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: isSelected ? 700 : 500,
                          background: isSelected ? '#eff6ff' : 'transparent',
                          color: isSelected ? '#1d4ed8' : '#64748b',
                          border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s'
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Skeleton Loading State */}
            {isLoading ? (
              <div className="home-grid-3">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    height: '460px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ height: '200px', background: '#e2e8f0', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ width: '40%', height: '16px', background: '#e2e8f0', borderRadius: '4px' }} />
                    <div style={{ width: '80%', height: '24px', background: '#e2e8f0', borderRadius: '4px' }} />
                    <div style={{ height: '60px', background: '#f1f5f9', borderRadius: '8px' }} />
                    <div style={{ marginTop: 'auto', height: '36px', background: '#e2e8f0', borderRadius: '8px' }} />
                  </div>
                ))}
              </div>
            ) : filteredBuilds.length === 0 ? (
              /* Empty State */
              <div style={{
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '16px',
                padding: '60px 24px',
                textAlign: 'center',
                margin: '20px 0'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#94a3b8'
                }}>
                  <Search size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Chưa có cấu hình phù hợp với bộ lọc
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '460px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                  Thử tìm kiếm với từ khóa khác hoặc xóa bớt tiêu chí lọc khoảng giá/danh mục để xem thêm cấu hình.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('ALL');
                    setSelectedPriceRange('all');
                    setSelectedSort('newest');
                    updateQueryParams({ category: null, search: null, priceRange: null, sort: null });
                  }}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Đặt lại tất cả bộ lọc
                </button>
              </div>
            ) : (
              /* 3-COLUMNS BUILDS GRID */
              <div className="home-grid-3">
                {filteredBuilds.map(b => {
                  const isLiked = likedBuildIds.includes(b.id);
                  const isSaved = savedBuildIds.includes(b.id);

                  return (
                    <div 
                      key={b.id} 
                      onClick={() => router.push(`/community/builds/${b.id}`)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                      }}
                    >
                      {/* Image Preview Box */}
                      <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                        <img 
                          src={b.image} 
                          alt={`Cấu hình PC ${b.title}`}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        />
                        
                        {/* Top Badges */}
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            background: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(6px)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            letterSpacing: '0.3px',
                          }}>
                            {b.category}
                          </span>
                          
                          {b.aiVerified && (
                            <span style={{
                              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 6px rgba(37,99,235,0.4)'
                            }}>
                              <Sparkles size={11} />
                              AI Pick
                            </span>
                          )}
                        </div>

                        {/* Interactive Buttons (Heart & Bookmark) */}
                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                          <button 
                            type="button"
                            onClick={(e) => handleToggleSave(e, b.id)}
                            title={isSaved ? 'Bỏ lưu' : 'Lưu vào danh sách'}
                            aria-label="Lưu cấu hình"
                            style={{
                              background: 'rgba(255,255,255,0.92)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '34px',
                              height: '34px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              transition: 'transform 0.15s'
                            }}
                          >
                            <Bookmark size={16} color={isSaved ? '#2563eb' : '#64748b'} fill={isSaved ? '#2563eb' : 'none'} />
                          </button>

                          <button 
                            type="button"
                            onClick={(e) => handleToggleLike(e, b.id)}
                            title={isLiked ? 'Bỏ thích' : 'Thích cấu hình'}
                            aria-label="Thích cấu hình"
                            style={{
                              background: 'rgba(255,255,255,0.92)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '34px',
                              height: '34px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              transition: 'transform 0.15s'
                            }}
                          >
                            <Heart size={16} color={isLiked ? '#ef4444' : '#64748b'} fill={isLiked ? '#ef4444' : 'none'} />
                          </button>
                        </div>

                        {/* Status tag if pending */}
                        {b.status === 'pending' && (
                          <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '12px',
                            background: '#fef3c7',
                            color: '#b45309',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px'
                          }}>
                            ⏳ Đang chờ duyệt
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        
                        {/* Author & Stats Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              fontSize: '12px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {b.author.avatar}
                            </div>
                            <span style={{ fontSize: '12.5px', color: '#64748b' }}>by <strong style={{ color: '#0f172a' }}>{b.author.name}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Heart size={13} color={isLiked ? '#ef4444' : '#94a3b8'} fill={isLiked ? '#ef4444' : 'none'} />
                              {b.likes}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MessageSquare size={13} color="#94a3b8" />
                              {b.commentsCount}
                            </span>
                          </div>
                        </div>

                        {/* Build Title */}
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', lineHeight: '1.35' }}>
                          {b.title}
                        </h3>

                        {/* Core Specs Snapshot */}
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          fontSize: '12.5px',
                          color: '#475569',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          marginBottom: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 700 }}>CPU</span>
                            <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.parts.cpu.name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 700 }}>GPU</span>
                            <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.parts.gpu.name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 700 }}>RAM</span>
                            <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.parts.ram.name}
                            </span>
                          </div>
                        </div>

                        {/* Performance Evaluation Callout */}
                        <div style={{
                          background: '#eff6ff',
                          border: '1px solid #dbeafe',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          fontSize: '12px',
                          color: '#1e40af',
                          lineHeight: '1.45',
                          marginBottom: '16px',
                        }}>
                          <div style={{ fontWeight: 800, color: '#1d4ed8', marginBottom: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Zap size={12} /> Đánh giá hiệu năng:
                          </div>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {b.performanceNote}
                          </div>
                        </div>

                        {/* Price & Actions Row */}
                        <div style={{
                          marginTop: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '14px',
                          borderTop: '1px solid #f1f5f9',
                          gap: '10px'
                        }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>TỔNG CHI PHÍ</div>
                            <span style={{ fontSize: '17px', fontWeight: 900, color: '#2563eb' }}>
                              {formatVND(b.price)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={(e) => handleLoadCommunityBuild(e, b)}
                              title="Tải cấu hình vào công cụ Build PC"
                              style={{
                                background: '#f1f5f9',
                                color: '#334155',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background 0.15s'
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
                            >
                              <Layers size={13} />
                              Build
                            </button>

                            <Link
                              href={`/community/builds/${b.id}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Chi tiết →
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 2: NEWS & GUIDES ======================= */}
        {activeTab === 'news' && (
          <div>
            {/* News Filter Bar */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              {/* Category Filter Pills */}
              <div className="touch-scroll-row no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                {NEWS_CATEGORIES.map(cat => {
                  const isActive = activeNewsCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleNewsCategoryChange(cat.id)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 600,
                        border: '1.5px solid',
                        background: isActive ? '#2563eb' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                        borderColor: isActive ? '#2563eb' : '#e2e8f0',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar for News */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                <input
                  type="text"
                  placeholder="Tìm bài viết, hướng dẫn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 14px 8px 34px',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                />
                <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            {/* News Articles Grid */}
            <div className="home-grid-3">
              {filteredPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/community/news/${post.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <article style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.07)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                  >
                    {/* Cover Image */}
                    <div style={{ height: '200px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                      <img 
                        src={post.cover} 
                        alt={post.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(37, 99, 235, 0.9)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '6px'
                      }}>
                        {post.category}
                      </span>
                      <span style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={11} /> {post.readingMinutes} phút đọc
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <span>bởi {post.author.name}</span>
                      </div>

                      <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', lineHeight: '1.4', marginBottom: '10px' }}>
                        {post.title}
                      </h2>

                      <p style={{
                        fontSize: '13px',
                        color: '#64748b',
                        lineHeight: '1.6',
                        marginBottom: '16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {post.excerpt}
                      </p>

                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <span style={{ color: '#2563eb', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          Đọc tiếp <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ======================= QUICK SUBMIT MODAL ======================= */}
      {isSubmitModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              aria-label="Đóng biểu mẫu chia sẻ build"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px' }}>
                Cộng đồng PCHub
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '8px 0 4px' }}>
                Chia Sẻ Cấu Hình PC Của Bạn
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                Đóng góp cấu hình tâm đắc của bạn để cộng đồng cùng đánh giá và nhận tư vấn tối ưu từ AI.
              </p>
            </div>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Check size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Đăng Cấu Hình Thành Công!
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Cấu hình của bạn đã được lưu và hiển thị trên tab Cấu hình cộng đồng.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Build Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Tên cấu hình PC *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: White Beast 2K 144Hz, Cấu hình Render 3D 2026..."
                    value={submitForm.title}
                    onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: submitErrors.title ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none'
                    }}
                  />
                  {submitErrors.title && (
                    <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                      {submitErrors.title}
                    </span>
                  )}
                </div>

                {/* Category & Total Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Mục đích / Danh mục *
                    </label>
                    <select
                      value={submitForm.category}
                      onChange={e => setSubmitForm({ ...submitForm, category: e.target.value as CommunityCategory })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        background: '#fff'
                      }}
                    >
                      <option value="Gaming">Gaming</option>
                      <option value="Workstation">Workstation (Đồ họa/Render)</option>
                      <option value="Streaming">Streaming</option>
                      <option value="Budget">Budget (Tiết kiệm)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Ước tính tổng giá (VNĐ) *
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 25.000.000"
                      value={submitForm.price}
                      onChange={e => setSubmitForm({ ...submitForm, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: submitErrors.price ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                    />
                    {submitErrors.price && (
                      <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                        {submitErrors.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Core Components */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      CPU (Bộ vi xử lý) *
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Intel Core i5-14600K / Ryzen 5 7600"
                      value={submitForm.cpu}
                      onChange={e => setSubmitForm({ ...submitForm, cpu: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: submitErrors.cpu ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    {submitErrors.cpu && (
                      <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                        {submitErrors.cpu}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      VGA (Card đồ họa) *
                    </label>
                    <input
                      type="text"
                      placeholder="VD: RTX 4070 12GB / RX 6600"
                      value={submitForm.gpu}
                      onChange={e => setSubmitForm({ ...submitForm, gpu: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: submitErrors.gpu ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    {submitErrors.gpu && (
                      <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                        {submitErrors.gpu}
                      </span>
                    )}
                  </div>
                </div>

                {/* RAM & Mainboard */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      RAM (Bộ nhớ trong) *
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 32GB (2x16GB) DDR5 6000MHz"
                      value={submitForm.ram}
                      onChange={e => setSubmitForm({ ...submitForm, ram: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: submitErrors.ram ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    {submitErrors.ram && (
                      <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                        {submitErrors.ram}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Mainboard (Bo mạch chủ)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: ASUS B760M / MSI B650"
                      value={submitForm.mainboard}
                      onChange={e => setSubmitForm({ ...submitForm, mainboard: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Trải nghiệm & mô tả chi tiết *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Chia sẻ lý do chọn cấu hình, nhiệt độ khi chơi game, khả năng nâng cấp..."
                    value={submitForm.description}
                    onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: submitErrors.description ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  {submitErrors.description && (
                    <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                      {submitErrors.description}
                    </span>
                  )}
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={15} />
                    Xác nhận & Đăng cấu hình
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b' }}>
        Đang tải chuyên mục Cộng đồng PCHub...
      </div>
    }>
      <CommunityContent />
    </Suspense>
  );
}
