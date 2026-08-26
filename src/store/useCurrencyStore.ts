import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // Exchange rate relative to INR
  enabled: boolean;
}

interface CurrencyState {
  activeCurrency: string;
  currencies: Record<string, CurrencyConfig>;
  setCurrency: (code: string) => void;
  initCurrencies: () => void;
}

// Default fallback currencies if Firestore hasn't been set up yet
const DEFAULT_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', rate: 1, enabled: true },
  USD: { code: 'USD', symbol: '$', rate: 0.012, enabled: true },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011, enabled: true },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0095, enabled: true },
  AED: { code: 'AED', symbol: 'د.إ', rate: 0.044, enabled: true }
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      activeCurrency: 'INR',
      currencies: DEFAULT_CURRENCIES,
      setCurrency: (code: string) => set({ activeCurrency: code }),
      initCurrencies: () => {
        // Listen to global settings doc for live updates from admin
        const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
          if (docSnap.exists() && docSnap.data().currencies) {
            const adminCurrencies = docSnap.data().currencies;
            set({ currencies: adminCurrencies });
            
            // If currently active currency was disabled by admin, fallback to INR
            const active = get().activeCurrency;
            if (adminCurrencies[active] && !adminCurrencies[active].enabled) {
              set({ activeCurrency: 'INR' });
            }
          }
        }, (error) => {
          console.error("Error fetching currencies:", error);
        });
      }
    }),
    {
      name: 'shaza-currency-storage',
      partialize: (state) => ({ activeCurrency: state.activeCurrency }) // Only persist the user's choice
    }
  )
);

// Utility hook for components to easily format prices
export const useCurrencyFormatter = () => {
  const { activeCurrency, currencies } = useCurrencyStore();
  
  const formatPrice = (amountInINR: number) => {
    const currency = currencies[activeCurrency] || currencies['INR'];
    if (!currency) return `₹${amountInINR}`;
    
    const converted = amountInINR * currency.rate;
    
    // Format to 2 decimal places if it's not a whole number, otherwise 0
    const formattedAmount = Number.isInteger(converted) 
      ? converted.toString() 
      : converted.toFixed(2);
      
    return `${currency.symbol}${formattedAmount}`;
  };

  return { formatPrice, activeCurrency, currencies };
};
