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

function MissionCountdown({ mission }: { mission: ColaMisiones }) {
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

  return (
    <div className="cell-dark p-1.5 flex justify-between items-center text-[11px] font-['Space_Mono']">
      <div className="flex items-center gap-1.5 min-w-0">
        <MaterialIcon name={iconName} size={15} className="text-[#fabd00]" />
        <span className="truncate text-white font-bold">
          {mission.tipoMision} a {mission.destinoCiudad}:{mission.destinoBarrio}:{mission.destinoEdificio}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-[#888888] hidden sm:inline">{status.label}</span>
        <span className="text-[#fff400] font-bold text-[12px] tabular-nums">{status.timeLeft}</span>
        {mission.tipoMision !== 'REGRESO' && getTimestamp(mission.fechaLlegada) && new Date() < new Date(getTimestamp(mission.fechaLlegada)!) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-[#ff3f3f] hover:text-white p-0" disabled={isPending}>
                <MaterialIcon name="close" size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0d0d0d] border-[#333333] text-[#dfdbc9]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#ffdad4] font-['Space_Grotesk'] uppercase">¿Cancelar Misión?</AlertDialogTitle>
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
    </div>
  );
}

export function MissionStatus({ missions }: MissionStatusProps) {
  return (
    <div className="cell-darker p-1.5 border border-[#333333] flex flex-col gap-1.5">
      <div className="crimson-th text-white px-2 py-0.5 flex justify-between items-center text-[10px] font-['Space_Grotesk'] font-bold uppercase">
        <span className="flex items-center gap-1">
          <MaterialIcon name="radar" size={13} className="text-[#00ff00]" />
          MONITOREO DE MISIONES
        </span>
        <span className="bg-black/60 px-1 text-[#00ff00] font-['Space_Mono']">
          {missions.length}/12
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {missions.length > 0 ? (
          missions.map(mission => (
            <MissionCountdown key={mission.id} mission={mission} />
          ))
        ) : (
          <p className="text-[#888888] text-center text-[10px] font-['Space_Mono'] py-1">
            Sin flotas ni misiones activas
          </p>
        )}
      </div>
    </div>
  );
}
