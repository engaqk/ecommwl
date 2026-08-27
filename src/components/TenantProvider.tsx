"use client";

import { useEffect } from "react";
import { useTenantStore } from "@/store/useTenantStore";

export default function TenantProvider({ children }: { children: React.ReactNode }) {
  const { setStoreId, loading, error } = useTenantStore();

  useEffect(() => {
    // Determine the slug from the URL pathname or subdomain
    // For path-based: e.g. ecommwl.com/zara -> slug is 'zara'
    // If root (/), default to 'shaza' (the original store)
    const pathParts = window.location.pathname.split('/');
    let slug = pathParts[1];
    
    // Quick heuristic: if the first path segment is known system routes, fallback to 'my-store'
    // In a real subdomain setup, this would read window.location.hostname
    const systemRoutes = ['admin', 'super-admin', 'superadmin', 'login', 'api', ''];
    if (systemRoutes.includes(slug)) {
      slug = 'my-store'; // Default master tenant
    }

    setStoreId(slug);
  }, [setStoreId]);

  if (loading) {
    return <div className="min-h-screen bg-[#FFF8F7] flex items-center justify-center">Loading platform...</div>;
  }

  if (error) {
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
