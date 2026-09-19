
'use server';

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginSuperUserSession } from "../auth-super";
import prisma from "../prisma/prisma";

interface LoginInput {
    username: string;
    password?: string;
}

export async function loginSuperUser(credentials: LoginInput) {
    const { username, password } = credentials;

    try {
        const superUser = await prisma.superUser.findUnique({
            where: { username },
        });

        if (!superUser) {
            return { error: "Credenciales de superusuario incorrectas." };
        }

        // In a real app, hash and compare passwords securely.
        // For this project's security scope, we do a direct comparison.
        if (superUser.password !== password) {
            return { error: "Credenciales de superusuario incorrectas." };
        }

        await loginSuperUserSession();
        revalidatePath('/');
    } catch (err) {
        console.error("Error en loginSuperUser:", err);
        return { error: "Error de conexión o base de datos. Intente nuevamente." };
    }

    redirect('/login');
}
