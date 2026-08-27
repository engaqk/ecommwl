import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  if (pathParts.length === 0) {
    return NextResponse.next();
  }

  const firstSegment = pathParts[0];

  const systemRoutes = [
    'admin', 
    'super-admin', 
    'superadmin', 
    'login', 
    'api', 
    'shop', 
    'checkout', 
    'custom', 
    'orders', 
    'payment', 
    'repay', 
    'review', 
    'supplier', 
    'wishlist',
    '_next',
    'favicon.ico',
    'manifest.json',
    'icon.svg'
  ];

  if (systemRoutes.includes(firstSegment)) {
    return NextResponse.next();
  }

  const newPathParts = pathParts.slice(1);
  url.pathname = '/' + newPathParts.join('/');
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
