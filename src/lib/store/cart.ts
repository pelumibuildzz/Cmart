import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  businessId: string;
  stock: number;
}

interface CartStore {
  userId: string | null;
  items: CartItem[];
  setUserId: (id: string | null) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getBusinessItems: (businessId: string) => CartItem[];
  getBusinessTotal: (businessId: string) => number;
  clearBusinessItems: (businessId: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      userId: null,
      items: [],
      
      setUserId: (id: string | null) => {
        set({ userId: id });
        if (!id) {
          // Clear cart when user signs out
          set({ items: [] });
        }
      },

      addItem: (item) => {
        if (!get().userId) {
          // Don't allow adding items without authentication
          return;
        }

        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            if (existingItem.quantity >= existingItem.stock) {
              return state;
            }
            return {
              items: state.items.map((i) =>
                i.id === item.id 
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
                  : i
              ),
            };
          }
          return { 
            items: [...state.items, { ...item, quantity: 1 }]
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { 
                  ...item, 
                  quantity: Math.max(1, Math.min(quantity, item.stock))
                }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getBusinessItems: (businessId) => {
        return get().items.filter(item => item.businessId === businessId);
      },

      getBusinessTotal: (businessId) => {
        const items = get().getBusinessItems(businessId);
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      clearBusinessItems: (businessId) =>
        set((state) => ({
          items: state.items.filter(item => item.businessId !== businessId),
        })),
    }),
    {
      name: 'cart-storage',
      // Only persist cart if there's a userId
      partialize: (state) => 
        state.userId ? state : { ...state, items: [] },
    }
  )
);