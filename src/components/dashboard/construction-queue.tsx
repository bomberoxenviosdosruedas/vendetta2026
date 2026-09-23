'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/material-icon';
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
    const [tiempoRestanteTotal, setTiempoRestanteTotal] = useState<number>(0);
    
    const construccionesEnCola = propiedad.colaConstruccion;

    useEffect(() => {
        if (construccionesEnCola.length === 0) {
            setTiempoRestanteTotal(0);
            return;
        };

        const ultimaConstruccionConFecha = [...construccionesEnCola].reverse().find(c => c.fechaFinalizacion);
        
        if (!ultimaConstruccionConFecha?.fechaFinalizacion) {
            setTiempoRestanteTotal(0);
            return;
        }

        const finTotal = new Date(ultimaConstruccionConFecha.fechaFinalizacion).getTime();

        const updateTimer = () => {
            const ahora = new Date().getTime();
            const diferencia = Math.floor((finTotal - ahora) / 1000);
            setTiempoRestanteTotal(diferencia > 0 ? diferencia : 0);
            if (diferencia < -1) { 
                router.refresh();
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [construccionesEnCola, router]);

    if (construccionesEnCola.length === 0) {
        return null;
    }
    
    const construccionActiva = construccionesEnCola.find(c => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());

    return (
        <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-primary">Cola de Construcción ({propiedad.nombre})</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MaterialIcon name="schedule" size={18} />
                    <span>Total:</span>
                    <span className="font-mono font-bold text-foreground">{formatTime(tiempoRestanteTotal)}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {construccionesEnCola.map((colaItem, index) => {
                    const roomConfig = allRooms.find(r => r.id === colaItem.habitacionId);
                    const esActiva = colaItem.id === construccionActiva?.id;
                    return (
                         <div key={colaItem.id} className={`flex items-center justify-between p-3 rounded-lg ${esActiva ? 'bg-muted/50' : 'bg-muted/20'}`}>
                            <div className="flex items-center gap-3">
                                {esActiva ? <MaterialIcon name="check_circle" size={20} className="text-green-500 animate-pulse" /> : <MaterialIcon name="hourglass_empty" size={20} className="text-amber-500" />}
                                <p className="font-semibold">
                                    {index + 1}. {roomConfig?.nombre || 'Habitación'} Nivel {colaItem.nivelDestino}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-sm font-bold text-primary">
                                    {formatTime(colaItem.duracion)}
                                </span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive">
                                   <MaterialIcon name="close" size={20} />
                                   <span className="sr-only">Cancelar</span>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
