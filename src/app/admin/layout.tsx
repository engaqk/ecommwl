"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, LogOut, Loader2, Paintbrush, Megaphone, Settings, Store, Menu, X } from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { store } = useTenantStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isLocalAdmin = localStorage.getItem("shaza_admin") === "true";
      
      if (user || isLocalAdmin) {
        setUser(user || { uid: "local_admin" });
      } else {
        setUser(null);
        if (pathname !== "/admin") {
          router.push("/admin");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;
  }

  // If on login page, just render the children (no sidebar)
  if (pathname === "/admin" && !user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-navy)] text-white flex flex-col transition-transform duration-300 md:static md:translate-x-0 border-r border-white/10 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex flex-col items-start border-b border-white/10 relative">
          <button 
            className="absolute top-4 right-4 md:hidden text-white/50 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <svg 
              width="36" height="36" viewBox="0 0 100 100" fill="none" 
            >
              <circle cx="50" cy="50" r="48" stroke="url(#goldGradient2)" strokeWidth="1.5" className="opacity-80"/>
              <path d="M30 45 C 30 25, 70 25, 70 45 C 80 45, 85 55, 80 75 C 75 90, 25 90, 20 75 C 15 55, 20 45, 30 45 Z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M40 45 C 40 30, 60 30, 60 45" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
              <path d="M43 65 C 55 65, 55 55, 45 55 C 35 55, 35 45, 47 45" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M57 45 L 65 45 C 65 50, 58 52, 63 55 C 68 58, 60 65, 52 65" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="goldGradient2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="50%" stopColor="#fff" />
                  <stop offset="100%" stopColor="var(--color-primary)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-xl font-serif text-white font-bold tracking-tight leading-none">
                {store?.name || "MY STORE"}
              </span>
              <span className="text-[7px] uppercase tracking-[6px] text-white/60 mt-1 pl-1">
                Admin
              </span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 mt-6">
          <Link href="/admin/dashboard" className={`flex items-center px-6 py-4 hover:bg-white/10 transition-colors ${pathname === '/admin/dashboard' ? 'bg-white/10 border-l-4 border-[var(--color-primary)]' : ''}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/admin/products" className={`flex items-center px-6 py-4 hover:bg-white/10 transition-colors ${pathname === '/admin/products' ? 'bg-white/10 border-l-4 border-[var(--color-primary)]' : ''}`}>
            <ShoppingBag className="w-5 h-5 mr-3" /> Products
          </Link>
          <Link href="/admin/orders" className={`flex items-center px-6 py-4 hover:bg-white/10 transition-colors ${pathname === '/admin/orders' ? 'bg-white/10 border-l-4 border-[var(--color-primary)]' : ''}`}>
            <Package className="w-5 h-5 mr-3" /> Orders
          </Link>
          <Link href="/admin/custom-orders" className={`flex items-center px-6 py-4 hover:bg-white/10 transition-colors ${pathname === '/admin/custom-orders' ? 'bg-white/10 border-l-4 border-[var(--color-primary)]' : ''}`}>
            <Paintbrush className="w-5 h-5 mr-3" /> Custom Orders
          </Link>
          <Link href="/admin/vendors" className={`flex items-center px-6 py-4 hover:bg-white/10 transition-colors ${pathname === '/admin/vendors' ? 'bg-white/10 border-l-4 border-[var(--color-primary)]' : ''}`}>
            <Store className="w-5 h-5 mr-3" /> Vendors
          </Link>
          <Link href="/admin/marketing" className={`flex items-center px-6 py-4 hover:bg-white/10 transition-colors ${pathname === '/admin/marketing' ? 'bg-white/10 border-l-4 border-[var(--color-primary)]' : ''}`}>
            <Megaphone className="w-5 h-5 mr-3" /> Marketing
          </Link>
          <Link href="/admin/settings" className={`flex items-center px-6 py-4 hover:bg-white/10 transition-colors ${pathname === '/admin/settings' ? 'bg-white/10 border-l-4 border-[var(--color-primary)]' : ''}`}>
            <Settings className="w-5 h-5 mr-3" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => {
              localStorage.removeItem("shaza_admin");
              signOut(auth);
              router.push("/admin");
            }}
            className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:hidden flex justify-between items-center z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-start">
              <span className="font-serif text-xl font-bold tracking-tight text-[var(--color-navy)] flex items-center gap-1">
                {store?.name || "MY STORE"}
              </span>
              <span className="text-[0.5rem] tracking-[0.25em] text-[var(--color-navy)]/80 uppercase mt-0.5">
                Admin
              </span>
            </div>
          </div>
          <button onClick={() => {
            localStorage.removeItem("shaza_admin");
            signOut(auth);
            router.push("/admin");
          }} className="text-red-500">
            <LogOut className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
