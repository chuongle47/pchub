'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Crop } from 'lucide-react';

interface AvatarCropperProps {
  imageSrc: string;
  onCropComplete: (base64: string) => void;
  onClose: () => void;
  aspectRatio?: number; // 1 = square, 2 = 2:1 landscape
  title?: string;
}

export default function AvatarCropper({
  imageSrc,
  onCropComplete,
  onClose,
  aspectRatio = 1,
  title = 'Cắt ảnh',
}: AvatarCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Canvas dimensions
  const CANVAS_W = aspectRatio >= 2 ? 480 : 320;
  const CANVAS_H = Math.round(CANVAS_W / aspectRatio);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }, [scale, rotation, offset]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      // Auto-fit image
      const scaleX = CANVAS_W / img.naturalWidth;
      const scaleY = CANVAS_H / img.naturalHeight;
      const autoScale = Math.max(scaleX, scaleY);
      setScale(autoScale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc, CANVAS_W, CANVAS_H]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };
  const handleTouchEnd = () => setIsDragging(false);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);

    // Export canvas as JPEG base64 (strip the "data:image/jpeg;base64," prefix)
    const base64 = canvas.toDataURL('image/jpeg', 0.88).split(',')[1];
    setTimeout(() => {
      setIsProcessing(false);
      onCropComplete(base64);
    }, 100);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '540px',
          width: '100%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        }}
        className="dark:bg-gray-900"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              fontWeight: 700,
              fontSize: '16px',
              color: '#111827',
            }}
            className="dark:text-white"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Canvas */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              borderRadius: aspectRatio === 1 ? '50%' : '12px',
              border: '2px dashed #6366f1',
              maxWidth: '100%',
              display: 'block',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setScale((s) => Math.min(s + 0.1, 5))}
            style={btnStyle}
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.1, 0.2))}
            style={btnStyle}
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            style={btnStyle}
            title="Xoay 90°"
          >
            <RotateCw size={16} />
          </button>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              color: '#6b7280',
              padding: '0 8px',
            }}
          >
            {Math.round(scale * 100)}%
          </span>
          <input
            type="range"
            min={20}
            max={500}
            value={Math.round(scale * 100)}
            onChange={(e) => setScale(parseInt(e.target.value) / 100)}
            style={{ flex: 1, minWidth: '80px', maxWidth: '180px', cursor: 'pointer' }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleCrop}
            disabled={isProcessing}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            <Crop size={15} />
            {isProcessing ? 'Đang xử lý...' : 'Xác nhận cắt'}
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  border: '1px solid #e5e7eb',
  background: '#f9fafb',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#374151',
};
