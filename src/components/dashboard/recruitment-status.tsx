'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FullColaReclutamiento } from "@/lib/data";
import MaterialIcon from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

type RecruitmentStatusProps = {
  recruitments: (FullColaReclutamiento & { propiedadNombre: string; coords: string })[];
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

function CountdownTimer({ endDate, onFinish }: { endDate: string, onFinish: () => void }) {
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
    <span className="timer-pill text-[10px] px-1.5 py-0.5 rounded text-[#5fe06e] shrink-0">
      {timeLeft}
    </span>
  );
}

export function RecruitmentStatus({ recruitments, totalSlots }: RecruitmentStatusProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="v-outer-frame">
      <div className="v-header-c flex items-center justify-between px-2.5 py-2">
        <Link href="/recruitment" className="flex items-center gap-1.5 hover:underline">
          <MaterialIcon name="groups" size={13} className="text-[#e2ca92]" />
          <span className="font-bold text-[11px] tracking-wide">RECLUTAMIENTO DE MATONES</span>
          <span className="text-[#e2ca92] text-[10px] font-mono">({recruitments.length}/{totalSlots})</span>
        </Link>
        <span className="text-[9px] bg-[#231b11] border border-[#5d4d33] text-[#ffe569] px-1.5 py-0.5 rounded font-mono font-bold">
          EN PROCESO
        </span>
      </div>
      <div className="border-t border-[#a89e87]">
        {recruitments.length > 0 ? (
          <>
            <div className="divide-y divide-[#cec8b5]">
              {recruitments.map((queueItem, index) => {
                const endDate = typeof queueItem.fechaFinalizacion === 'string'
                  ? queueItem.fechaFinalizacion
                  : new Date(queueItem.fechaFinalizacion).toISOString();
                return (
                  <div
                    key={queueItem.id}
                    className={cn(
                      "p-2 flex items-center justify-between gap-1",
                      index % 2 === 0 ? "bg-[#f1ebda]" : "bg-[#e8e2d1]"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#1f190e] text-[11px] truncate">
                          {queueItem.cantidad} {queueItem.tropaConfig.nombre}
                        </span>
                        <span className="text-[9px] text-[#78694d]">• En Cuartel</span>
                      </div>
                      <div className="text-[9px] text-[#665b46] mt-0.5">
                        Base: <span className="font-mono text-[#1f486b] underline">{queueItem.coords}</span>
                      </div>
                    </div>
                    <CountdownTimer endDate={endDate} onFinish={handleRefresh} />
                  </div>
                );
              })}
            </div>
            <div className="bg-[#ded7c3] border-t border-[#a89d84] p-1.5 text-center">
              <Link
                href="/recruitment"
                className="underline text-[#731f00] font-bold text-[10px] hover:text-[#a00000]"
              >
                Mostrar todo el reclutamiento activo ►
              </Link>
            </div>
          </>
        ) : (
          <p className="p-3 text-center text-[11px] text-[#4a4031] font-mono bg-[#f1ebda]">
            Sin reclutamientos en cola
          </p>
        )}
      </div>
    </div>
  );
}