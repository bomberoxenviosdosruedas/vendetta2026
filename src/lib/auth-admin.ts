
'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = 'vendetta-admin-session';
const ADMIN_PASSWORD = 'Bomberox'; // Store this in environment variables in a real app

export async function loginAdmin(password: string) {
    if (password !== ADMIN_PASSWORD) {
        return { success: false, error: "Contraseña incorrecta." };
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
    });
    
    // We can't redirect here because this might be called in a transition
    // The component calling this should handle the redirect
    return { success: true };
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
    redirect('/admin');
}

export async function getAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
    return cookie?.value === 'true';
}

export async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
    return cookie?.value === 'true';
}
