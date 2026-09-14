import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== CART STORE ====================
export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  brand?: string; // Fix lỗi TS2353 'brand'
  quantity: number;
  image?: string;
  slug?: string;
  product?: any;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  total: () => number; // Fix lỗi TS2349: This expression is not callable (Type 'Number')
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  addMultipleItems: (items: (Omit<CartItem, 'quantity'> & { quantity?: number })[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  setOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      addItem: (item) => {
        const existingItem = get().items.find((i) => i.id === item.id);
        const qtyToAdd = item.quantity || 1;
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: qtyToAdd }] });
        }
      },

      addMultipleItems: (newItems) => {
        const currentItems = [...get().items];
        newItems.forEach((item) => {
          const qtyToAdd = item.quantity || 1;
          const idx = currentItems.findIndex((i) => i.id === item.id);
          if (idx >= 0) {
            currentItems[idx] = {
              ...currentItems[idx],
              quantity: currentItems[idx].quantity + qtyToAdd,
            };
          } else {
            currentItems.push({
              ...item,
              quantity: qtyToAdd,
            });
          }
        });
        set({ items: currentItems });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
        }
      },

      updateQty: (id, quantity) => {
        get().updateQuantity(id, quantity);
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().total();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      count: () => {
        return get().getItemCount();
      },

      setOpen: (open) => set({ isOpen: open }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    { name: 'pchub-cart' }
  )
);
// ==================== AUTH STORE ====================
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
  cccd?: string;
  cccd_issue_date?: string;
  cccd_issue_place?: string;
  cccd_front_image?: string;
  cccd_back_image?: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        document.cookie =
          'pchub-user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie =
          'pchub-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie =
          'nks_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('pchub-profile-extra');
        window.location.href = '/login';
      },
    }),
    { name: 'pchub-auth' }
  )
);

// ==================== BUILDER STORE ====================
export interface BuilderProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  type?: string;
  image?: string;
  slug?: string;
  socket?: string;
  ramType?: string;
  power?: number;
  wattage?: number;
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
        case: null,
      },
      setSlot: (slot, product) => {
        set({
          slots: {
            ...get().slots,
            [slot]: product,
          },
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
            case: null,
          },
        });
      },
      totalPrice: () => {
        return Object.values(get().slots).reduce((total, product) => {
          return total + (product?.price || 0);
        }, 0);
      },
    }),
    { name: 'pchub-builder' }
  )
);

// ==================== UI STORE ====================
interface UIStore {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isCartOpen: false,
  openCart: () => {
    set({ isCartOpen: true });
    useCartStore.getState().setOpen(true);
  },
  closeCart: () => {
    set({ isCartOpen: false });
    useCartStore.getState().setOpen(false);
  },
  toggleCart: () => {
    const currentCartOpen = useCartStore.getState().isOpen;
    const nextState = !currentCartOpen;
    set({ isCartOpen: nextState });
    useCartStore.getState().setOpen(nextState);
  },
  isChatOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open }),
}));

// ==================== WISHLIST STORE ====================
interface WishlistStore {
  ids: string[];
  addWishlist: (id: string) => void;
  removeWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  toggle: (id: string) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      addWishlist: (id) => set({ ids: [...get().ids, id] }),
      removeWishlist: (id) =>
        set({ ids: get().ids.filter((item) => item !== id) }),
      toggleWishlist: (id) => {
        const exists = get().ids.includes(id);
        if (exists) {
          get().removeWishlist(id);
        } else {
          get().addWishlist(id);
        }
      },
      toggle: (id) => {
        get().toggleWishlist(id);
      },
    }),
    { name: 'pchub-wishlist' }
  )
);

// ==================== ORDER STORE ====================
interface OrderStore {
  orders: any[];
  addOrder: (order: any) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
    }),
    { name: 'pchub-orders' }
  )
);

// ==================== COMPARE STORE ====================
export interface ToggleCompareResult {
  success: boolean;
  categoryMismatch?: boolean;
  switchedCategory?: boolean;
  notice?: string;
  activeCategory?: string | null;
}

export function getCompareCategoryKey(cat?: string | null): string {
  if (!cat) return '';
  const c = cat.toLowerCase().trim();
  if (c.includes('cpu') || c.includes('vi xử lý') || c.includes('intel') || c.includes('ryzen') || c === 'cpu') return 'cpu';
  if (c.includes('vga') || c.includes('gpu') || c.includes('card màn hình') || c.includes('card đồ họa') || c.includes('geforce') || c.includes('radeon') || c === 'vga') return 'vga';
  if (c.includes('ram') || c.includes('bộ nhớ') || c === 'ram') return 'ram';
  if (c.includes('main') || c.includes('bo mạch') || c.includes('motherboard') || c === 'mainboard') return 'mainboard';
  if (c.includes('ssd') || c.includes('hdd') || c.includes('ổ đĩa') || c.includes('ổ cứng') || c.includes('cứng') || c.includes('storage') || c === 'storage') return 'storage';
  if (c.includes('psu') || c.includes('nguồn') || c.includes('power supply') || c === 'psu') return 'psu';
  if (c.includes('case') || c.includes('vỏ') || c.includes('thùng máy') || c === 'case') return 'case';
  if (c.includes('tản') || c.includes('cooling') || c.includes('cooler') || c === 'cooling') return 'cooling';
  if (c.includes('màn') || c.includes('monitor') || c === 'monitor') return 'monitor';
  return c;
}

interface CompareStore {
  items: string[];
  activeCategory: string | null;
  activeCategoryKey: string | null;
  addCompare: (slug: string, categoryName?: string, alternateId?: string, forceSwitch?: boolean) => ToggleCompareResult;
  removeCompare: (slug: string, alternateId?: string) => void;
  toggleCompare: (slug: string, categoryName?: string, alternateId?: string, forceSwitch?: boolean) => ToggleCompareResult;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      activeCategory: null,
      activeCategoryKey: null,

      addCompare: (slug, categoryName, alternateId, forceSwitch = false) => {
        const currentItems = get().items;
        const catName = categoryName ? categoryName.trim() : null;
        const incomingKey = getCompareCategoryKey(catName);

        // If already in list by slug or alternateId
        const alreadyExists = currentItems.includes(slug) || (alternateId ? currentItems.includes(alternateId) : false);
        if (alreadyExists) {
          return { success: true, notice: 'Sản phẩm đã có trong danh sách so sánh' };
        }

        const currentActiveKey = get().activeCategoryKey || getCompareCategoryKey(get().activeCategory);

        // Enforce same category constraint if list already has items
        if (currentItems.length > 0 && currentActiveKey && incomingKey && currentActiveKey !== incomingKey) {
          if (forceSwitch) {
            set({
              items: [slug],
              activeCategory: catName,
              activeCategoryKey: incomingKey,
            });
            return {
              success: true,
              switchedCategory: true,
              notice: `Đã chuyển sang so sánh danh mục "${catName || 'mới'}"`,
            };
          }

          return {
            success: false,
            categoryMismatch: true,
            activeCategory: get().activeCategory,
            notice: `Chỉ được so sánh các sản phẩm trong cùng danh mục (${get().activeCategory || 'hiện tại'})`,
          };
        }

        // Append to compare list up to 4 items
        if (currentItems.length < 4) {
          const newItems = [...currentItems, slug];
          const newCatName = get().activeCategory || catName;
          const newCatKey = currentActiveKey || incomingKey;
          set({
            items: newItems,
            activeCategory: newCatName,
            activeCategoryKey: newCatKey,
          });
          return {
            success: true,
            notice: `Đã thêm sản phẩm vào danh sách so sánh (${newItems.length}/4)`,
          };
        }

        return {
          success: false,
          notice: 'Danh sách so sánh đã đạt tối đa 4 sản phẩm',
        };
      },

      removeCompare: (slug, alternateId) => {
        const remaining = get().items.filter(
          (item) => item !== slug && (alternateId ? item !== alternateId : true)
        );
        set({
          items: remaining,
          activeCategory: remaining.length === 0 ? null : get().activeCategory,
          activeCategoryKey: remaining.length === 0 ? null : get().activeCategoryKey,
        });
      },

      toggleCompare: (slug, categoryName, alternateId, forceSwitch = false) => {
        const exists = get().items.includes(slug) || (alternateId ? get().items.includes(alternateId) : false);
        if (exists) {
          get().removeCompare(slug, alternateId);
          return { success: true, notice: 'Đã bỏ sản phẩm khỏi so sánh' };
        } else {
          return get().addCompare(slug, categoryName, alternateId, forceSwitch);
        }
      },

      clearCompare: () => {
        set({ items: [], activeCategory: null, activeCategoryKey: null });
      },
    }),
    { name: 'pchub-compare' }
  )
);