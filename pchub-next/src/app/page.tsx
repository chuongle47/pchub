import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PCHub — Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
  description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
};

export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>PCHub - Đang tải...</h1>
      <p style={{ fontSize: '16px', color: '#666' }}>Nếu bạn thấy trang này, nghĩa là ứng dụng đã chạy thành công!</p>
      <div style={{ marginTop: '30px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <p>Environment Variables Status:</p>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Đã cấu hình' : '❌ Thiếu'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Đã cấu hình' : '❌ Thiếu'}</p>
        <p>DATABASE_URL: {process.env.DATABASE_URL ? '✅ Đã cấu hình' : '❌ Thiếu'}</p>
      </div>
    </div>
  );
}
