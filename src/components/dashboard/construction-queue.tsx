'use client';

import { useEffect, useState } from 'react';
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
        <section className="v-outer-frame mb-3">
            <div className="crimson-th p-2.5 flex items-center justify-between">
                <span className="font-bold text-xs tracking-wide">Cola de Construcción ({propiedad.nombre})</span>
                <div className="flex items-center gap-1.5">
                    <MaterialIcon name="schedule" size={14} className="text-[#ffe569]" />
                    <span className="text-xs text-[#ffe569]">Total:</span>
                    <span className="timer-pill px-2 py-0.5 text-xs">{formatTime(tiempoRestanteTotal)}</span>
                </div>
            </div>

            <div className="divide-y divide-[#cbc4b0]">
                {construccionesEnCola.map((colaItem, index) => {
                    const roomConfig = allRooms.find(r => r.id === colaItem.habitacionId);
                    const esActiva = colaItem.id === construccionActiva?.id;
                    return (
                        <div key={colaItem.id} className={`p-2.5 flex items-center justify-between ${esActiva ? 'bg-[#f1ebda]' : 'bg-[#e5dfcb]'} hover:bg-[#efeadd] transition-colors`}>
                            <div className="flex items-center gap-3 min-w-0">
                                {esActiva ? (
                                    <MaterialIcon name="check_circle" size={18} className="text-[#008800] animate-pulse flex-shrink-0" />
                                ) : (
                                    <MaterialIcon name="hourglass_empty" size={18} className="text-[#b35900] flex-shrink-0" />
                                )}
                                <p className="font-['Chivo'] text-sm font-bold text-[#801e00] truncate">
                                    {index + 1}. {roomConfig?.nombre || 'Habitación'} Nivel {colaItem.nivelDestino}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#a84e00]">
                                    {formatTime(colaItem.duracion)}
                                </span>
                                <button className="retro-btn-dark p-1.5 rounded-sm min-h-[40px] min-w-[40px] flex items-center justify-center" title="Cancelar construcción">
                                    <MaterialIcon name="close" size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
