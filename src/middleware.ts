/**
 * Authentication Middleware
 * 
 * This middleware handles authentication state and route protection for the entire application.
 * It runs before every request to check user authentication status and redirects users
 * based on their authentication state and the route they're trying to access.
 * 
 * Key Features:
 * - Automatic authentication state checking using Supabase
 * - Route protection for authenticated and unauthenticated users
 * - Intelligent redirection based on user state
 * - Session management and cookie handling
 * 
 * Route Protection Logic:
 * - Authenticated users accessing "/" → Redirect to "/dashboard"
 * - Unauthenticated users accessing protected routes → Redirect to "/" (login)
 * - API routes, static files, and images are excluded from middleware
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Main middleware function that runs on every request
 * 
 * Authentication Flow:
 * 1. Create Supabase client with request/response context
 * 2. Retrieve current user session from cookies
 * 3. Apply route protection logic based on authentication state
 * 4. Redirect users appropriately or allow request to continue
 * 
 * @param req - The incoming Next.js request object
 * @returns NextResponse - Either a redirect or the original request
 */
export async function middleware(req: NextRequest) {
  // Create a response object to pass to Supabase client
  const res = NextResponse.next()
  
  // Initialize Supabase client with middleware context
  // This allows the client to read/write cookies for session management
  const supabase = createMiddlewareClient({ req, res })

  // Retrieve the current user session from cookies
  // This is efficient as it doesn't make an API call, just reads from cookies
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ROUTE PROTECTION LOGIC

  // Case 1: Authenticated user trying to access login page
  // If user is signed in and the current path is "/" (login page)
  // Redirect them to the dashboard since they're already authenticated
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Case 2: Unauthenticated user trying to access protected routes
  // If user is not signed in and trying to access any route other than "/" or "/docs"
  // Redirect them to the login page for authentication
  // Allow access to /docs for API documentation without authentication
  if (!session && req.nextUrl.pathname !== '/' && req.nextUrl.pathname !== '/docs') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Case 3: Allow request to continue
  // User has appropriate access for the route they're requesting
  return res
}

/**
 * Middleware Configuration
 * 
 * The matcher defines which routes this middleware should run on.
 * Using a negative lookahead pattern to exclude certain paths:
 * 
 * Excluded paths:
 * - /api/* - API routes (handled separately)
 * - /_next/static/* - Next.js static files
 * - /_next/image/* - Next.js optimized images
 * - /favicon.ico - Favicon requests
 * 
 * This ensures middleware only runs on actual page routes that need
 * authentication checking, improving performance.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 