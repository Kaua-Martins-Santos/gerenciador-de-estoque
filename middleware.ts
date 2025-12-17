// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'chave-secreta-padrao-super-segura'
);

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const { pathname } = req.nextUrl;

  // Rotas públicas (Login e arquivos estáticos)
  const isPublic = pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/static');

  // Se não tiver sessão e tentar acessar rota privada -> manda pro login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Se já tiver sessão e tentar acessar o login -> manda pra home
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Verificação de Role (Opcional: Exemplo para proteger Configurações)
  if (session) {
    try {
      const { payload } = await jwtVerify(session, SECRET_KEY);
      
      // Exemplo: Bloquear rota /admin para quem não é ADMIN
      // if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      //   return NextResponse.redirect(new URL('/', req.url));
      // }
      
    } catch (error) {
      // Token inválido -> Apaga e manda pro login
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('session');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};