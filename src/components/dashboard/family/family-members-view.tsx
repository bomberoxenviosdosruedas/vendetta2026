
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FullFamily } from "@/lib/data";
import { FamilyRole } from "@prisma/client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

function formatLastSeen(lastSeen: Date): string {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - new Date(lastSeen).getTime()) / 1000);

    if (diffSeconds < 300) { // 5 minutes threshold for 'Online'
        return "En Línea";
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMinutes > 0) return `${diffMinutes}m`;
    return "En Línea";
}


export function FamilyMembersView({ family }: FamilyMembersViewProps) {
    // We need a state to force re-rendering for the countdown
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Miembros de {family.name}</h2>
                    <p className="text-muted-foreground">
                        Lista de todos los jugadores de tu familia.
                    </p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/family">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a la Familia
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Jugador</TableHead>
                                <TableHead>Posición</TableHead>
                                <TableHead className="text-right">Puntos</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {family.members.map(({ user, role }) => {
                                const status = formatLastSeen(user.lastSeen);
                                const isOnline = status === "En Línea";

                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{roleTranslations[role]}</TableCell>
                                        <TableCell className="text-right font-mono">{formatPoints(user.puntuacion?.puntosTotales)}</TableCell>
                                        <TableCell className={cn("text-right font-mono", isOnline ? "text-green-500" : "text-red-500")}>
                                            {status}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
