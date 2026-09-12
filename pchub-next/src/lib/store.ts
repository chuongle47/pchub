import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
  category?: string;
  brand?: string;
  originalPrice?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setOpen: (open: boolean) => set({ isOpen: open }),

      addItem: (item) => {
        const existingItem = get().items.find(i => i.id === item.id);
        if (existingItem) {
          set({
            items: get().items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map(i =>
              i.id === id ? { ...i, quantity } : i
            )
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    { name: 'pchub-cart' }
  )
);

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'member' | 'admin' | 'staff';
  avatar?: string;
  firstname?: string;
  lastname?: string;
  dob?: string;
  gender?: number;
}

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
        localStorage.removeItem('pchub-profile-extra');
        // Keep nks_saved_accounts and nks_last_user_email for quick login
        window.location.href = '/login';
      },
    }),
    { name: 'pchub-auth' }
  )
);

export interface BuilderProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  slug?: string;
  socket?: string;
  ramType?: string;
  power?: number;
}

interface BuilderStore {
  slots: Record<string, BuilderProduct | null>;
  setSlot: (slot: string, product: BuilderProduct | null) => void;
  clearBuild: () => void;
  totalPrice: () => number;
}

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      slots: {
        cpu: null,
        mainboard: null,
        ram: null,
        gpu: null,
        storage: null,
        psu: null,
        case: null
      },

      setSlot: (slot, product) => {
        set({
          slots: {
            ...get().slots,
            [slot]: product
          }
        });
      },

      clearBuild: () => {
        set({
          slots: {
            cpu: null,
            mainboard: null,
            ram: null,
            gpu: null,
            storage: null,
            psu: null,
            case: null
          }
        });
      },

      totalPrice: () => {
        return Object.values(get().slots).reduce((total, product) => {
          return total + (product?.price || 0);
        }, 0);
      }
    }),
    { name: 'pchub-builder' }
  )
);

// UI Store for UI state management
interface UIStore {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  set => ({
    isChatOpen: false,
    setChatOpen: (open: boolean) => set({ isChatOpen: open })
  })
);

// Wishlist Store for wishlist management
interface WishlistStore {
  ids: string[];
  toggle: (id: string) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id: string) => {
        const currentIds = get().ids;
        if (currentIds.includes(id)) {
          set({ ids: currentIds.filter(i => i !== id) });
        } else {
          set({ ids: [...currentIds, id] });
        }
      }
    }),
    { name: 'pchub-wishlist' }
  )
);

// Order Store for order management
export interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  shippingFee: number;
  products: OrderProduct[];
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    note?: string;
  };
  paymentMethodLabel: string;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order: Order) => {
        set({ orders: [...get().orders, order] });
      }
    }),
    { name: 'pchub-orders' }
  )
);