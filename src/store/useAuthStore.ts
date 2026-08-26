import { create } from 'zustand';
import { User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useWishlistStore } from './useWishlistStore';

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_STAFF' | 'CUSTOMER';

export interface UserData {
  uid: string;
  email: string | null;
  username?: string; // Added for staff/admin logins
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  phone?: string;
  address?: string;
  country?: string;
  role: UserRole;
  storeId?: string; // Which store this user belongs to (if not SUPER_ADMIN)
}

interface AuthStore {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  initializeAuthListener: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  userData: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user, loading: false }),

  initializeAuthListener: () => {
    if (get().initialized) return;
    
    set({ initialized: true });
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure user exists in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        let userData;

        if (!userSnap.exists()) {
          // Get current storeId from the URL or tenant store if available
          const currentStoreId = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'my-store';
          
          userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'CUSTOMER' as UserRole,
            storeId: currentStoreId,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, userData, { merge: true });
        } else {
          userData = userSnap.data() as UserData;
        }
        set({ user, userData, loading: false });
        
        // Sync wishlist with cloud
        useWishlistStore.getState().setUserId(user.uid);
        useWishlistStore.getState().syncWithCloud();
      } else {
        set({ user: null, userData: null, loading: false });
      }
    });
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // State updated via onAuthStateChanged listener
    } catch (error) {
      console.error("Error signing in with Google", error);
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, userData: null, loading: false });
      useWishlistStore.getState().clearWishlist();
    } catch (error) {
      console.error("Error signing out", error);
      set({ loading: false });
    }
  }
}));
