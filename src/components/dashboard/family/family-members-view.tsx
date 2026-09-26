'use client';

import type { FullFamily } from "@/lib/data";
import { FamilyRole } from "@prisma/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/ui/material-icon";

interface FamilyMembersViewProps {
    family: FullFamily;
}

const roleTranslations: Record<FamilyRole, string> = {
    [FamilyRole.LEADER]: "Líder",
    [FamilyRole.CO_LEADER]: "Co-Líder",
    [FamilyRole.MEMBER]: "Miembro",
};

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

function formatLastSeen(lastSeen: Date | null): { text: string; isOnline: boolean } {
    if (!lastSeen) return { text: "Nunca", isOnline: false };
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - new Date(lastSeen).getTime()) / 1000);

    if (diffSeconds < 300) {
        return { text: "En Línea", isOnline: true };
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return { text: `Hace ${diffDays}d`, isOnline: false };
    if (diffHours > 0) return { text: `Hace ${diffHours}h`, isOnline: false };
    if (diffMinutes > 0) return { text: `Hace ${diffMinutes}m`, isOnline: false };
    return { text: "Hace un momento", isOnline: true };
}

export function FamilyMembersView({ family }: FamilyMembersViewProps) {
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000); 
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        MIEMBROS DE {family.name}
                    </span>
                    <Link href="/family" className="retro-btn text-xs px-2.5 py-1 font-bold flex items-center gap-1">
                        <MaterialIcon name="arrow_back" size={14} />
                        Volver
                    </Link>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto bg-[#f1ebda]">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr>
                                <th className="crimson-th p-1.5 text-left w-10">#</th>
                                <th className="crimson-th p-1.5 text-left">Jugador</th>
                                <th className="crimson-th p-1.5 text-left">Posición</th>
                                <th className="crimson-th p-1.5 text-right">Puntos</th>
                                <th className="crimson-th p-1.5 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#cbc4b0]">
                            {family.members.map(({ user, role }, index) => {
                                const status = formatLastSeen(user.lastSeen);
                                const isAlt = index % 2 === 1;
                                return (
                                    <tr key={user.id} className={`${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'} hover:bg-[#efeadd]`}>
                                        <td className="p-2 font-mono text-[#554a37] font-bold">{index + 1}</td>
                                        <td className="p-2 font-bold">
                                            <Link href={`/profile/${user.id}`} className="text-[#174872] hover:text-[#8b0000] underline">
                                                {user.name}
                                            </Link>
                                        </td>
                                        <td className="p-2 text-[#221c13] font-bold">
                                            {roleTranslations[role]}
                                        </td>
                                        <td className="p-2 text-right font-mono font-bold text-[#801e00]">
                                            {formatPoints(user.puntuacion?.puntosTotales)}
                                        </td>
                                        <td className={`p-2 text-right font-mono font-bold ${status.isOnline ? 'text-[#1e6b28]' : 'text-[#695d48]'}`}>
                                            {status.text}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
