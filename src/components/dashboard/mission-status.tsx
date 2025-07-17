
'use client'

import type { ColaMisiones } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Check, Shield, Swords } from "lucide-react";

type MissionStatusProps = {
    missions: ColaMisiones[];
};

const missionIcons: { [key: string]: React.ReactNode } = {
    ATAQUE: <Swords className="h-4 w-4 text-destructive" />,
    DEFENDER: <Shield className="h-4 w-4 text-blue-500" />,
    TRANSPORTE: <ArrowLeftRight className="h-4 w-4 text-green-500" />,
    ESPIONAJE: <ArrowLeftRight className="h-4 w-4 text-yellow-500" />,
    OCUPAR: <Check className="h-4 w-4 text-primary" />,
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
    const [status, setStatus] = useState<{label: string, endDate: Date | null, timeLeft: string}>({
        label: "Llegando a destino",
        endDate: mission.fechaLlegada,
        timeLeft: ""
    });

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            let currentLabel = "Llegando";
            let currentEndDate = mission.fechaLlegada?.getTime();

            if (now > mission.fechaLlegada.getTime()) {
                if (mission.fechaRegreso) {
                    currentLabel = "Regresando";
                    currentEndDate = mission.fechaRegreso.getTime();
                } else {
                    // Misión sin retorno, ya finalizada
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
            
            if (difference < 0) {
                setStatus({ label: "Completada", endDate: null, timeLeft: "" });
                router.refresh(); // La misión ha terminado, refrescar para que desaparezca
            } else {
                setStatus({ label: currentLabel, endDate: new Date(currentEndDate), timeLeft: formatTime(difference) });
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);

    }, [mission, router]);

    if (!status.endDate) return null;

    return (
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
                {missionIcons[mission.tipoMision]}
                <span>{mission.tipoMision} a {mission.destinoCiudad}:{mission.destinoBarrio}:{mission.destinoEdificio}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{status.label}</span>
                <span className="font-mono text-primary font-bold">{status.timeLeft}</span>
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
