// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Simplesmente deixa passar tudo, sem verificar senha ou cookie
  return NextResponse.next();
}

export const config = {
  // Mantemos o matcher para evitar que ele rode em arquivos estáticos desnecessários
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};