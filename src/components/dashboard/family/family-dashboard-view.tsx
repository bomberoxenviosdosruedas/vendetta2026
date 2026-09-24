'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FullFamily, UserWithProgress } from "@/lib/data";
import { FamilyRole } from "@prisma/client";
import MaterialIcon from "@/components/ui/material-icon";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { leaveFamily } from "@/lib/actions/family.actions";
import Link from "next/link";
import { InviteMemberDialog } from "./invite-member-dialog";

interface FamilyDashboardViewProps {
    family: FullFamily;
    currentUser: UserWithProgress;
    allUsers: { id: string; name: string; familyMember: { familyId: string; } | null; }[];
    pendingRequests: number;
}

export function FamilyDashboardView({ family, currentUser, allUsers, pendingRequests }: FamilyDashboardViewProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleLeaveFamily = () => {
        startTransition(async () => {
            const result = await leaveFamily();
             if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Has abandonado la familia', description: result.success });
            }
        });
    }

    const userRole = currentUser.familyMember?.role;
    const canManage = userRole === FamilyRole.LEADER || userRole === FamilyRole.CO_LEADER;
    const usersNotInFamily = allUsers.filter(u => !u.familyMember && u.id !== currentUser.id);

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        PANEL DE FAMILIA // [{family.tag}] {family.name}
                    </span>
                </div>

                <div className="p-3 bg-[#f1ebda] flex flex-col sm:flex-row items-center gap-4 border-b border-[#cbc4b0]">
                    <Avatar className="h-16 w-16 border-2 border-[#5a4f3d] rounded-sm bg-[#181410] shrink-0">
                        <AvatarImage src={family.avatarUrl || ''} alt={family.name} className="object-cover" />
                        <AvatarFallback className="bg-[#181410] text-[#ffe569] font-['Chivo'] font-bold">{family.tag}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                        <h2 className="text-base font-bold font-['Chivo'] text-[#801e00] uppercase">
                            [{family.tag}] {family.name}
                        </h2>
                        <p className="text-xs text-[#4a4031] mt-0.5 line-clamp-2">{family.description || "Sin descripción pública."}</p>
                    </div>
                </div>

                <div className="p-2 bg-[#dfdbc9] flex flex-wrap items-center justify-between gap-2 border-b border-[#cbc4b0]">
                    <div className="flex flex-wrap items-center gap-2">
                        {canManage && <InviteMemberDialog familyId={family.id} allUsers={usersNotInFamily} />}
                        {canManage && (
                            <Link href="/family/requests" className="retro-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1 min-h-[44px]">
                                <MaterialIcon name="badge" size={16} />
                                Solicitudes
                                {pendingRequests > 0 && <span className="timer-pill px-1.5 py-0.2 text-[10px] text-[#ff3f3f]">{pendingRequests}</span>}
                            </Link>
                        )}
                        <Link href={`/family/members?id=${family.id}`} className="retro-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1 min-h-[44px]">
                            <MaterialIcon name="group" size={16} />
                            Ver Lista de Miembros
                        </Link>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="retro-btn-dark px-3 py-1.5 text-xs font-bold min-h-[44px]">
                                ABANDONAR FAMILIA
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#161410] border-2 border-[#5a4b33] text-[#dfdbc9]">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-['Chivo'] text-[#ffe569] text-sm uppercase">¿Abandonar familia?</AlertDialogTitle>
                                <AlertDialogDescription className="text-xs text-[#a0a0a0]">
                                    Esta acción no se puede deshacer. Perderás los beneficios y la protección de la familia.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="retro-btn text-xs font-bold">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLeaveFamily} disabled={isPending} className="retro-btn-dark text-xs font-bold">
                                    {isPending ? 'PROCESANDO...' : 'Sí, abandonar'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="p-3 bg-[#dfdbc9] grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 v-outer-frame p-3 bg-[#f1ebda]">
                        <div className="v-header-c -mx-3 -mt-3 mb-2">Anuncios y Novedades</div>
                        <p className="text-xs text-center text-[#695d48] py-6 font-mono font-bold">No hay anuncios de la familia.</p>
                    </div>

                    <div className="v-outer-frame p-3 bg-[#f1ebda]">
                        <div className="v-header-c -mx-3 -mt-3 mb-2">Estadísticas</div>
                        <div className="space-y-2 text-xs font-['JetBrains_Mono']">
                            <div className="flex items-center justify-between py-1 border-b border-[#cbc4b0]">
                                <span className="text-[#554a37] font-bold">MIEMBROS:</span>
                                <span className="font-bold text-[#111]">{family.members.length}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-[#cbc4b0]">
                                <span className="text-[#554a37] font-bold">PUNTOS TOTALES:</span>
                                <span className="font-bold text-[#801e00]">[--]</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[#554a37] font-bold">POSICIÓN RANKING:</span>
                                <span className="font-bold text-[#174872]">[--]</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
