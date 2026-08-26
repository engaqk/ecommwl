"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, Globe } from "lucide-react";
import toast from "react-hot-toast";

// Same default fallback as store
const DEFAULT_CURRENCIES: any = {
  INR: { code: 'INR', symbol: '₹', rate: 1, enabled: true },
  USD: { code: 'USD', symbol: '$', rate: 0.012, enabled: true },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011, enabled: true },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0095, enabled: true },
  AED: { code: 'AED', symbol: 'د.إ', rate: 0.044, enabled: true }
};

export default function AdminSettingsPage() {
  const [currencies, setCurrencies] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "global");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().currencies) {
          setCurrencies(docSnap.data().currencies);
        } else {
          setCurrencies(DEFAULT_CURRENCIES);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleCurrencyToggle = (code: string) => {
    if (code === 'INR') return; // Cannot disable base currency
    setCurrencies((prev: any) => ({
      ...prev,
      [code]: { ...prev[code], enabled: !prev[code].enabled }
    }));
  };

  const handleRateChange = (code: string, newRate: string) => {
    const num = parseFloat(newRate);
    if (isNaN(num)) return;
    
    setCurrencies((prev: any) => ({
      ...prev,
      [code]: { ...prev[code], rate: num }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), { currencies }, { merge: true });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-2">Store Settings</h1>
          <p className="text-gray-500">Manage global configurations for Shaza53 Creation.</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center px-6 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-black transition-colors shadow-lg"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          SAVE CHANGES
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-[var(--color-primary)]" />
          <h2 className="text-xl font-bold text-[var(--color-navy)]">Multi-Currency Engine</h2>
        </div>
        
        <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
          Enable or disable currencies available to your international customers. Adjust the exchange rates relative to your base price (INR). When customers switch currencies, all prices automatically convert based on these rates.
        </p>

        <div className="space-y-6">
          {Object.values(currencies || {}).map((currency: any) => (
            <div key={currency.code} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4 w-full sm:w-1/3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={currency.enabled}
                    onChange={() => handleCurrencyToggle(currency.code)}
                    disabled={currency.code === 'INR'}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
                <div>
                  <div className="font-bold text-[var(--color-navy)]">{currency.code}</div>
                  <div className="text-xs text-gray-400">Symbol: {currency.symbol}</div>
                </div>
              </div>
              
              <div className="flex-1 flex justify-between sm:justify-end items-center gap-4 w-full sm:w-auto">
                <div className="text-sm font-medium text-gray-500 text-right shrink-0">
                  1 INR = 
                </div>
                <div className="relative flex-1 sm:flex-none">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currency.symbol}</span>
                  <input 
                    type="number"
                    step="0.0001"
                    value={currency.rate}
                    onChange={(e) => handleRateChange(currency.code, e.target.value)}
                    disabled={currency.code === 'INR'}
                    className="w-full sm:w-32 pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
