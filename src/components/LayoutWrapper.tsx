"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { useTenantStore } from "@/store/useTenantStore";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { store } = useTenantStore();

  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/superadmin") || pathname.startsWith("/super-admin");

  if (isAdmin) {
    return <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">{children}</main>;
  }

  return (
    <>
      <WhatsAppButton />
      <div className="flex-shrink-0">
        <Navbar />
      </div>
      <CartDrawer />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {children}
        <footer className="bg-[var(--color-navy)] text-white py-8 text-center mt-auto">
          <p className="text-sm opacity-80 mb-2">
            © {new Date().getFullYear()} {store?.name || "My Store"}. All rights reserved.
          </p>
          <Link href="/admin" className="text-xs text-white/50 hover:text-white transition-colors">
            Admin Portal
          </Link>
        </footer>
      </main>
    </>
  );
}
