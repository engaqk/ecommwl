import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category?: string;
  stock?: number;
}

interface WishlistStore {
  items: WishlistItem[];
  userId: string | null;
  setUserId: (id: string | null) => void;
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  syncWithCloud: () => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      
      setUserId: (id) => set({ userId: id }),

      addItem: async (item) => {
        const { items, userId } = get();
        if (items.find((i) => i.id === item.id)) return; // Already in wishlist

        const newItems = [...items, item];
        set({ items: newItems }); // Optimistic UI update

        if (userId) {
          try {
            await setDoc(doc(db, 'users', userId), { wishlist: newItems }, { merge: true });
          } catch (error) {
            console.error("Error saving wishlist to cloud", error);
          }
        }
      },

      removeItem: async (id) => {
        const { items, userId } = get();
        const newItems = items.filter((i) => i.id !== id);
        set({ items: newItems }); // Optimistic UI update

        if (userId) {
          try {
            await updateDoc(doc(db, 'users', userId), { wishlist: newItems });
          } catch (error) {
            console.error("Error removing from cloud wishlist", error);
          }
        }
      },

      isInWishlist: (id) => get().items.some((i) => i.id === id),

      syncWithCloud: async () => {
        const { userId, items: localItems } = get();
        if (!userId) return;

        try {
          const userRef = doc(db, 'users', userId);
          const snap = await getDoc(userRef);
          
          if (snap.exists()) {
            const data = snap.data();
            const cloudItems: WishlistItem[] = data.wishlist || [];
            
            // Merge local and cloud items, avoiding duplicates
            const mergedItems = [...cloudItems];
            let changed = false;

            for (const local of localItems) {
              if (!mergedItems.find(c => c.id === local.id)) {
                mergedItems.push(local);
                changed = true;
              }
            }

            set({ items: mergedItems });

            // If we added local items to the cloud list, push the update back to Firestore
            if (changed) {
              await setDoc(userRef, { wishlist: mergedItems }, { merge: true });
            }
          }
        } catch (error) {
          console.error("Error syncing wishlist with cloud", error);
        }
      },

      clearWishlist: () => set({ items: [], userId: null })
    }),
    {
      name: 'shaza-wishlist-storage',
      // Don't persist userId to local storage, only the items for guests
      partialize: (state) => ({ items: state.items }),
    }
  )
);
