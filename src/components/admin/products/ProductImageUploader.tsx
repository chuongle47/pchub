'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Star, Link as LinkIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ProductImageUploader({ images, onChange }: ImageUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} vượt quá dung lượng tối đa 5MB.`);
        }

        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          newUrls.push(publicUrlData.publicUrl);
        }
      }

      onChange([...images, ...newUrls]);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi upload ảnh.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddExternalUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlModal(false);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([target, ...filtered]);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-xs"
          >
            <img
              src={url}
              alt={`Ảnh sản phẩm ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Badge Ảnh Đại Diện */}
            {idx === 0 && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-sm">
                Ảnh chính
              </span>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {idx !== 0 && (
                <button
                  type="button"
                  onClick={() => handleSetMain(idx)}
                  className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-amber-500 shadow-sm"
                  title="Đặt làm ảnh đại diện"
                >
                  <Star className="w-4 h-4 fill-amber-400" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload drop button */}
        <label className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition-all text-slate-500 hover:text-blue-600 p-4 text-center">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-1" />
              <span className="text-[11px] font-medium text-slate-600">Đang tải lên...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mb-1 text-slate-400 group-hover:text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">Tải ảnh lên</span>
              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP</span>
            </>
          )}
        </label>
      </div>

      {/* Button to add image via URL */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowUrlModal(!showUrlModal)}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Hoặc chèn link ảnh từ URL ngoài</span>
        </button>
      </div>

      {showUrlModal && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddExternalUrl}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            Thêm
          </button>
        </div>
      )}
    </div>
  );
}
