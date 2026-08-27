"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Loader2, Plus, LayoutDashboard, Globe, LogOut, Copy, Check, Settings2, Palette, Trash2, PowerOff, Power } from "lucide-react";
import Link from "next/link";

export default function SuperAdminPage() {
  const { user, userData, loading, logout, initializeAuthListener } = useAuthStore();
  const router = useRouter();
  
  const [stores, setStores] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  
  // Form State
  const [slug, setSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4A2533");
  const [secondaryColor, setSecondaryColor] = useState("#B76E79");
  const [bgColor, setBgColor] = useState("#FFF8F7");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    initializeAuthListener();
  }, [initializeAuthListener]);

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

  const copyToClipboard = (slug: string) => {
    navigator.clipboard.writeText(`https://ecommwl.vercel.app/${slug}`);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openNewStoreModal = () => {
    setEditingStoreId(null);
    setSlug("");
    setStoreName("");
    setPrimaryColor("#4A2533");
    setSecondaryColor("#B76E79");
    setBgColor("#FFF8F7");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (store: any) => {
    setEditingStoreId(store.id);
    setSlug(store.id);
    setStoreName(store.name);
    setPrimaryColor(store.theme?.primary || "#4A2533");
    setSecondaryColor(store.theme?.secondary || "#B76E79");
    setBgColor(store.theme?.background || "#FFF8F7");
    setError("");
    setShowModal(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const storeRef = doc(db, "stores", editingStoreId ? editingStoreId : formattedSlug);
      
      const payload = {
        name: storeName,
        theme: {
          primary: primaryColor,
          secondary: secondaryColor,
          background: bgColor
        }
      };

      if (editingStoreId) {
        await updateDoc(storeRef, payload);
      } else {
        await setDoc(storeRef, {
          ...payload,
          createdAt: new Date().toISOString()
        });

        // Provision the default Admin User ONLY for new stores
        const adminEmail = `${formattedSlug}_admin@admin.local`;
        const res = await fetch("/api/admin/create-tenant-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: adminEmail,
            password: "admin",
            role: "TENANT_ADMIN",
            storeId: formattedSlug,
            displayName: `${storeName} Admin`
          })
        });

        if (!res.ok) throw new Error("Store created, but failed to provision admin account keys.");
      }

      setShowModal(false);
      fetchStores();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (store: any) => {
    try {
      const newStatus = store.isActive === false ? true : false;
      if (!newStatus && !confirm(`Are you sure you want to DEACTIVATE "${store.name}"? Users will not be able to access the store.`)) {
        return;
      }
      await updateDoc(doc(db, "stores", store.id), { isActive: newStatus });
      fetchStores();
    } catch (e) {
      console.error(e);
      alert("Failed to update store status.");
    }
  };

  const handleDeleteStore = async (store: any) => {
    if (!confirm(`CRITICAL WARNING: Are you absolutely sure you want to permanently DELETE "${store.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "stores", store.id));
      fetchStores();
    } catch (e) {
      console.error(e);
      alert("Failed to delete store.");
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
            onClick={openNewStoreModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Store
          </button>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <div key={store.id} className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 group relative transition-opacity ${store.isActive === false ? 'opacity-50 grayscale' : ''}`}>
              {store.isActive === false && (
                <div className="absolute top-4 left-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Inactive
                </div>
              )}
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => handleToggleStatus(store)} 
                  className={`p-2 bg-white ${store.isActive === false ? 'text-green-500 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'} border border-slate-100 rounded-lg shadow-sm transition-all`}
                  title={store.isActive === false ? "Activate Store" : "Deactivate Store"}
                >
                  {store.isActive === false ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => openEditModal(store)} 
                  className="p-2 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-lg shadow-sm transition-all"
                  title="Customize Template"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteStore(store)} 
                  className="p-2 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-100 rounded-lg shadow-sm transition-all"
                  title="Delete Store"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className={`flex items-start justify-between mb-4 ${store.isActive === false ? 'mt-6' : ''}`}>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 pr-8">{store.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 bg-slate-50 px-2 py-1 rounded-md inline-flex border border-slate-100">
                    <Globe className="w-3 h-3 text-slate-400" /> 
                    <span>ecommwl.vercel.app/{store.id}</span>
                    <button 
                      onClick={() => copyToClipboard(store.id)} 
                      className="ml-1 p-1 hover:bg-slate-200 rounded transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === store.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-500 hover:text-slate-800" />}
                    </button>
                  </div>
                </div>
                {/* Theme Preview circles */}
                <div className="flex -space-x-2 mt-1">
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

      {/* Edit/New Store Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {editingStoreId ? <Palette className="w-5 h-5 text-indigo-500" /> : null}
                {editingStoreId ? 'Customize Template' : 'Provision New Tenant'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleSaveStore} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brand Name</label>
                <input required type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Nike Custom" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">URL Slug</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-sm">ecommwl.vercel.app/</span>
                  <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} disabled={!!editingStoreId} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-r-lg text-sm outline-none focus:border-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed" placeholder="nike" />
                </div>
                {!editingStoreId && <p className="text-[10px] text-slate-400 mt-1.5">Admin user will automatically be created as <b>{slug || 'slug'}_admin</b></p>}
                {editingStoreId && <p className="text-[10px] text-orange-500 mt-1.5">URL slugs cannot be changed once a store is live.</p>}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Template Colors</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Primary Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer" />
                      <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono uppercase" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Secondary Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer" />
                      <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono uppercase" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-indigo-600/20">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />} {editingStoreId ? 'Save Customizations' : 'Provision Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
