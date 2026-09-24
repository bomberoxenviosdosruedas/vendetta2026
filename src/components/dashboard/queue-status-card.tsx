'use client';

import type { UserWithProgress } from '@/lib/data';
import { MissionStatus } from './mission-status';
import { ConstructionStatus } from './construction-status';
import { RecruitmentStatus } from './recruitment-status';
import { TrainingStatus } from './training-status';

type QueueCardProps = {
  user: UserWithProgress;
  allRooms: { id: string; nombre: string; }[];
};

export function QueueStatusCard({ user, allRooms }: QueueCardProps) {
  const activeConstructions = user.propiedades
    .flatMap(p =>
      p.colaConstruccion.map(c => ({
        ...c,
        propiedadNombre: p.nombre,
        coords: `${p.ciudad}:${p.barrio}:${p.edificio}`,
      }))
    )
    .filter(c => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());

  const activeRecruitments = user.propiedades
    .filter(p => p.colaReclutamiento)
    .map(p => ({
      ...p.colaReclutamiento!,
      propiedadNombre: p.nombre,
      coords: `${p.ciudad}:${p.barrio}:${p.edificio}`,
    }));

  const trainingsWithCoords = user.colaEntrenamientos.map(t => {
    const prop = user.propiedades.find(p => p.id === t.propiedadId);
    return {
      ...t,
      coords: prop ? `${prop.ciudad}:${prop.barrio}:${prop.edificio}` : undefined,
    };
  });

  return (
    <div className="w-full space-y-2.5">
      <MissionStatus missions={user.misiones} />
      <ConstructionStatus
        constructions={activeConstructions}
        totalSlots={user.propiedades.length * 5}
        allRooms={allRooms}
      />
      <RecruitmentStatus recruitments={activeRecruitments} totalSlots={user.propiedades.length} />
      <TrainingStatus trainings={trainingsWithCoords} totalSlots={user.propiedades.length} />
    </div>
  );
}