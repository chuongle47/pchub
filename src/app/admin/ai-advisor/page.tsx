import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AiAdvisorManager, AiSettings, AiConversation } from '@/components/admin/ai-advisor/AiAdvisorManager';

export const revalidate = 0;

export const metadata = {
  title: 'Trợ lý AI & Tương thích | PCHub Admin',
};

export default async function AdminAiAdvisorPage() {
  const supabase = await createClient();

  const [{ data: settings }, { data: conversations }] = await Promise.all([
    supabase.from('ai_settings').select('*').eq('id', 1).single(),
    supabase.from('ai_conversations').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  const defaultSettings: AiSettings = {
    id: 1,
    enabled: true,
    system_prompt:
      'Bạn là chuyên gia tư vấn phần cứng cao cấp của PCHub (pchub.vn).\nNhiệm vụ của bạn là tư vấn cấu hình máy tính, kiểm tra độ tương thích giữa các linh kiện (Socket CPU vs Mainboard, Khe cắm RAM DDR4/DDR5, Công suất nguồn PSU, Kích thước Case & VGA).\nPhong cách: Chuyên nghiệp, khách quan, trung thực, thân thiện, trả lời bằng tiếng Việt gãy gọn, ưu tiên hiệu năng trên giá thành (Price/Performance).\nKhông bao giờ đưa ra lời khuyên sai lệch về nguồn công suất thực và socket vật lý.',
    model: 'gemini-1.5-flash',
    daily_token_limit: 1000000,
    updated_at: new Date().toISOString(),
  };

  return (
    <AiAdvisorManager
      initialSettings={settings || defaultSettings}
      initialConversations={(conversations as AiConversation[]) || []}
    />
  );
}