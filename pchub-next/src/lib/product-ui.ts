export function summarizeSpecs(specs: unknown, fallback = ''): string {
  if (!specs || typeof specs !== 'object') return fallback;
  const parts = Object.entries(specs as Record<string, unknown>)
    .slice(0, 4)
    .map(([, value]) => (Array.isArray(value) ? value.join(', ') : String(value)))
    .filter(Boolean);
  return parts.join(' · ') || fallback;
}

export function formatVnd(price: number): string {
  return Number(price || 0).toLocaleString('vi-VN') + '₫';
}
