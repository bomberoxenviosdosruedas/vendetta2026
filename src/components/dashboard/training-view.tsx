'use client';

import Image from "next/image";
import { resolveConfigImageUrl } from "@/lib/config-images";
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
    <div className="v-outer-frame p-2.5 flex items-center justify-between text-sm font-['JetBrains_Mono'] bg-[#f1ebda]">
      <div className="flex items-center gap-2 text-[#221c13] font-bold">
        <MaterialIcon name="psychology" size={18} className="text-[#008800]" />
        <span>
          Entrenando {colaEntrenamiento.entrenamiento.nombre} a Nivel {colaEntrenamiento.nivelDestino}
        </span>
      </div>
      <span className="timer-pill px-3 py-0.5 text-sm text-[#44dd55]">{tiempoRestante}</span>
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
    <button
      type="submit"
      disabled={isDisabled}
      className="retro-btn text-xs px-3 py-1.5 rounded-sm min-h-[44px] disabled:opacity-50 font-bold"
    >
      {isPending ? 'ENVIANDO...' : isTrainingInQueue ? 'EN COLA' : isPropertyBusy ? 'OCUPADO' : 'ENTRENAR'}
    </button>
  );

  return (
    <form action={handleAction}>
      {meetsRequirements ? (
        button
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild><span tabIndex={0}>{button}</span></TooltipTrigger>
            <TooltipContent className="bg-[#1a1711] border-[#4a3e2b] text-[#dfdbc9] text-xs font-mono">
              <p className="font-bold text-[#ffe569]">Requisitos:</p>
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
      <div className="v-outer-frame p-4 text-center font-mono text-[#221c13]">
        Selecciona una propiedad para ver los entrenamientos.
      </div>
    );
  }

  const isPropertyBusy = user.colaEntrenamientos.some(c => c.propiedadId === selectedProperty.id);

  return (
    <div className="space-y-3 w-full">
      <section className="v-outer-frame">
        <div className="crimson-th p-2.5 flex items-center justify-between">
          <span className="font-['Chivo'] font-bold text-sm uppercase tracking-wider">
            CENTRO DE ENTRENAMIENTO // {selectedProperty.nombre}
          </span>
        </div>

        <div className="p-2 bg-[#dfdbc9]">
          <TrainingQueueAlert user={user} />
        </div>

        <div className="divide-y divide-[#cbc4b0]">
          {trainingsData.map((training, idx) => {
            const isAlt = idx % 2 === 1;
            const isTrainingInQueue = user.colaEntrenamientos.some(c => c.entrenamientoId === training.id);
            return (
              <div key={training.id} className={`p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-start ${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'} hover:bg-[#efeadd] transition-colors`}>
                <div className="lg:col-span-4 flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 relative rounded border-2 border-[#5a4f3d] bg-[#181410] overflow-hidden shrink-0 shadow-sm flex-shrink-0">
                    <Image
                      src={resolveConfigImageUrl(training.urlImagen) || "https://placehold.co/80x56.png"}
                      alt={training.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold font-['Chivo'] text-[#801e00] text-base uppercase truncate">
                      {training.nombre}
                    </div>
                    <div className="text-sm font-['JetBrains_Mono'] font-bold text-[#008800] mt-0.5">
                      NIVEL {training.nivel}
                    </div>
                    {isTrainingInQueue && (
                      <div className="text-sm text-[#b35900] font-['JetBrains_Mono'] flex items-center gap-1.5 font-bold mt-1">
                        <MaterialIcon name="hourglass_top" size={14} /> EN COLA
                      </div>
                    )}
                    {!training.meetsRequirements && training.requirementsText && (
                      <div className="text-xs text-[#c0392b] font-['JetBrains_Mono'] mt-1">
                        Requiere: {training.requirementsText}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 min-w-0">
                  <p className="text-sm text-[#4a4031] leading-relaxed line-clamp-3">
                    Especialización operativa de {training.nombre.toLowerCase()} para perfeccionar tu organización.
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-2 sm:items-end">
                  <div className="text-sm font-['Chivo'] text-[#221c13] uppercase font-bold tracking-wide">
                    SIGUIENTE: NIVEL {training.nivel + 1}
                  </div>
                  <div className="flex flex-wrap gap-2.5 text-sm font-['JetBrains_Mono'] tabular-nums font-bold">
                    {training.costos.armas > 0 && (
                      <span className="text-[#a84e00] flex items-center gap-1">
                        <MaterialIcon name="swords" size={12} /> ARMAS: {formatNumber(training.costos.armas)}
                      </span>
                    )}
                    {training.costos.municion > 0 && (
                      <span className="text-[#8f6d00] flex items-center gap-1">
                        <MaterialIcon name="av_timer" size={12} /> MUN: {formatNumber(training.costos.municion)}
                      </span>
                    )}
                    {training.costos.dolares > 0 && (
                      <span className="text-[#007000] flex items-center gap-1">
                        <MaterialIcon name="attach_money" size={12} /> $ {formatNumber(training.costos.dolares)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="timer-pill px-3 py-0.5 text-sm">
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
      </section>
    </div>
  );
}
