"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Loader2, Plus, Users, LayoutDashboard, Globe, Link as LinkIcon, LogOut } from "lucide-react";
import Link from "next/link";

export default function SuperAdminPage() {
  const { user, userData, loading, logout } = useAuthStore();
  const router = useRouter();
  
  const [stores, setStores] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  
  // New Store Form State
  const [showModal, setShowModal] = useState(false);
  const [slug, setSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4A2533");
  const [secondaryColor, setSecondaryColor] = useState("#B76E79");
  const [bgColor, setBgColor] = useState("#FFF8F7");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user || userData?.role !== 'SUPER_ADMIN') {
        router.push("/login");
      } else {
        fetchStores();
      }
    }
  }, [user, userData, loading, router]);

  const fetchStores = async () => {
    try {
      const snap = await getDocs(collection(db, "stores"));
      setStores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      // 1. Create the store config document in 'stores' collection
      const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const storeRef = doc(db, "stores", formattedSlug);
      await setDoc(storeRef, {
        name: storeName,
        theme: {
          primary: primaryColor,
          secondary: secondaryColor,
          background: bgColor
        },
        createdAt: new Date().toISOString()
      });

      // 2. Provision the default Admin User for this store
      // Username: [slug]_admin -> email: [slug]_admin@admin.local
      const adminEmail = `${formattedSlug}_admin@admin.local`;
      const adminPassword = "admin";

      // We have to use a secondary Firebase app or cloud function to create a user without logging out the Super Admin.
      // For this prototype, we'll hit an API route that creates the user securely using Firebase Admin.
      // (If running fully client-side, Firebase logs you out when you create a new account.
      // We will assume an API endpoint `/api/admin/create-tenant-user` exists for this).
      
      const res = await fetch("/api/admin/create-tenant-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          role: "TENANT_ADMIN",
          storeId: formattedSlug,
          displayName: `${storeName} Admin`
        })
      });

      if (!res.ok) throw new Error("Failed to provision admin account.");

      setShowModal(false);
      setSlug("");
      setStoreName("");
      fetchStores();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading || fetching) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider">SUPER ADMIN</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-Tenant Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800 rounded-lg text-sm text-slate-200">
            <LayoutDashboard className="w-4 h-4" /> All Stores
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Platform Tenants</h2>
            <p className="text-sm text-slate-500">Manage all whitelabel stores on the platform.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Store
          </button>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <div key={store.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{store.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Globe className="w-3.5 h-3.5" /> ecommwl.com/{store.id}
                  </div>
                </div>
                {/* Theme Preview circles */}
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: store.theme?.primary }}></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: store.theme?.secondary }}></div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="text-xs">
                  <span className="block text-slate-400 mb-1">Admin Login</span>
                  <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">{store.id}_admin</code>
                </div>
                <div className="text-xs">
                  <span className="block text-slate-400 mb-1">Password</span>
                  <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">admin</code>
                </div>
              </div>
            </div>
          ))}
          {stores.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              No stores created yet.
            </div>
          )}
        </div>
      </main>

      {/* New Store Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Provision New Tenant</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleCreateStore} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brand Name</label>
                <input required type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="e.g. Nike Custom" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">URL Slug</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-sm">ecommwl.com/</span>
                  <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-r-lg text-sm outline-none focus:border-indigo-500" placeholder="nike" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Admin user will automatically be created as <b>{slug || 'slug'}_admin</b></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Primary Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer" />
                    <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Secondary Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer" />
                    <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />} Provision Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
