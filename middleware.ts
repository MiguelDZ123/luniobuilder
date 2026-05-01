import { NextRequest, NextResponse } from 'next/server';

const BASE_DOMAIN = 'luniobuilder.com';
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'app',
  'dashboard',
  'editor',
  'api',
  '_next',
  'static',
  'favicon',
  'robots',
]);

export function middleware(request: NextRequest) {
  const hostHeader = request.headers.get('host');
  if (!hostHeader) {
    return NextResponse.next();
  }

  const host = hostHeader.split(':')[0].toLowerCase();
  if (!host.endsWith(BASE_DOMAIN)) {
    return NextResponse.next();
  }

  const hostParts = host.split('.');
  if (hostParts.length < 3) {
    return NextResponse.next();
  }

  const subdomain = hostParts.slice(0, -2).join('.');
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/robots.txt')) {
    return NextResponse.next();
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = `/_sites/${subdomain}${pathname}`;
  return NextResponse.rewrite(rewrittenUrl);
}

export const config = {
  matcher: '/:path*',
};
