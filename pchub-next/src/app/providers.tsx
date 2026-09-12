'use client';

import AIChatWidget from '@/components/layout/AIChatWidget';

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}<AIChatWidget /></>;
}
