import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export default auth((req: NextRequest & { auth: unknown }) => {
  try {
    const isLoggedIn = !!req.auth;

    // Get host from headers for redirection as requested
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');

    if (isAuthPage) {
      if (isLoggedIn) {
        return Response.redirect(new URL('/', baseUrl));
      }
      return;
    }

    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', baseUrl));
    }
  } catch (error) {
    console.error('Proxy/Middleware error:', error);
    return;
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
