
'use client'

import type { ColaMisiones } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeftRight, Check, Shield, Swords, Undo2, X } from "lucide-react";
import { Button } from "../ui/button";
import { cancelarMision } from "@/lib/actions/mission.actions";
import { useToast } from "@/hooks/use-toast";
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
  } from "@/components/ui/alert-dialog"

type MissionStatusProps = {
    missions: ColaMisiones[];
};

const missionIcons: { [key: string]: React.ReactNode } = {
    ATAQUE: <Swords className="h-4 w-4 text-destructive" />,
    DEFENDER: <Shield className="h-4 w-4 text-blue-500" />,
    TRANSPORTE: <ArrowLeftRight className="h-4 w-4 text-green-500" />,
    ESPIONAJE: <ArrowLeftRight className="h-4 w-4 text-yellow-500" />,
    OCUPAR: <Check className="h-4 w-4 text-primary" />,
    REGRESO: <Undo2 className="h-4 w-4 text-gray-400" />,
};

function formatTime(totalSeconds: number): string {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

function MissionCountdown({ mission }: { mission: ColaMisiones }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [status, setStatus] = useState<{label: string, endDate: Date | null, timeLeft: string}>({
        label: "Calculando...",
        endDate: null,
        timeLeft: ""
    });

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            
            let currentLabel = "Llegando";
            let currentEndDate: number | null = mission.fechaLlegada?.getTime();

            if (mission.tipoMision === 'REGRESO') {
                currentLabel = "Regresando";
                currentEndDate = mission.fechaRegreso?.getTime() || null;
            } else if (now > mission.fechaLlegada.getTime()) {
                if (mission.fechaRegreso) {
                    currentLabel = "Regresando";
                    currentEndDate = mission.fechaRegreso.getTime();
                } else {
                    setStatus({ label: "Finalizada", endDate: null, timeLeft: "" });
                    router.refresh();
                    return;
                }
            }
            
            if (!currentEndDate) {
                setStatus({ label: "Completada", endDate: null, timeLeft: "" });
                 router.refresh();
                return;
            }

            const difference = Math.floor((currentEndDate - now) / 1000);
            
            if (difference < -2) { // Allow a 2-second grace period
                setStatus({ label: "Completada", endDate: null, timeLeft: "" });
                router.refresh();
            } else {
                setStatus({ label: currentLabel, endDate: new Date(currentEndDate), timeLeft: formatTime(difference) });
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);

    }, [mission, router]);

    const handleCancel = () => {
        startTransition(async () => {
            const result = await cancelarMision(mission.id);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Misión cancelada', description: result.success });
            }
        });
    };

    if (!status.endDate && mission.tipoMision !== 'REGRESO') return null;

    return (
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
                {missionIcons[mission.tipoMision]}
                <span>{mission.tipoMision} a {mission.destinoCiudad}:{mission.destinoBarrio}:{mission.destinoEdificio}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{status.label}</span>
                <span className="font-mono text-primary font-bold">{status.timeLeft}</span>
                {mission.tipoMision !== 'REGRESO' && new Date() < new Date(mission.fechaLlegada) && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" disabled={isPending}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>¿Cancelar Misión?</AlertDialogTitle>
                            <AlertDialogDescription>
                                La flota regresará a su propiedad de origen. El viaje de vuelta tardará el mismo tiempo que ha tardado en llegar hasta su posición actual. ¿Estás seguro?
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>No, continuar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancel} disabled={isPending}>
                                {isPending ? 'Cancelando...' : 'Sí, cancelar misión'}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}


export function MissionStatus({ missions }: MissionStatusProps) {
    return (
        <div className="space-y-1">
            <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-t-md flex justify-between items-center font-bold">
                <span>MISIONES</span>
                <span>({missions.length}/1)</span>
            </div>
            <div className="bg-card text-card-foreground px-4 py-3 rounded-b-md space-y-2">
                {missions.length > 0 ? (
                    missions.map(mission => (
                        <MissionCountdown key={mission.id} mission={mission} />
                    ))
                ) : (
                    <p className="text-muted-foreground text-center text-sm">Ninguna unidad en movimiento</p>
                )}
            </div>
        </div>
    )
}
