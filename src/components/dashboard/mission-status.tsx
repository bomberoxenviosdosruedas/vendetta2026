'use client';

import type { ColaMisiones } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import MaterialIcon from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";
import { cancelarMision } from "@/lib/actions/cancel-mission.action";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type MissionStatusProps = {
  missions: ColaMisiones[];
};

const missionIconNames: { [key: string]: string } = {
  ATAQUE: 'swords',
  DEFENDER: 'shield',
  TRANSPORTE: 'local_shipping',
  ESPIONAJE: 'visibility',
  OCUPAR: 'flag',
  REGRESO: 'undo',
};

const missionTitleLabels: { [key: string]: string } = {
  ATAQUE: 'Ataque',
  DEFENDER: 'Defensa',
  TRANSPORTE: 'Transporte',
  ESPIONAJE: 'Espionaje',
  OCUPAR: 'Ocupación',
  REGRESO: 'Retorno',
};

function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}

function getTimestamp(dateValue: Date | string | null | undefined): number | null {
  if (!dateValue) return null;
  const timestamp = new Date(dateValue).getTime();
  return isNaN(timestamp) ? null : timestamp;
}

function MissionCountdown({ mission, index }: { mission: ColaMisiones; index: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<{ label: string, endDate: Date | null, timeLeft: string }>({
    label: "Calculando...",
    endDate: null,
    timeLeft: ""
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();

      let currentLabel = "Llegando";
      let currentEndTimestamp = getTimestamp(mission.fechaLlegada);

      if (mission.tipoMision === 'REGRESO') {
        currentLabel = "Regresando";
        currentEndTimestamp = getTimestamp(mission.fechaRegreso);
      } else if (currentEndTimestamp && now > currentEndTimestamp) {
        currentEndTimestamp = getTimestamp(mission.fechaRegreso);
        if (currentEndTimestamp) {
          currentLabel = "Regresando";
        } else {
          setStatus({ label: "Finalizada", endDate: null, timeLeft: "" });
          router.refresh();
          return;
        }
      }

      if (!currentEndTimestamp) {
        setStatus({ label: "Completada", endDate: null, timeLeft: "" });
        router.refresh();
        return;
      }

      const difference = Math.floor((currentEndTimestamp - now) / 1000);

      if (difference < -2) {
        setStatus({ label: "Completada", endDate: null, timeLeft: "" });
        router.refresh();
      } else {
        setStatus({ label: currentLabel, endDate: new Date(currentEndTimestamp), timeLeft: formatTime(difference) });
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [mission, router]);

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelarMision(mission.id);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: 'Misión cancelada', description: result.success });
      }
    });
  };

  if (!status.endDate && mission.tipoMision !== 'REGRESO') return null;

  const iconName = missionIconNames[mission.tipoMision] || 'radar';
  const title = missionTitleLabels[mission.tipoMision] || mission.tipoMision;
  const isReturn = mission.tipoMision === 'REGRESO';
  const originCoords = `${mission.origenCiudad}:${mission.origenBarrio}:${mission.origenEdificio}`;
  const destCoords = `${mission.destinoCiudad}:${mission.destinoBarrio}:${mission.destinoEdificio}`;
  const cancellable = !isReturn && !!getTimestamp(mission.fechaLlegada) && new Date() < new Date(getTimestamp(mission.fechaLlegada)!);

  return (
    <div
      className={cn(
        "px-2 py-1.5 flex items-center justify-between gap-2 text-[11px] border-b border-[#cfc9b5] last:border-b-0",
        index % 2 === 0 ? "bg-[#f1ebda]" : "bg-[#e9e3d2]"
      )}
    >
      {/* Timer pill */}
      <span className="timer-pill text-[11px] px-1.5 py-0.5 rounded text-center min-w-[62px] shrink-0 text-[#5fe06e]">
        {status.timeLeft || "00:00:00"}
      </span>

      {/* Tipo / título */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <MaterialIcon name={iconName} size={14} className="text-[#7d2000] shrink-0" />
        <div className="min-w-0">
          <div className="font-bold text-[#0c7017] leading-tight truncate">{title}</div>
          <div className="text-[9px] text-[#695d48] truncate">
            {isReturn ? "Tropas regresando a la base" : `En ruta hacia ${destCoords}`}
          </div>
        </div>
      </div>

      {/* Ruta origen >> destino */}
      <div className="text-right shrink-0 hidden sm:block">
        <div className="text-[10px] font-mono font-bold text-[#7d2000]">{originCoords}</div>
        <div className="text-[9px] text-[#42392b] font-mono flex items-center justify-end gap-0.5">
          <span>&gt;&gt;</span>
          <span className="text-[#174872] font-bold">{destCoords}</span>
        </div>
      </div>

      {cancellable && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 min-h-[36px] min-w-[36px] text-[#b32400] hover:text-[#8b0000] hover:bg-[#e4ddc8] p-0 shrink-0"
              disabled={isPending}
              aria-label="Cancelar misión"
            >
              <MaterialIcon name="close" size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#0d0d0d] border-[#333333] text-[#dfdbc9]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#ffdad4] font-['Chivo'] uppercase">¿Cancelar Misión?</AlertDialogTitle>
              <AlertDialogDescription className="text-[#a0a0a0]">
                La flota regresará a su propiedad de origen. El viaje de vuelta tardará el mismo tiempo que ha tardado en llegar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="btn-tactical text-xs">Continuar Misión</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={isPending} className="btn-crimson text-xs">
                {isPending ? 'Cancelando...' : 'Sí, Cancelar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

export function MissionStatus({ missions }: MissionStatusProps) {
  return (
    <div className="v-outer-frame">
      <div className="v-header-c flex items-center justify-between px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <MaterialIcon name="sync_alt" size={13} className="text-[#e2ca92]" />
          <span className="font-bold text-[11px] tracking-wide">MISIONES ACTIVAS</span>
          <span className="text-[#e2ca92] text-[10px] font-mono">({missions.length})</span>
        </div>
        <span className="text-[9px] bg-[#231b11] border border-[#5d4d33] text-[#5fe06e] px-1.5 py-0.5 rounded font-mono font-bold">
          {missions.length > 0 ? `${missions.length} EN RUTA` : 'SIN FLOTAS'}
        </span>
      </div>
      {missions.length > 0 ? (
        <div className="divide-y divide-[#cec8b5] border-t border-[#a89e87]">
          {missions.map((mission, index) => (
            <MissionCountdown key={mission.id} mission={mission} index={index} />
          ))}
        </div>
      ) : (
        <p className="p-3 text-center text-[11px] text-[#4a4031] font-mono bg-[#f1ebda] border-t border-[#a89e87]">
          Sin flotas ni misiones activas
        </p>
      )}
    </div>
  );
}