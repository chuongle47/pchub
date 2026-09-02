'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './auth';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  slug: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  inStock?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, qty = 1) => set(state => {
        const exists = state.items.find(i => i.product.id === product.id);
        if (exists) {
          return {
            items: state.items.map(i =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
            )
          };
        }
        return { items: [...state.items, { product, quantity: qty }] };
      }),
      removeItem: (id) => set(state => ({
        items: state.items.filter(i => i.product.id !== id)
      })),
      updateQty: (id, qty) => set(state => ({
        items: qty <= 0
          ? state.items.filter(i => i.product.id !== id)
          : state.items.map(i => i.product.id === id ? { ...i, quantity: qty } : i)
      })),
      clearCart: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'pchub-cart' }
  )
);

interface WishlistStore {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set(state => ({
        ids: state.ids.includes(id)
          ? state.ids.filter(i => i !== id)
          : [...state.ids, id]
      })),
      has: (id) => get().ids.includes(id),
    }),
    { name: 'pchub-wishlist' }
  )
);

interface UIStore {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIStore>(set => ({
  isChatOpen: false,
  setChatOpen: isChatOpen => set({ isChatOpen }),
  quickViewProduct: null,
  setQuickViewProduct: quickViewProduct => set({ quickViewProduct }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: isMobileMenuOpen => set({ isMobileMenuOpen }),
  searchQuery: '',
  setSearchQuery: searchQuery => set({ searchQuery }),
}));

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      setUser: user => set({ user }),
      logout: () => {
        set({ user: null });
        document.cookie = 'pchub-user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'pchub-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'nks_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
      },
    }),
    { name: 'pchub-auth' }
  )
);

export type ComponentSlot = 'cpu' | 'gpu' | 'ram' | 'mainboard' | 'ssd' | 'psu' | 'case' | 'cooler' | 'monitor';

interface BuilderStore {
  slots: Record<ComponentSlot, Product | null>;
  setSlot: (slot: ComponentSlot, product: Product | null) => void;
  clearBuild: () => void;
  totalPrice: () => number;
  purpose: 'gaming' | 'office' | 'render' | 'streaming' | null;
  setPurpose: (purpose: BuilderStore['purpose']) => void;
  budget: number;
  setBudget: (budget: number) => void;
  step: number;
  setStep: (step: number) => void;
}

const emptySlots = (): Record<ComponentSlot, Product | null> => ({
  cpu: null, gpu: null, ram: null, mainboard: null, ssd: null,
  psu: null, case: null, cooler: null, monitor: null,
});

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  slots: emptySlots(),
  setSlot: (slot, product) => set(state => ({ slots: { ...state.slots, [slot]: product } })),
  clearBuild: () => set({ slots: emptySlots() }),
  totalPrice: () => Object.values(get().slots).reduce((sum, product) => sum + (product?.price ?? 0), 0),
  purpose: null,
  setPurpose: purpose => set({ purpose }),
  budget: 25000000,
  setBudget: budget => set({ budget }),
  step: 1,
  setStep: step => set({ step }),
}));

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'shipping' | 'delivered' | 'cancelled';
  statusLabel: string;
  total: number;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    note?: string;
  };
  shippingFee: number;
  paymentMethod: string;
  paymentMethodLabel: string;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [
        {
          id: 'ORD-20260820-0089',
          date: '20/08/2026',
          status: 'shipping',
          statusLabel: 'Đang giao',
          total: 25379000,
          products: [
            { id: 'p1', name: 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng, 36MB Cache, LGA 1700)', price: 13990000, image: '/images/cpu-box.jpg', quantity: 1 }
          ],
          shippingAddress: { name: 'Khách hàng PCHub', phone: '0901234567', email: 'khachhang@gmail.com', address: '123 Đường Nguyễn Trãi', province: 'Hồ Chí Minh', district: 'Quận 1', ward: 'Bến Thành' },
          shippingFee: 30000,
          paymentMethod: 'vnpay',
          paymentMethodLabel: 'VNPay — QR / ATM / Visa'
        }
      ],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      setOrders: (orders) => set({ orders }),
    }),
    { name: 'pchub-orders' }
  )
);
