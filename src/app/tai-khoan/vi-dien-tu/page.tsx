'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectWalletPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tai-khoan');
  }, [router]);

  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
      Đang chuyển hướng về Trung tâm tài khoản...
    </div>
  );
}
