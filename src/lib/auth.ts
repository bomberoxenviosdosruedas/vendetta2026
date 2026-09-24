'use server';

import { cookies, headers } from 'next/headers';
import { getUserWithProgressByUsername } from '@/lib/data';
import prisma from './prisma/prisma';

const SESSION_COOKIE_NAME = 'vendetta-session';

export async function login(userId: string, username: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });

  // Log login history
  try {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') ?? 'unknown';
    const userAgent = headerList.get('user-agent') ?? 'unknown';
    
    await prisma.loginHistory.create({
      data: {
        userId: userId,
        ipAddress: ip,
        userAgent: userAgent,
      }
    })
  } catch (e) {
    console.error("Failed to log login history:", e);
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const username = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!username) {
    return null;
  }
  
  // Setup de prueba: fallback mock para bomberox (cualquier entorno).
  // Si la BD responde se usa el usuario real; si no (BD caída o sin configurar en Vercel),
  // se usa el mock para que el dashboard nunca entre en loop de redirección.
  if (username === 'bomberox') {
    try {
      const user = await getUserWithProgressByUsername(username);
      if (user) return user;
    } catch (e) {
      console.log('[Auth] DB no disponible, usando mock user para bomberox');
    }
    
    // Mock user bomberox (setup de prueba fijo)
    return {
      id: 'cmd6rdx740003zi0w5d7c67xp',
      name: 'bomberox',
      username: 'bomberox',
      password: '123456789',
      title: 'Jefe de la Familia',
      avatarUrl: '/img/bomberox.png',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date(),
      propiedades: [],
      entrenamientos: [],
      puntuacion: null,
      misiones: [],
      colaEntrenamientos: [],
      familyMember: null,
      _count: { receivedMessages: 0 },
    } as any;
  }
  
  try {
    const user = await getUserWithProgressByUsername(username);
    return user;
  } catch (error) {
    console.error("Failed to fetch session user:", error);
    return null;
  }
}
