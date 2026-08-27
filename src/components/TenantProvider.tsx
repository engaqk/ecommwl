"use client";

import { useEffect } from "react";
import { useTenantStore } from "@/store/useTenantStore";

export default function TenantProvider({ children }: { children: React.ReactNode }) {
  const { setStoreId, loading, error } = useTenantStore();

  // Extract path and check if it's a system route early
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const rawSlug = pathParts[1] || '';
  const systemRoutes = ['admin', 'super-admin', 'superadmin', 'login', 'api', ''];
  const isSystemRoute = systemRoutes.includes(rawSlug);

  useEffect(() => {
    let slug = rawSlug;
    if (isSystemRoute) {
      slug = 'my-store'; // Default master tenant for system routes
    }
    setStoreId(slug);
  }, [setStoreId, rawSlug, isSystemRoute]);

  if (loading) {
    return <div className="min-h-screen bg-[#FFF8F7] flex items-center justify-center">Loading platform...</div>;
  }

  // CRITICAL: Never block system routes (like super-admin or login). 
  // If there's an error but they are on a system page, let them through so they aren't locked out.
  if (error && !isSystemRoute) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Store Unavailable</h1>
        <p className="text-slate-500 max-w-md">
          {error === 'Store inactive' 
            ? 'This store has been temporarily deactivated by the platform administrator.' 
            : 'The store you are looking for does not exist.'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
