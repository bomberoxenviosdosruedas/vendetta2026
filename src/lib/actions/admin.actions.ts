
'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = 'vendetta-admin-session';
const ADMIN_PASSWORD = 'Bomberox';

export async function loginAdmin(password: string) {
    if (password !== ADMIN_PASSWORD) {
        return { success: false, error: "Contraseña incorrecta." };
    }

    cookies().set(ADMIN_COOKIE_NAME, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/admin',
    });

    redirect('/admin/panel');
}

export async function logoutAdmin() {
    cookies().delete(ADMIN_COOKIE_NAME);
    revalidatePath('/admin');
}

export async function getAdminSession(): Promise<boolean> {
    const cookie = cookies().get(ADMIN_COOKIE_NAME);
    return cookie?.value === 'true';
}
