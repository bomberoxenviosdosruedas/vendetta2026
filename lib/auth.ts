'use server';

import { cookies } from 'next/headers';
import { getUserByUsername } from '@/lib/data';

// This is a simplified session management for demo purposes.
// In a real application, you should use a robust authentication library like NextAuth.js or Clerk.

const SESSION_COOKIE_NAME = 'vendetta-session';

export async function login(username: string) {
  cookies().set(SESSION_COOKIE_NAME, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser() {
  const username = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!username) {
    return null;
  }
  try {
    const user = await getUserByUsername(username);
    return user;
  } catch (error) {
    console.error("Failed to fetch session user:", error);
    return null;
  }
}

    