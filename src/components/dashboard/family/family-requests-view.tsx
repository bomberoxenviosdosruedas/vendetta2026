'use client';

import { FullFamilyInvitation } from "@/lib/data";
import { useTransition } from "react";
import { acceptRequest, rejectInvitation } from "@/lib/actions/family.actions";
import { useToast } from "@/hooks/use-toast";
import MaterialIcon from "@/components/ui/material-icon";
import Link from "next/link";

interface FamilyRequestsViewProps {
    requests: FullFamilyInvitation[];
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function FamilyRequestsView({ requests }: FamilyRequestsViewProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAction = (action: 'accept' | 'reject', invitationId: string) => {
        startTransition(async () => {
            const result = action === 'accept' 
                ? await acceptRequest(invitationId)
                : await rejectInvitation(invitationId);
            
            if(result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: result.success });
            }
        });
    };

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        SOLICITUDES PARA UNIRSE
                    </span>
                    <Link href="/family" className="retro-btn text-xs px-2.5 py-1 font-bold flex items-center gap-1">
                        <MaterialIcon name="arrow_back" size={14} />
                        Volver
                    </Link>
                </div>

                <div className="p-3 bg-[#f1ebda]">
                    {requests.length === 0 ? (
                        <p className="text-center text-[#695d48] font-mono font-bold text-xs py-6">No hay solicitudes pendientes.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr>
                                        <th className="crimson-th p-1.5 text-left">Jugador</th>
                                        <th className="crimson-th p-1.5 text-right">Puntos</th>
                                        <th className="crimson-th p-1.5 text-right">Fecha Solicitud</th>
                                        <th className="crimson-th p-1.5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#cbc4b0]">
                                    {requests.map((req, idx) => {
                                        const isAlt = idx % 2 === 1;
                                        return (
                                            <tr key={req.id} className={`${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'}`}>
                                                <td className="p-2 font-bold text-[#801e00]">{req.user.name}</td>
                                                <td className="p-2 text-right font-mono font-bold text-[#111]">{formatPoints(req.user.puntuacion?.puntosTotales)}</td>
                                                <td className="p-2 text-right font-mono text-[#554a37]">{new Date(req.createdAt).toLocaleDateString('es-ES')}</td>
                                                <td className="p-2 text-right space-x-1">
                                                    <button onClick={() => handleAction('accept', req.id)} disabled={isPending} className="retro-btn px-2 py-1 text-xs font-bold min-h-[44px]">
                                                        ACEPTAR
                                                    </button>
                                                    <button onClick={() => handleAction('reject', req.id)} disabled={isPending} className="retro-btn-dark px-2 py-1 text-xs font-bold min-h-[44px]">
                                                        RECHAZAR
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
