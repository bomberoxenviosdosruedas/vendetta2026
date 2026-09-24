import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'vendetta-session';
const TEST_USERNAME = 'bomberox';

// Rutas que requieren autenticación (dashboard)
const PROTECTED_PATHS = ['/overview', '/rooms', '/training', '/recruitment', '/missions', '/map', '/family', '/rankings', '/admin'];

export function middleware(request: NextRequest) {
  // Solo en desarrollo: auto-login como bomberox si no hay sesión
  if (process.env.NODE_ENV === 'development') {
    const { pathname } = request.nextUrl;
    
    // Verificar si la ruta es una ruta protegida del dashboard
    const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
    
    if (isProtectedPath) {
      const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
      
      // Si no hay cookie de sesión, crear una para bomberox
      if (!sessionCookie) {
        console.log('[Middleware] Desarrollo: Auto-login como bomberox');
        const response = NextResponse.next();
        response.cookies.set(SESSION_COOKIE_NAME, TEST_USERNAME, {
          httpOnly: true,
          secure: false, // false en desarrollo
          maxAge: 60 * 60 * 24 * 7, // Una semana
          path: '/',
          sameSite: 'lax',
        });
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};