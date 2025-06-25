/* eslint-disable @typescript-eslint/no-unused-vars */
// middleware.ts
import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const pathname = request.nextUrl.pathname;
  
  // Define route types
  const authRoutes = ['/sign-in', '/sign-up'];
  const protectedRoutes = ['/onboarding', '/d', '/account'];
  
  try {
    // 1. Get session without auto-refresh
    const { data: { session } } = await supabase.auth.getSession();
    
    // 2. Handle route protection
    if (!session && protectedRoutes.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    if (session && authRoutes.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/d', request.url));
    }

    // 3. Update activity marker
    if (session) {
      response.cookies.set('last-active', Date.now().toString(), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 30
      });
    }
    
    return response;
    
  } catch (error) {
    // 4. Clear invalid tokens
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}