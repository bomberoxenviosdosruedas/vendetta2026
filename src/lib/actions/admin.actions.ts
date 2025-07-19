
'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "../prisma/prisma";
import { z } from "zod";
import { ConfiguracionHabitacion, ConfiguracionTropa, ConfiguracionEntrenamiento, TipoTropa } from "@prisma/client";

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


// --- CRUD Actions ---

const parseNumber = (val: FormDataEntryValue | null) => Number(val) || 0;
const parseString = (val: FormDataEntryValue | null) => String(val || '');
const parseNullString = (val: FormDataEntryValue | null) => val ? String(val) : null;
const parseStringArray = (val: FormDataEntryValue | null) => parseString(val).split(',').map(s => s.trim()).filter(Boolean);


// Room Config CRUD
export async function saveRoomConfig(formData: FormData) {
    const isAdmin = await getAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    const data = {
        id: parseString(formData.get('id')),
        nombre: parseString(formData.get('nombre')),
        descripcion: parseString(formData.get('descripcion')),
        urlImagen: parseString(formData.get('urlImagen')),
        costoArmas: parseNumber(formData.get('costoArmas')),
        costoMunicion: parseNumber(formData.get('costoMunicion')),
        costoDolares: parseNumber(formData.get('costoDolares')),
        duracion: parseNumber(formData.get('duracion')),
        produccionBase: parseNumber(formData.get('produccionBase')),
        produccionRecurso: parseNullString(formData.get('produccionRecurso')),
        puntos: parseNumber(formData.get('puntos')),
    };

    try {
        await prisma.configuracionHabitacion.upsert({
            where: { id: data.id },
            update: data,
            create: data,
        });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteRoomConfig(id: string) {
    const isAdmin = await getAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    try {
        await prisma.configuracionHabitacion.delete({ where: { id } });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}


// Training Config CRUD
export async function saveTrainingConfig(formData: FormData) {
    const isAdmin = await getAdminSession();
    if (!isAdmin) return { error: "No autorizado" };
     
    const data = {
        id: parseString(formData.get('id')),
        nombre: parseString(formData.get('nombre')),
        urlImagen: parseString(formData.get('urlImagen')),
        costoArmas: parseNumber(formData.get('costoArmas')),
        costoMunicion: parseNumber(formData.get('costoMunicion')),
        costoDolares: parseNumber(formData.get('costoDolares')),
        duracion: parseNumber(formData.get('duracion')),
        puntos: parseNumber(formData.get('puntos')),
    };

    try {
        await prisma.configuracionEntrenamiento.upsert({
            where: { id: data.id },
            update: data,
            create: data,
        });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteTrainingConfig(id: string) {
    const isAdmin = await getAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    try {
        await prisma.configuracionEntrenamiento.delete({ where: { id } });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}


// Troop Config CRUD
export async function saveTroopConfig(formData: FormData) {
    const isAdmin = await getAdminSession();
    if (!isAdmin) return { error: "No autorizado" };
    
    const data = {
        id: parseString(formData.get('id')),
        nombre: parseString(formData.get('nombre')),
        urlImagen: parseString(formData.get('urlImagen')),
        descripcion: parseString(formData.get('descripcion')),
        costoArmas: parseNumber(formData.get('costoArmas')),
        costoMunicion: parseNumber(formData.get('costoMunicion')),
        costoDolares: parseNumber(formData.get('costoDolares')),
        duracion: parseNumber(formData.get('duracion')),
        puntos: parseNumber(formData.get('puntos')),
        ataque: parseNumber(formData.get('ataque')),
        defensa: parseNumber(formData.get('defensa')),
        capacidad: parseNumber(formData.get('capacidad')),
        velocidad: parseNumber(formData.get('velocidad')),
        salario: parseNumber(formData.get('salario')),
        tipo: parseString(formData.get('tipo')) as TipoTropa,
        requisitos: parseStringArray(formData.get('requisitos')),
        bonusAtaque: parseStringArray(formData.get('bonusAtaque')),
        bonusDefensa: parseStringArray(formData.get('bonusDefensa')),
    };

    try {
        await prisma.configuracionTropa.upsert({
            where: { id: data.id },
            update: data,
            create: data,
        });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteTroopConfig(id: string) {
    const isAdmin = await getAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    try {
        await prisma.configuracionTropa.delete({ where: { id } });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
