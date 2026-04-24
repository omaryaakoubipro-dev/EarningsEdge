import { NextResponse, type NextRequest } from 'next/server';

// No authentication required — single-user personal app
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
