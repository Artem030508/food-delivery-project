import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [], 
  

  addToCart: (product) => set((state) => {
    const existing = state.items.find((item) => item.id === product.id);
    if (existing) {
      
      return {
        items: state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    items: state.items.filter((item) => item.id !== productId),
  })),

  clearCart: () => set({ items: [] }),
}));
