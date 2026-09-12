import React, { Suspense } from 'react';
import CompareClient from './CompareClient';

export const metadata = {
  title: 'So sánh sản phẩm — Đối chiếu thông số kỹ thuật | PCHub',
  description: 'Công cụ so sánh linh kiện PC thông minh. Đối chiếu thông số kỹ thuật, giá thành giữa các CPU, GPU, RAM, Mainboard.',
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', background: '#f8fafc' }} />}>
      <CompareClient />
    </Suspense>
  );
}
