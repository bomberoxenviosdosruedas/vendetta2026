'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FullColaEntrenamiento } from "@/lib/data";
import MaterialIcon from "@/components/ui/material-icon";

type TrainingStatusProps = {
  trainings: FullColaEntrenamiento[];
  totalSlots: number;
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

function CountdownTimer({ label, endDate, onFinish }: { label: string, endDate: string, onFinish: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const end = new Date(endDate).getTime();
    if (isNaN(end)) {
      setTimeLeft('00:00:00');
      return;
    }
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const difference = Math.floor((end - now) / 1000);

      if (difference < -1) {
        setTimeLeft('00:00:00');
        clearInterval(intervalId);
        onFinish();
      } else {
        setTimeLeft(formatTime(difference));
      }
    }, 1000);

    const now = new Date().getTime();
    const difference = Math.floor((end - now) / 1000);
    setTimeLeft(formatTime(difference > 0 ? difference : 0));

    return () => clearInterval(intervalId);
  }, [endDate, onFinish]);

  return (
    <div className="cell-dark p-1.5 flex justify-between items-center text-[10px] font-['Space_Mono']">
      <span className="font-bold text-white truncate">{label}</span>
      <span className="text-[#00ff00] font-bold tabular-nums ml-1">{timeLeft}</span>
    </div>
  );
}

export function TrainingStatus({ trainings, totalSlots }: TrainingStatusProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="cell-darker p-1.5 border border-[#333333] flex flex-col gap-1.5">
      <div className="crimson-th text-white px-2 py-0.5 flex justify-between items-center text-[10px] font-['Space_Grotesk'] font-bold uppercase">
        <span className="flex items-center gap-1">
          <MaterialIcon name="psychology" size={13} className="text-[#00ff00]" />
          ENTRENAMIENTO
        </span>
        <span className="bg-black/60 px-1 text-[#00ff00] font-['Space_Mono']">
          {trainings.length}/{totalSlots}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {trainings.length > 0 ? (
          trainings.map(queueItem => {
            const endDate = typeof queueItem.fechaFinalizacion === 'string'
              ? queueItem.fechaFinalizacion
              : new Date(queueItem.fechaFinalizacion).toISOString();
            return (
              <CountdownTimer
                key={queueItem.id}
                label={`${queueItem.entrenamiento.nombre} (Nv ${queueItem.nivelDestino})`}
                endDate={endDate}
                onFinish={handleRefresh}
              />
            );
          })
        ) : (
          <p className="text-[#888888] text-center text-[10px] font-['Space_Mono'] py-1">
            Sin investigaciones en marcha
          </p>
        )}
      </div>
    </div>
  );
}
