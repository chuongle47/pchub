'use client';

import AIChatWidget from '@/components/layout/AIChatWidget';
import CompareFloatingBar from '@/components/layout/CompareFloatingBar';
import FloatingContactButtons from '@/components/layout/FloatingContactButtons';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIChatWidget />
      <CompareFloatingBar />
      <FloatingContactButtons />
    </>
  );
}
