import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_DOMAIN = 'luniobuilder.com';
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'dashboard',
  'editor',
  'static',
  '_next',
  '_static',
  'favicon.ico',
  'site',
]);

const isPublicSubdomain = (hostname: string) => {
  return hostname.endsWith(`.${PUBLIC_DOMAIN}`);
};

const getSubdomain = (hostname: string) => {
  return hostname.replace(`.${PUBLIC_DOMAIN}`, '').toLowerCase();
};

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  if (!isPublicSubdomain(hostname)) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(hostname);
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/site') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const targetPath = pathname === '/' ? `/site/${subdomain}` : `/site/${subdomain}${pathname}`;
  url.pathname = targetPath;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/:path*'],
};
