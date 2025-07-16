
'use client';

import { useEffect, useState } from 'react';
import type { FullPropiedad, UserWithProgress } from '@/lib/data';
import { useRouter } from 'next/navigation';

function formatTime(totalSeconds: number): string {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

type TimerProps = {
    label: string;
    endDate: string;
    onFinish: () => void;
};

function CountdownTimer({ label, endDate, onFinish }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const end = new Date(endDate).getTime();
        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const difference = Math.floor((end - now) / 1000);

            if (difference <= 0) {
                setTimeLeft('00:00:00');
                clearInterval(intervalId);
                onFinish();
            } else {
                setTimeLeft(formatTime(difference));
            }
        }, 1000);

        // Run once on mount
        const now = new Date().getTime();
        const difference = Math.floor((end - now) / 1000);
        setTimeLeft(formatTime(difference > 0 ? difference : 0));


        return () => clearInterval(intervalId);
    }, [endDate, onFinish]);

    return (
        <div className="flex justify-between items-center text-sm">
            <span>{label}</span>
            <span className="font-mono text-primary">{timeLeft}</span>
        </div>
    );
}

type QueueCardProps = {
    user: UserWithProgress;
    allRooms: { id: string; nombre: string; }[];
};

export function QueueStatusCard({ user, allRooms }: QueueCardProps) {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    const activeConstructions = user.propiedades
        .filter(p => p.colaConstruccion)
        .map(p => ({ ...p.colaConstruccion, propiedadNombre: p.nombre }));

    const activeRecruitments = user.propiedades
        .filter(p => p.colaReclutamiento)
        .map(p => ({ ...p.colaReclutamiento, propiedadNombre: p.nombre }));

    return (
        <div className="space-y-1">
            {/* Misiones */}
            <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-t-md flex justify-between items-center font-bold">
                <span>MISIONES</span>
                <span>(0/1)</span>
            </div>
            <div className="bg-card text-muted-foreground px-4 py-3 rounded-b-md text-center text-sm">
                Ninguna unidad en movimiento
            </div>

            {/* Construcción */}
            <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-t-md flex justify-between items-center font-bold mt-2">
                <span>HABITACIONES EN CONSTRUCCIÓN</span>
                <span>({activeConstructions.length}/{user.propiedades.length})</span>
            </div>
            <div className="bg-card text-card-foreground px-4 py-3 rounded-b-md space-y-2">
                {activeConstructions.length > 0 ? (
                    activeConstructions.map(queue => {
                        const room = allRooms.find(r => r.id === queue.habitacionId);
                        return (
                             <CountdownTimer 
                                key={queue.id}
                                label={`${queue.propiedadNombre}: ${room?.nombre || 'Hab.'} (Nvl ${queue.nivelDestino})`}
                                endDate={new Date(queue.fechaFinalizacion).toISOString()}
                                onFinish={handleRefresh}
                             />
                        )
                    })
                ) : (
                    <p className="text-muted-foreground text-center text-sm">No hay construcciones en cola.</p>
                )}
            </div>

            {/* Reclutamiento */}
             <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-t-md flex justify-between items-center font-bold mt-2">
                <span>RECLUTAMIENTO</span>
                <span>({activeRecruitments.length}/{user.propiedades.length})</span>
            </div>
            <div className="bg-card text-card-foreground px-4 py-3 rounded-b-md space-y-2">
                {activeRecruitments.length > 0 ? (
                     activeRecruitments.map(queue => (
                        <CountdownTimer 
                            key={queue.id}
                            label={`${queue.propiedadNombre}: ${queue.cantidad} x ${queue.tropaConfig.nombre}`}
                            endDate={new Date(queue.fechaFinalizacion).toISOString()}
                            onFinish={handleRefresh}
                         />
                    ))
                ) : (
                    <p className="text-muted-foreground text-center text-sm">No hay reclutamientos en cola.</p>
                )}
            </div>
             {/* Placeholder para otras colas */}
             <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-t-md flex justify-between items-center font-bold mt-2">
                <span>ENTRENAMIENTO</span>
                 <span>(0/1)</span>
            </div>
             <div className="bg-card text-muted-foreground px-4 py-3 rounded-b-md text-center text-sm">
                -
            </div>
        </div>
    );
}
