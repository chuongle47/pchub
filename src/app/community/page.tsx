'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, Search, Plus, Sparkles, MessageSquare, 
  Cpu, Layers, Eye, Share2, ThumbsUp 
} from 'lucide-react';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'builds' | 'news'>('builds');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState<Record<string, number>>({ b1: 142, b2: 98, b3: 230 });

  const builds = [
    {
      id: 'b1',
      title: 'Project Neon: 4K Gaming Monster',
      author: 'AlexH',
      authorAvatar: 'A',
      category: 'Gaming',
      badge: 'Gaming',
      badgeColor: '#2563eb',
      image: '/images/build-neon.jpg',
      cpu: 'i9-14900K',
      gpu: 'RTX 4090',
      price: '$3,450',
      isAiPick: false
    },
    {
      id: 'b2',
      title: 'Silent Render Node - 3D/Video Edit',
      author: 'StudioPro',
      authorAvatar: 'S',
      category: 'Workstation',
      badge: 'Workstation',
      badgeColor: '#475569',
      image: '/images/hero-pc.jpg',
      cpu: 'Ryzen 9 7950X',
      ram: '128GB DDR5',
      price: '$2,890',
      isAiPick: true
    },
    {
      id: 'b3',
      title: '1080p Sweet Spot Build',
      author: 'TomC',
      authorAvatar: 'T',
      category: 'Budget',
      badge: 'Budget',
      badgeColor: '#16a34a',
      image: '/images/gpu-white.jpg',
      cpu: 'i5-13400F',
      gpu: 'RTX 4060',
      price: '$850',
      isAiPick: false
    }
  ];

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', minHeight: '100vh', padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Cộng đồng & Nội dung
          </h1>
          <p style={{ fontSize: '14.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            Khám phá các cấu hình chia sẻ từ cộng đồng và đọc những bài viết hướng dẫn, đánh giá mới nhất về phần cứng PC.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', borderBottom: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <button
            onClick={() => setActiveTab('builds')}
            style={{
              padding: '12px 16px',
              fontSize: '15px',
              fontWeight: 700,
              color: activeTab === 'builds' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'builds' ? '3px solid #2563eb' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🖥️ Cấu hình cộng đồng
          </button>
          
          <button
            onClick={() => setActiveTab('news')}
            style={{
              padding: '12px 16px',
              fontSize: '15px',
              fontWeight: 700,
              color: activeTab === 'news' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'news' ? '3px solid #2563eb' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Tin tức & Hướng dẫn
          </button>
        </div>

        {/* Filter Controls Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Categories Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'Gaming', 'Workstation', 'Streaming'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid',
                  background: activeCategory === cat ? '#0055d4' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#475569',
                  borderColor: activeCategory === cat ? '#0055d4' : '#e2e8f0',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search + Share Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Tìm kiếm cấu hình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '9px 14px 9px 36px',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '13px',
                  width: '240px',
                  outline: 'none',
                  background: '#fff'
                }}
              />
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            <button style={{
              background: '#0055d4',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}>
              <Plus size={16} />
              Chia sẻ build
            </button>
          </div>
        </div>

        {/* 3-COLUMNS COMMUNITY BUILDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {builds.map(b => (
            <div key={b.id} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Image Preview Box */}
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={b.image} 
                  alt={b.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Badge Category */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                  <span style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {b.badge}
                  </span>
                  {b.isAiPick && (
                    <span style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Sparkles size={11} />
                      AI Pick
                    </span>
                  )}
                </div>

                {/* Heart wishlist */}
                <button style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <Heart size={16} color="#ef4444" />
                </button>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                
                {/* Author row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {b.authorAvatar}
                  </div>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>by <strong style={{ color: '#0f172a' }}>{b.author}</strong></span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', lineHeight: '1.3' }}>
                  {b.title}
                </h3>

                {/* Key Specs Table */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  color: '#475569',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>CPU</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{b.cpu}</span>
                  </div>
                  {b.gpu && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>GPU</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{b.gpu}</span>
                    </div>
                  )}
                  {b.ram && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>RAM</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{b.ram}</span>
                    </div>
                  )}
                </div>

                {/* Price & Details */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb' }}>
                    {b.price}
                  </span>

                  <Link 
                    href="/build-pc"
                    style={{
                      background: '#f1f5f9',
                      color: '#0f172a',
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Xem chi tiết
                  </Link>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
