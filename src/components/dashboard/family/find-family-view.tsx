'use client';

import { FullFamily, FullFamilyInvitation } from "@/lib/data";
import { applyToFamily, rejectInvitation } from "@/lib/actions/family.actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import MaterialIcon from "@/components/ui/material-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { InvitationType } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { acceptFamilyInvitation } from "@/lib/actions/family.actions";

interface FindFamilyViewProps {
    families: FullFamily[];
    userInvitations: FullFamilyInvitation[];
    currentUserId: string;
}

function ActionButton({ familyId, userInvitations }: { familyId: string, userInvitations: FullFamilyInvitation[] }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const existingRequest = userInvitations.find(inv => inv.familyId === familyId && inv.type === InvitationType.REQUEST);

    const handleApply = () => {
        startTransition(async () => {
            const result = await applyToFamily(familyId);
            if(result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Solicitud enviada correctamente.' });
            }
        });
    }

    if(existingRequest) {
        return (
            <span className="timer-pill px-2 py-1 text-xs text-[#ffe569]">PENDIENTE</span>
        );
    }

    return (
        <button className="retro-btn text-xs px-3 py-1 font-bold min-h-[44px]" onClick={handleApply} disabled={isPending}>
            {isPending ? 'ENVIANDO...' : 'SOLICITAR MISION'}
        </button>
    );
}

export function FindFamilyView({ families, userInvitations, currentUserId }: FindFamilyViewProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const filteredFamilies = families.filter(family => 
        family.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        family.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInvitationAction = (action: 'accept' | 'reject', invitationId: string) => {
        startTransition(async () => {
            const result = action === 'accept'
                ? await acceptFamilyInvitation(invitationId)
                : await rejectInvitation(invitationId);
            
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: result.success });
            }
        });
    }

    const familyInvitations = userInvitations.filter(inv => inv.type === 'INVITATION');

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        BÚSQUEDA DE FAMILIAS
                    </span>
                    <Link href="/family" className="retro-btn text-xs px-2.5 py-1 font-bold flex items-center gap-1">
                        <MaterialIcon name="arrow_back" size={14} />
                        Volver
                    </Link>
                </div>

                <Tabs defaultValue="search" className="w-full p-3 bg-[#dfdbc9]">
                    <TabsList className="grid w-full grid-cols-2 bg-[#c7c2b0] border border-[#555] p-1 mb-3">
                        <TabsTrigger value="search" className="retro-btn text-xs font-bold py-1.5 data-[state=active]:bg-[#eee8d5]">
                            Buscar Familia
                        </TabsTrigger>
                        <TabsTrigger value="invitations" className="retro-btn text-xs font-bold py-1.5 data-[state=active]:bg-[#eee8d5]">
                            Invitaciones
                            {familyInvitations.length > 0 && <span className="timer-pill px-1.5 py-0.2 text-[10px] text-[#ff3f3f] ml-1.5">{familyInvitations.length}</span>}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="space-y-3">
                        <Input
                            placeholder="Buscar por nombre o tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#f1ebda] border-[#4a3e29] text-[#111] font-bold text-xs h-9"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredFamilies.map(family => (
                                <div key={family.id} className="v-outer-frame p-3 bg-[#f1ebda] flex flex-col justify-between">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Avatar className="h-12 w-12 border border-[#5a4f3d] rounded-sm bg-[#181410]">
                                            <AvatarImage src={family.avatarUrl || ''} />
                                            <AvatarFallback className="bg-[#181410] text-[#ffe569] font-bold">{family.tag}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-bold text-xs font-['Chivo'] text-[#801e00]">[{family.tag}] {family.name}</h4>
                                            <p className="text-[10px] text-[#695d48] font-bold">{family.members.length} miembros</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#4a4031] line-clamp-2 my-2">{family.description || "Sin descripción."}</p>
                                    <div className="pt-2 border-t border-[#cbc4b0] flex justify-between items-center">
                                        <span className="text-xs font-bold font-mono text-[#111]">PUNTOS: --</span>
                                        <ActionButton familyId={family.id} userInvitations={userInvitations}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="invitations">
                        {familyInvitations.length > 0 ? (
                            <div className="space-y-2">
                                {familyInvitations.map(inv => (
                                    <div key={inv.id} className="v-outer-frame p-3 bg-[#f1ebda] flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-[#5a4f3d] rounded-sm bg-[#181410]">
                                                <AvatarImage src={inv.family.avatarUrl || ''}/>
                                                <AvatarFallback className="bg-[#181410] text-[#ffe569] font-bold">{inv.family.tag}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-xs text-[#801e00]">[{inv.family.tag}] {inv.family.name}</p>
                                                <p className="text-[11px] text-[#4a4031]">Te ha invitado a unirte a sus filas.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button className="retro-btn text-xs px-3 py-1.5 font-bold min-h-[44px]" onClick={() => handleInvitationAction('accept', inv.id)} disabled={isPending}>
                                                ACEPTAR
                                            </button>
                                            <button className="retro-btn-dark text-xs px-3 py-1.5 font-bold min-h-[44px]" onClick={() => handleInvitationAction('reject', inv.id)} disabled={isPending}>
                                                RECHAZAR
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-[#695d48] font-mono text-xs py-8">No tienes invitaciones pendientes.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </section>
        </div>
    );
}
