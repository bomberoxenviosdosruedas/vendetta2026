'use client';

import type { UserWithProgress } from '@/lib/data';
import { MissionStatus } from './mission-status';
import { ConstructionStatus } from './construction-status';
import { RecruitmentStatus } from './recruitment-status';
import { TrainingStatus } from './training-status';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type QueueCardProps = {
  user: UserWithProgress;
  allRooms: { id: string; nombre: string; }[];
};

export function QueueStatusCard({ user, allRooms }: QueueCardProps) {
  const activeConstructions = user.propiedades
    .flatMap(p =>
      p.colaConstruccion.map(c => ({ ...c, propiedadNombre: p.nombre }))
    )
    .filter(c => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());

  const activeRecruitments = user.propiedades
    .filter(p => p.colaReclutamiento)
    .map(p => ({ ...p.colaReclutamiento!, propiedadNombre: p.nombre }));

  return (
    <div className="w-full space-y-2">
      {/* Mobile view (<640px): Accordion with Missions open by default */}
      <div className="block sm:hidden">
        <Accordion type="single" collapsible defaultValue="misiones" className="w-full space-y-1">
          <AccordionItem value="misiones" className="border-none">
            <AccordionTrigger className="crimson-th text-white px-2 py-1 text-[11px] font-['Space_Grotesk'] font-bold uppercase hover:no-underline">
              MISIONES EN CURSO ({user.misiones.length})
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <MissionStatus missions={user.misiones} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="habitaciones" className="border-none">
            <AccordionTrigger className="crimson-th text-white px-2 py-1 text-[11px] font-['Space_Grotesk'] font-bold uppercase hover:no-underline">
              HABITACIONES EN COLA ({activeConstructions.length})
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <ConstructionStatus constructions={activeConstructions} totalSlots={user.propiedades.length * 5} allRooms={allRooms} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reclutamiento" className="border-none">
            <AccordionTrigger className="crimson-th text-white px-2 py-1 text-[11px] font-['Space_Grotesk'] font-bold uppercase hover:no-underline">
              RECLUTAMIENTO EN CURSO ({activeRecruitments.length})
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <RecruitmentStatus recruitments={activeRecruitments} totalSlots={user.propiedades.length} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="entrenamiento" className="border-none">
            <AccordionTrigger className="crimson-th text-white px-2 py-1 text-[11px] font-['Space_Grotesk'] font-bold uppercase hover:no-underline">
              ENTRENAMIENTOS ({user.colaEntrenamientos.length})
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <TrainingStatus trainings={user.colaEntrenamientos} totalSlots={user.propiedades.length} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop view (≥640px): Full Grid */}
      <div className="hidden sm:flex flex-col gap-2">
        <MissionStatus missions={user.misiones} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <ConstructionStatus constructions={activeConstructions} totalSlots={user.propiedades.length * 5} allRooms={allRooms} />
          <RecruitmentStatus recruitments={activeRecruitments} totalSlots={user.propiedades.length} />
          <TrainingStatus trainings={user.colaEntrenamientos} totalSlots={user.propiedades.length} />
        </div>
      </div>
    </div>
  );
}
