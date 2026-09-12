import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xây dựng cấu hình PC & Kiểm tra tương thích AI | PCHub',
  description: 'Công cụ tự xây dựng cấu hình PC chuyên nghiệp với hệ thống AI kiểm tra tương thích Socket, RAM DDR4/DDR5 và công suất nguồn thời gian thực.',
  keywords: ['build pc', 'xay dung cau hinh pc', 'lap rap pc', 'kiem tra tuong thich', 'pchub'],
};

export default function BuildPcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
