
'use client';

import type { UserWithProgress } from '@/lib/data';
import { MissionStatus } from './mission-status';
import { ConstructionStatus } from './construction-status';
import { RecruitmentStatus } from './recruitment-status';

type QueueCardProps = {
    user: UserWithProgress;
    allRooms: { id: string; nombre: string; }[];
};

export function QueueStatusCard({ user, allRooms }: QueueCardProps) {
    
    // Filtra para obtener solo las construcciones que están activamente en cuenta regresiva.
    const activeConstructions = user.propiedades
        .flatMap(p => 
            p.colaConstruccion.map(c => ({ ...c, propiedadNombre: p.nombre }))
        )
        .filter(c => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());
    
    // Cuenta el total de items en todas las colas de construcción para el slot.
    const totalConstructionQueueItems = user.propiedades.reduce((acc, p) => acc + p.colaConstruccion.length, 0);


    const activeRecruitments = user.propiedades
        .filter(p => p.colaReclutamiento)
        .map(p => ({ ...p.colaReclutamiento!, propiedadNombre: p.nombre }));

    return (
        <div className="space-y-1">
            <MissionStatus missions={user.misiones} />
            <ConstructionStatus constructions={activeConstructions} totalSlots={user.propiedades.length * 5} allRooms={allRooms} />
            <RecruitmentStatus recruitments={activeRecruitments} totalSlots={user.propiedades.length} />
             
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
