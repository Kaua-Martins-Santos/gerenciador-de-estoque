// lib/auth.ts
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'chave-secreta-padrao-super-segura'
);

export async function createSession(payload: { userId: string; role: string; name: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // Sessão dura 8 horas
    .sign(SECRET_KEY);

  cookies().set('session', token, {
    httpOnly: true, // JavaScript do front não lê (proteção XSS)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const session = cookies().get('session')?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function logout() {
  cookies().delete('session');
}