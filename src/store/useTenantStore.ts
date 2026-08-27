import { create } from 'zustand';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
}

export interface StoreData {
  id: string; // The slug (e.g., 'zara')
  name: string;
  theme: ThemeConfig;
  paymentQrUrl?: string;
  ownerId?: string;
  isActive?: boolean;
}

interface TenantStore {
  store: StoreData | null;
  loading: boolean;
  error: string | null;
  setStoreId: (slug: string) => Promise<void>;
  clearStore: () => void;
}

// Default theme (fallback to my-store colors if not found)
const defaultTheme: ThemeConfig = {
  primary: "#4A2533",
  secondary: "#B76E79",
  background: "#FFF8F7"
};

export const useTenantStore = create<TenantStore>((set) => ({
  store: null,
  loading: true,
  error: null,

  setStoreId: async (slug: string) => {
    if (!slug) return;
    
    set({ loading: true, error: null });
    try {
      const storeRef = doc(db, 'stores', slug);
      const storeSnap = await getDoc(storeRef);
      
      if (storeSnap.exists()) {
        const data = storeSnap.data() as StoreData;
        
        // Handle explicit deactivation (undefined means it's an older active store)
        if (data.isActive === false) {
          set({ error: "Store inactive", loading: false, store: null });
          return;
        }

        set({ store: { ...data, id: storeSnap.id }, loading: false });
        
        // Apply dynamic CSS variables to the document root!
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.style.setProperty('--color-primary', data.theme?.primary || defaultTheme.primary);
          root.style.setProperty('--color-secondary', data.theme?.secondary || defaultTheme.secondary);
          root.style.setProperty('--color-background', data.theme?.background || defaultTheme.background);
        }
      } else {
        // If the master store document doesn't exist yet, gracefully use the fallback.
        if (slug === 'my-store') {
          set({ 
            store: { id: 'my-store', name: 'Master Store', theme: defaultTheme }, 
            loading: false 
          });
        } else {
          set({ error: "Store not found", loading: false, store: null });
        }
      }
    } catch (err: any) {
      console.error("Error fetching store:", err);
      set({ error: err.message, loading: false });
    }
  },

  clearStore: () => set({ store: null, loading: false, error: null })
}));
