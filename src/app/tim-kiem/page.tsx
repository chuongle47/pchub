import { redirect } from 'next/navigation';

type Props = { searchParams: Promise<{ q?: string; search?: string }> };

export default async function TimKiemPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || params.search || '';
  redirect(`/search${q ? `?search=${encodeURIComponent(q)}` : ''}`);
}
