'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Hourglass, CheckCircle } from 'lucide-react';
import type { FullPropiedad } from '@/lib/data';
import { useRouter } from 'next/navigation';

function formatTime(totalSeconds: number) {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

type ConstructionQueueProps = {
    propiedad: FullPropiedad;
    allRooms: { id: string; nombre: string; }[];
};

export function ConstructionQueue({ propiedad, allRooms }: ConstructionQueueProps) {
    const router = useRouter();
    const [tiempoRestante, setTiempoRestante] = useState<number>(0);
    
    const construccionesEnCola = propiedad.colaConstruccion;
    const construccionActiva = construccionesEnCola.length > 0 ? construccionesEnCola[0] : null;

    useEffect(() => {
        if (!construccionActiva?.fechaFinalizacion) return;

        const fin = new Date(construccionActiva.fechaFinalizacion).getTime();

        const updateTimer = () => {
            const ahora = new Date().getTime();
            const diferencia = Math.floor((fin - ahora) / 1000);
            setTiempoRestante(diferencia);
            if (diferencia < 0) {
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
    
    const roomConfigActiva = allRooms.find(r => r.id === construccionActiva.habitacionId);

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-primary">Cola de Construcción ({propiedad.nombre})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Construcción Activa */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                        <p className="font-semibold">
                            {roomConfigActiva?.nombre || 'Habitación'} Nivel {construccionActiva.nivelDestino}
                        </p>
                    </div>
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

                {/* Construcciones en Espera */}
                {construccionesEnCola.slice(1).map((colaItem, index) => {
                    const roomConfigEspera = allRooms.find(r => r.id === colaItem.habitacionId);
                    return (
                        <div key={colaItem.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg text-sm">
                            <div className="flex items-center gap-2">
                                <Hourglass className="h-4 w-4 text-amber-500" />
                                <p className="text-muted-foreground">
                                   {index + 1}. {roomConfigEspera?.nombre || 'Habitación'} Nivel {colaItem.nivelDestino}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                               <X className="h-4 w-4" />
                               <span className="sr-only">Cancelar</span>
                            </Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
