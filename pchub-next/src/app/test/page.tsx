export default function TestPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '48px', color: '#16a34a', marginBottom: '20px' }}>Test Page</h1>
      <p style={{ fontSize: '24px', color: '#333' }}>This is a test page</p>
      <p style={{ fontSize: '16px', color: '#666', marginTop: '20px' }}>
        If you see this, routing is working!
      </p>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}