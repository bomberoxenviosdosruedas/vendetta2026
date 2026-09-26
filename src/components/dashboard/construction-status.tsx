'use client';

import Link from "next/link";
import type { ColaConstruccion } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MaterialIcon from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

type ConstructionStatusProps = {
  constructions: (ColaConstruccion & { propiedadNombre: string; coords: string })[];
  totalSlots: number;
  allRooms: { id: string; nombre: string; }[];
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
    <span className="timer-pill text-[10px] px-1.5 py-0.5 rounded text-[#5fe06e] shrink-0">
      {timeLeft}
    </span>
  );
}

export function ConstructionStatus({ constructions, totalSlots, allRooms }: ConstructionStatusProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="v-outer-frame">
      <div className="v-header-c flex items-center justify-between px-2.5 py-2">
        <Link href="/rooms" className="flex items-center gap-1.5 hover:underline">
          <MaterialIcon name="meeting_room" size={13} className="text-[#e2ca92]" />
          <span className="font-bold text-[11px] tracking-wide">HABITACIONES EN CONSTRUCCIÓN</span>
          <span className="text-[#e2ca92] text-[10px] font-mono">({constructions.length}/{totalSlots})</span>
        </Link>
        <span className="text-[9px] bg-[#231b11] border border-[#5d4d33] text-[#ffe569] px-1.5 py-0.5 rounded font-mono font-bold">
          COLA ACTIVA
        </span>
      </div>
      <div className="border-t border-[#a89e87]">
        {constructions.length > 0 ? (
          <>
            <div className="divide-y divide-[#cec8b5]">
              {constructions.map((queueItem, index) => {
                const room = allRooms.find(r => r.id === queueItem.habitacionId);
                if (!room || !queueItem.fechaFinalizacion) return null;
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
                        <span className="font-bold text-[#1f190e] text-[11px] truncate">{room.nombre}</span>
                        <span className="bg-[#d7d0bc] border border-[#9b9077] text-[#632000] text-[9px] font-bold px-1 rounded">
                          Nivel {queueItem.nivelDestino}
                        </span>
                      </div>
                      <div className="text-[9px] text-[#665b46] flex items-center gap-1 mt-0.5">
                        <span>Base:</span>
                        <Link href="/rooms" className="font-mono text-[#1f486b] underline">
                          {queueItem.coords}
                        </Link>
                      </div>
                    </div>
                    <CountdownTimer
                      label={`${room.nombre} (Nv ${queueItem.nivelDestino})`}
                      endDate={endDate}
                      onFinish={handleRefresh}
                    />
                  </div>
                );
              })}
            </div>
            <div className="bg-[#ded7c3] border-t border-[#a89d84] p-1.5 text-center">
              <Link
                href="/rooms"
                className="underline text-[#731f00] font-bold text-[10px] hover:text-[#a00000]"
              >
                Mostrar todo el imperio ►
              </Link>
            </div>
          </>
        ) : (
          <p className="p-3 text-center text-[11px] text-[#4a4031] font-mono bg-[#f1ebda]">
            Sin obras activas
          </p>
        )}
      </div>
    </div>
  );
}