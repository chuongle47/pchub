'use client';

import { useState } from 'react';

export default function InitUsersPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInit = async () => {
    setLoading(true);
    setStatus('Đang khởi tạo bảng users...');
    
    try {
      const response = await fetch('/api/init-db', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        setStatus('✅ ' + result.message);
      } else {
        setStatus('❌ ' + result.error);
      }
    } catch (error) {
      setStatus('❌ Lỗi kết nối: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Khởi tạo bảng Users</h1>
      <p style={{ marginBottom: '20px' }}>
        Nhấn nút bên dưới để tạo bảng users trong Supabase database.
      </p>
      
      <button 
        onClick={handleInit}
        disabled={loading}
        style={{
          padding: '12px 24px',
          background: loading ? '#ccc' : '#0055d4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Đang xử lý...' : 'Khởi tạo bảng Users'}
      </button>
      
      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: status.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          color: status.includes('✅') ? '#155724' : '#721c24'
        }}>
          {status}
        </div>
      )}
    </div>
  );
}