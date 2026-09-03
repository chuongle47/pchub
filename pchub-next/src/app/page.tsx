export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '48px', color: '#2563eb', marginBottom: '20px' }}>Hello World!</h1>
      <p style={{ fontSize: '24px', color: '#333' }}>PCHub deployment test</p>
      <p style={{ fontSize: '16px', color: '#666', marginTop: '20px' }}>
        Nếu bạn thấy trang này, Next.js đang hoạt động trên Vercel!
      </p>
      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <p>Test successful: ✅</p>
        <p>Build completed successfully</p>
        <p>Runtime working: ✅</p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/test" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          Test Page (/test)
        </a>
      </div>
    </div>
  );
}
