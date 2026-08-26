"use client";

import { useEffect } from "react";
import { useTenantStore } from "@/store/useTenantStore";

export default function TenantProvider({ children }: { children: React.ReactNode }) {
  const { setStoreId, loading } = useTenantStore();

  useEffect(() => {
    // Determine the slug from the URL pathname or subdomain
    // For path-based: e.g. ecommwl.com/zara -> slug is 'zara'
    // If root (/), default to 'shaza' (the original store)
    const pathParts = window.location.pathname.split('/');
    let slug = pathParts[1];
    
    // Quick heuristic: if the first path segment is known system routes, fallback to 'my-store'
    // In a real subdomain setup, this would read window.location.hostname
    const systemRoutes = ['admin', 'super-admin', 'login', 'api', ''];
    if (systemRoutes.includes(slug)) {
      slug = 'my-store'; // Default master tenant
    }

    setStoreId(slug);
  }, [setStoreId]);

  if (loading) {
    return <div className="min-h-screen bg-[#FFF8F7] flex items-center justify-center">Loading platform...</div>;
  }

  return <>{children}</>;
}
