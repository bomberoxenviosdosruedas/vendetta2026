'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import MaterialIcon from "@/components/ui/material-icon";
import { iniciarEntrenamiento } from "@/lib/actions/training.actions";
import type { FullConfiguracionEntrenamiento, UserWithProgress } from "@/lib/data";
import { useProperty } from "@/contexts/property-context";
import { useEffect, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

function formatNumber(num: number): string {
  return num.toLocaleString('de-DE');
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s";
  const units: { name: string, seconds: number }[] = [
    { name: 'a', seconds: 31536000 },
    { name: 's', seconds: 604800 },
    { name: 'd', seconds: 86400 },
    { name: 'h', seconds: 3600 },
    { name: 'm', seconds: 60 },
    { name: 's', seconds: 1 }
  ];
  let remainingSeconds = seconds;
  let result = '';
  let parts = 0;
  for (const unit of units) {
    if (remainingSeconds >= unit.seconds && parts < 3) {
      const amount = Math.floor(remainingSeconds / unit.seconds);
      if (amount > 0) {
        result += `${amount}${unit.name} `;
        remainingSeconds %= unit.seconds;
        parts++;
      }
    }
  }
  return result.trim() || '0s';
}

function TrainingQueueAlert({ user }: { user: UserWithProgress }) {
  const { selectedProperty } = useProperty();
  const [tiempoRestante, setTiempoRestante] = useState("");
  const colaEntrenamiento = user.colaEntrenamientos.find(c => c.propiedadId === selectedProperty?.id);

  useEffect(() => {
    if (!colaEntrenamiento) return;

    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const fin = new Date(colaEntrenamiento.fechaFinalizacion).getTime();
      const diferencia = Math.max(0, fin - ahora);
      setTiempoRestante(formatDuration(Math.floor(diferencia / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [colaEntrenamiento]);

  if (!selectedProperty || !colaEntrenamiento) return null;

  return (
    <div className="cell-dark border-[#00ff00] p-2 flex items-center justify-between text-xs font-['Space_Mono']">
      <div className="flex items-center gap-1.5 text-white">
        <MaterialIcon name="psychology" size={16} className="text-[#00ff00]" />
        <span>
          Entrenando {colaEntrenamiento.entrenamiento.nombre} a Nivel {colaEntrenamiento.nivelDestino}
        </span>
      </div>
      <span className="text-[#fff400] font-bold tabular-nums">{tiempoRestante}</span>
    </div>
  );
}

function TrainingForm({
  training,
  propertyId,
  meetsRequirements,
  requirementsText,
  isTrainingInQueue,
  isPropertyBusy
}: {
  training: TrainingData,
  propertyId: string,
  meetsRequirements: boolean,
  requirementsText: string | null,
  isTrainingInQueue: boolean,
  isPropertyBusy: boolean
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAction = async () => {
    startTransition(async () => {
      const result = await iniciarEntrenamiento(training.id, propertyId);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else if (result.success) {
        toast({ title: 'Éxito', description: result.success });
      }
    });
  };

  const isDisabled = isPending || !meetsRequirements || isTrainingInQueue || isPropertyBusy;

  const button = (
    <Button
      type="submit"
      disabled={isDisabled}
      className="btn-crimson h-11 px-3 text-xs font-['Space_Grotesk'] font-bold min-h-[44px] min-w-[44px]"
    >
      {isPending ? 'ENVIANDO...' : isTrainingInQueue ? 'EN COLA' : isPropertyBusy ? 'OCUPADO' : 'ENTRENAR'}
    </Button>
  );

  return (
    <form action={handleAction}>
      {meetsRequirements ? (
        button
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild><span tabIndex={0}>{button}</span></TooltipTrigger>
            <TooltipContent className="bg-[#0d0d0d] border-[#333333] text-[#dfdbc9] text-xs font-mono">
              <p>Requisitos:</p>
              <p className="font-bold text-[#ff3f3f]">{requirementsText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </form>
  );
}

type TrainingData = FullConfiguracionEntrenamiento & {
  nivel: number;
  costos: {
    armas: number;
    municion: number;
    dolares: number;
  };
  tiempo: number;
  meetsRequirements: boolean;
  requirementsText: string | null;
};

interface TrainingViewProps {
  user: UserWithProgress;
  trainingsData: TrainingData[];
}

export function TrainingView({ user, trainingsData }: TrainingViewProps) {
  const { selectedProperty } = useProperty();

  if (!selectedProperty) {
    return (
      <div className="cell-darker p-4 border border-[#333333] text-center font-mono text-[#a0a0a0]">
        Selecciona una propiedad para ver los entrenamientos.
      </div>
    );
  }

  const isPropertyBusy = user.colaEntrenamientos.some(c => c.propiedadId === selectedProperty.id);

  return (
    <div className="space-y-2 w-full text-[#dfdbc9]">
      <div className="crimson-th p-2 text-white font-['Space_Grotesk'] font-bold text-sm uppercase flex items-center justify-between">
        <span>CENTRO DE ENTRENAMIENTO // {selectedProperty.nombre}</span>
      </div>

      <TrainingQueueAlert user={user} />

      <div className="cell-darker divide-y divide-[#222222] border border-[#333333]">
        {trainingsData.map((training) => {
          const isTrainingInQueue = user.colaEntrenamientos.some(c => c.entrenamientoId === training.id);
          return (
            <div key={training.id} className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-3 items-center hover:bg-[#141414] transition-colors">
              <div className="xl:col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-16 sm:w-20 h-16 relative rounded border border-[#333333] bg-black overflow-hidden shrink-0">
                  <Image
                    src={training.urlImagen || "https://placehold.co/80x56.png"}
                    alt={training.nombre}
                    fill
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-bold font-['Space_Grotesk'] text-white text-sm uppercase truncate">
                    {training.nombre}
                  </div>
                  <div className="text-xs font-['Space_Mono'] text-[#00ff00]">
                    NIVEL {training.nivel}
                  </div>
                  {isTrainingInQueue && (
                    <div className="text-[10px] text-[#fabd00] font-['Space_Mono'] flex items-center gap-1">
                      <MaterialIcon name="hourglass_top" size={12} /> EN COLA
                    </div>
                  )}
                </div>
              </div>

              <div className="xl:col-span-4 min-w-0">
                <p className="text-xs text-[#a0a0a0] line-clamp-2">
                  Investigación de {training.nombre.toLowerCase()} para potenciar la organización.
                </p>
              </div>

              <div className="xl:col-span-4 flex flex-col gap-1 sm:items-end">
                <div className="text-xs font-['Space_Grotesk'] text-[#ffdad4] uppercase font-bold">
                  SIGUIENTE: NIVEL {training.nivel + 1}
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-['Space_Mono'] tabular-nums text-white">
                  {training.costos.armas > 0 && <span className="text-[#ee7000]">ARMAS: {formatNumber(training.costos.armas)}</span>}
                  {training.costos.municion > 0 && <span className="text-[#fabd00]">MUN: {formatNumber(training.costos.municion)}</span>}
                  {training.costos.dolares > 0 && <span className="text-[#00ff00]">$ {formatNumber(training.costos.dolares)}</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-['Space_Mono'] text-[#888888]">
                    {formatDuration(training.tiempo)}
                  </span>
                  <TrainingForm
                    training={training}
                    propertyId={selectedProperty.id}
                    meetsRequirements={training.meetsRequirements}
                    requirementsText={training.requirementsText}
                    isTrainingInQueue={isTrainingInQueue}
                    isPropertyBusy={isPropertyBusy}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
