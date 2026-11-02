import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export default async function ProductRoute({ params }: Props) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}
