
'use server';

import { loginSuperUserSession } from "../auth-super";
import prisma from "../prisma/prisma";

interface LoginInput {
    username: string;
    password?: string;
}

export async function loginSuperUser(credentials: LoginInput) {
    try {
        const { username, password } = credentials;

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
        
        // The redirect will be handled by the page component after revalidation
        return { success: true };
    } catch (err) {
        console.error("Error en loginSuperUser:", err);
        return { error: "Error de conexión o base de datos. Intente nuevamente." };
    }
}
