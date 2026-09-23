'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FullColaReclutamiento } from "@/lib/data";
import MaterialIcon from "@/components/ui/material-icon";

type RecruitmentStatusProps = {
  recruitments: (FullColaReclutamiento & { propiedadNombre: string })[];
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

      if (difference <= 0) {
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
      <span className="font-bold text-[#ffdad4] truncate">{label}</span>
      <span className="text-[#fabd00] font-bold tabular-nums ml-1">{timeLeft}</span>
    </div>
  );
}

export function RecruitmentStatus({ recruitments, totalSlots }: RecruitmentStatusProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="cell-darker p-1.5 border border-[#333333] flex flex-col gap-1.5">
      <div className="crimson-th text-white px-2 py-0.5 flex justify-between items-center text-[10px] font-['Space_Grotesk'] font-bold uppercase">
        <span className="flex items-center gap-1">
          <MaterialIcon name="group_add" size={13} className="text-[#ff3f3f]" />
          RECLUTAMIENTO
        </span>
        <span className="bg-black/60 px-1 text-[#ff3f3f] font-['Space_Mono']">
          {recruitments.length}/{totalSlots}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {recruitments.length > 0 ? (
          recruitments.map(queueItem => {
            const endDate = typeof queueItem.fechaFinalizacion === 'string'
              ? queueItem.fechaFinalizacion
              : new Date(queueItem.fechaFinalizacion).toISOString();
            return (
              <CountdownTimer
                key={queueItem.id}
                label={`${queueItem.cantidad} ${queueItem.tropaConfig.nombre}`}
                endDate={endDate}
                onFinish={handleRefresh}
              />
            );
          })
        ) : (
          <p className="text-[#888888] text-center text-[10px] font-['Space_Mono'] py-1">
            Sin reclutamientos en cola
          </p>
        )}
      </div>
    </div>
  );
}
