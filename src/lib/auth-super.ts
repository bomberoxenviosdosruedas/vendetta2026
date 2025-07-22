
'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPER_USER_COOKIE_NAME = 'vendetta-super-session';

export async function loginSuperUserSession() {
    cookies().set(SUPER_USER_COOKIE_NAME, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    });
     redirect('/login');
}

export async function getSuperUserSession(): Promise<boolean> {
    const cookieStore = cookies();
    const cookie = cookieStore.get(SUPER_USER_COOKIE_NAME);
    return cookie?.value === 'true';
}
