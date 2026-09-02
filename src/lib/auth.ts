export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'member' | 'admin' | 'staff';
  avatar?: string;
}

export function normalizeUser(rawUser: any): User | null {
  if (!rawUser || typeof rawUser !== 'object') return null;

  const name = rawUser.name ?? rawUser.full_name ?? rawUser.username ?? rawUser.email ?? 'Khách hàng';
  const email = rawUser.email ?? rawUser.username ?? '';
  const id = String(rawUser.id ?? rawUser.user_id ?? rawUser.member_id ?? rawUser.username ?? rawUser.email ?? '1');

  return {
    id,
    name,
    email,
    phone: rawUser.phone ?? rawUser.phone_number ?? undefined,
    role: rawUser.role === 'admin' ? 'admin' : rawUser.role === 'staff' ? 'staff' : 'member',
    avatar: rawUser.avatar ?? rawUser.avatar_url ?? undefined,
  };
}

function decodeUserCookie(value?: string): User | null {
  if (!value) return null;

  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded);
    return normalizeUser(parsed);
  } catch {
    // Fallback for the previous base64-encoded format used on login.
  }

  try {
    const binary = Buffer.from(value, 'base64').toString('binary');
    const encoded = Array.from(binary, character => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join('');
    const parsed = JSON.parse(decodeURIComponent(encoded));
    return normalizeUser(parsed);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    if (typeof window !== 'undefined') return null;
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const directUser = cookieStore.get('pchub-user')?.value;
    const directResult = decodeUserCookie(directUser);
    if (directResult) return directResult;

    const legacyUser = cookieStore.get('pchub-token')?.value;
    const legacyResult = decodeUserCookie(legacyUser);
    if (legacyResult) return legacyResult;

    return null;
  } catch {
    return null;
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function isStaff(user: User | null): boolean {
  return user?.role === 'staff' || user?.role === 'admin';
}