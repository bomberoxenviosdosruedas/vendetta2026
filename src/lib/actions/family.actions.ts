
'use server';

import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { revalidatePath } from "next/cache";
import { FamilyRole } from "@prisma/client";

export async function createFamily(formData: FormData) {
    const user = await getSessionUser();
    if (!user) return { error: "Debes iniciar sesión para crear una familia." };
    if (user.familyMember) return { error: "Ya perteneces a una familia." };

    const name = formData.get('name') as string;
    const tag = formData.get('tag') as string;

    if (!name || !tag) return { error: "El nombre y el tag son obligatorios." };
    if (tag.length < 3 || tag.length > 4) return { error: "El tag debe tener entre 3 y 4 caracteres." };

    try {
        const newFamily = await prisma.family.create({
            data: {
                name,
                tag,
                description: formData.get('description') as string,
                avatarUrl: formData.get('avatarUrl') as string,
                members: {
                    create: {
                        userId: user.id,
                        role: FamilyRole.LEADER,
                    }
                }
            }
        });
        revalidatePath('/family');
        return { success: `¡Familia "${newFamily.name}" creada con éxito!`, family: newFamily };
    } catch (error: any) {
        if (error.code === 'P2002') { // Prisma unique constraint violation
            return { error: "El nombre o el tag de la familia ya están en uso." };
        }
        console.error(error);
        return { error: "Ocurrió un error al crear la familia." };
    }
}

export async function inviteUserToFamily(userIdToInvite: string, familyId: string) {
    const user = await getSessionUser();
    if (!user || !user.familyMember) return { error: "No tienes permisos para invitar." };
    if (user.familyMember.familyId !== familyId) return { error: "No puedes invitar a una familia a la que no perteneces." };
    
    const role = user.familyMember.role;
    if (role !== FamilyRole.LEADER && role !== FamilyRole.CO_LEADER) {
        return { error: "Solo los líderes y co-líderes pueden enviar invitaciones." };
    }

    try {
        const invitation = await prisma.familyInvitation.create({
            data: {
                familyId: familyId,
                userId: userIdToInvite,
            }
        });
        return { success: "Invitación enviada." };
    } catch (error: any) {
         if (error.code === 'P2002') {
            return { error: "Ya existe una invitación para este usuario." };
        }
        console.error(error);
        return { error: "No se pudo enviar la invitación." };
    }
}

export async function acceptFamilyInvitation(invitationId: string) {
    const user = await getSessionUser();
    if (!user) return { error: "Usuario no autenticado." };
    if (user.familyMember) return { error: "Ya perteneces a una familia." };

    const invitation = await prisma.familyInvitation.findUnique({
        where: { id: invitationId }
    });

    if (!invitation || invitation.userId !== user.id) {
        return { error: "Invitación no válida." };
    }
    
    try {
        await prisma.$transaction([
            prisma.familyMember.create({
                data: {
                    userId: user.id,
                    familyId: invitation.familyId,
                    role: FamilyRole.MEMBER
                }
            }),
            prisma.familyInvitation.update({
                where: { id: invitationId },
                data: { status: 'ACCEPTED' }
            })
        ]);
        revalidatePath('/family');
        return { success: "¡Bienvenido a la familia!" };
    } catch(error) {
        console.error(error);
        return { error: "Error al unirse a la familia." };
    }
}


export async function leaveFamily() {
    const user = await getSessionUser();
    if (!user || !user.familyMember) return { error: "No perteneces a ninguna familia." };

    // Add logic here to handle if the user is the leader
    if (user.familyMember.role === FamilyRole.LEADER) {
        const members = await prisma.familyMember.count({
            where: { familyId: user.familyMember.familyId }
        });
        if (members > 1) {
            return { error: "Eres el líder. Debes nombrar a un nuevo líder o ser el último miembro para poder abandonar la familia." }
        }
        // If leader is the last member, the family will be deleted
    }

    try {
        await prisma.$transaction(async (tx) => {
             await tx.familyMember.delete({
                where: { userId: user.id }
            });
            const remainingMembers = await tx.familyMember.count({
                where: { familyId: user.familyMember!.familyId }
            });
            if (remainingMembers === 0) {
                await tx.family.delete({
                    where: { id: user.familyMember!.familyId }
                });
            }
        });
        
        revalidatePath('/family');
        return { success: "Has abandonado la familia." };
    } catch(error) {
        console.error(error);
        return { error: "No se pudo abandonar la familia." };
    }
}
