
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { UserWithProgress } from '@/lib/data';
import { useRouter } from 'next/navigation';

function formatTime(totalSeconds: number) {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

type ConstructionQueueProps = {
    user: UserWithProgress;
    allRooms: { id: string; nombre: string; }[];
};

export function ConstructionQueue({ user, allRooms }: ConstructionQueueProps) {
    const router = useRouter();
    const [tiempoRestante, setTiempoRestante] = useState<number>(0);
    const construccionActiva = user.colaConstruccion;
    
    useEffect(() => {
        if (!construccionActiva) return;

        const fin = new Date(construccionActiva.fechaFinalizacion).getTime();

        const updateTimer = () => {
            const ahora = new Date().getTime();
            const diferencia = Math.floor((fin - ahora) / 1000);
            setTiempoRestante(diferencia);
            if (diferencia <= 0) {
                // Forzar una recarga para que el layout del servidor procese la finalización
                router.refresh();
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [construccionActiva, router]);

    if (!construccionActiva) {
        return null;
    }

    const roomConfig = allRooms.find(r => r.id === construccionActiva.habitacionId);

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-primary">En Construcción</CardTitle>
                <CardDescription>Finalización de la construcción actual.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <p className="font-semibold">
                        {roomConfig?.nombre || 'Habitación'} Nivel {construccionActiva.nivelDestino}
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-lg font-bold text-primary">
                            {formatTime(tiempoRestante)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                           <X className="h-5 w-5" />
                           <span className="sr-only">Cancelar</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
