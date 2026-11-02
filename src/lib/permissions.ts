export type UserRole = 'admin' | 'manager' | 'editor' | 'support' | 'customer';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export const STAFF_ROLES: UserRole[] = ['admin', 'manager', 'editor', 'support'];

export const ROLE_PERMISSIONS: Record<UserRole, {
  dashboard: boolean;
  products: boolean;
  orders: boolean;
  quotes: boolean;
  promotions: boolean;
  posts: boolean;
  reviews: boolean;
  contacts: boolean;
  aiAdvisor: boolean;
  settings: boolean;
  auditLogs: boolean;
}> = {
  admin: {
    dashboard: true,
    products: true,
    orders: true,
    quotes: true,
    promotions: true,
    posts: true,
    reviews: true,
    contacts: true,
    aiAdvisor: true,
    settings: true,
    auditLogs: true,
  },
  manager: {
    dashboard: true,
    products: true,
    orders: true,
    quotes: true,
    promotions: true,
    posts: false,
    reviews: true,
    contacts: true,
    aiAdvisor: false,
    settings: false,
    auditLogs: false,
  },
  editor: {
    dashboard: true,
    products: false,
    orders: false,
    quotes: false,
    promotions: false,
    posts: true,
    reviews: false,
    contacts: false,
    aiAdvisor: false,
    settings: false,
    auditLogs: false,
  },
  support: {
    dashboard: true,
    products: false,
    orders: true,
    quotes: true,
    promotions: false,
    posts: false,
    reviews: true,
    contacts: true,
    aiAdvisor: false,
    settings: false,
    auditLogs: false,
  },
  customer: {
    dashboard: false,
    products: false,
    orders: false,
    quotes: false,
    promotions: false,
    posts: false,
    reviews: false,
    contacts: false,
    aiAdvisor: false,
    settings: false,
    auditLogs: false,
  },
};

export function isStaff(role?: string | null): boolean {
  if (!role) return false;
  return STAFF_ROLES.includes(role as UserRole);
}

export function hasPermission(
  role: UserRole | undefined | null,
  feature: keyof (typeof ROLE_PERMISSIONS)['admin']
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.[feature] ?? false;
}