'use client';

import { useState, useEffect } from 'react';

export default function DebugDbPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/db-status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        setStatus({ error: err.message });
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Database Status Debug</h1>
      
      {loading && <p>Đang kiểm tra kết nối database...</p>}
      
      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          background: status.db_connected ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          color: status.db_connected ? '#155724' : '#721c24'
        }}>
          <h3>Database Status:</h3>
          <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <h3>Test Product API:</h3>
        <button 
          onClick={() => fetch('/api/products?limit=5').then(res => res.json()).then(console.log)}
          style={{ padding: '10px 20px', background: '#0055d4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Test Products API
        </button>
      </div>
    </div>
  );
}