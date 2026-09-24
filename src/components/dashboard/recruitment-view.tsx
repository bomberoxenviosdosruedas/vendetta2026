'use client';

import Image from "next/image";
import MaterialIcon from "@/components/ui/material-icon";
import { iniciarReclutamiento } from "@/lib/actions/troop.actions";
import { useEffect, useState, useTransition } from "react";
import type { ConfiguracionTropa } from "@prisma/client";
import { Input } from "../ui/input";
import type { UserWithProgress } from "@/lib/data";
import { useProperty } from "@/contexts/property-context";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { TroopDetailsModal } from "./troop-details-modal";

function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  const suffixes = ["", "K", "M", "B", "T"];
  const i = Math.floor(Math.log10(num) / 3);
  const shortValue = (num / Math.pow(1000, i));
  return shortValue.toFixed(i > 0 ? 2 : 0) + suffixes[i];
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

type TroopWithStats = ConfiguracionTropa & {
  ataqueActual: number;
  defensaActual: number;
  capacidadActual: number;
  velocidadActual: number;
};

type RecruitmentViewProps = {
  troopConfigsWithStats: TroopWithStats[];
  user: UserWithProgress;
};

function RecruitmentQueueAlert() {
  const { selectedProperty } = useProperty();
  const [tiempoRestante, setTiempoRestante] = useState("");
  const colaReclutamiento = selectedProperty?.colaReclutamiento;

  useEffect(() => {
    if (!colaReclutamiento) return;

    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const fin = new Date(colaReclutamiento.fechaFinalizacion).getTime();
      const diferencia = Math.max(0, fin - ahora);
      setTiempoRestante(formatDuration(Math.floor(diferencia / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [colaReclutamiento]);

  if (!selectedProperty || !colaReclutamiento) return null;

  return (
    <div className="v-outer-frame p-2 flex items-center justify-between text-xs font-['JetBrains_Mono'] bg-[#f1ebda]">
      <div className="flex items-center gap-1.5 text-[#801e00] font-bold">
        <MaterialIcon name="group_add" size={16} className="text-[#801e00]" />
        <span>
          Reclutando {colaReclutamiento.cantidad}x {colaReclutamiento.tropaConfig.nombre}
        </span>
      </div>
      <span className="timer-pill px-2 py-0.5 text-xs text-[#44dd55]">{tiempoRestante}</span>
    </div>
  );
}

function TroopForm({ troopId }: { troopId: string }) {
  const { selectedProperty } = useProperty();
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const colaReclutamientoActiva = !!selectedProperty?.colaReclutamiento;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setError('');
    startTransition(async () => {
      const result = await iniciarReclutamiento(selectedProperty.id, troopId, cantidad);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <Input
        type="number"
        min="1"
        value={cantidad}
        onChange={(e) => setCantidad(Number(e.target.value))}
        className="w-16 h-11 min-h-[44px] bg-[#eee8d5] border border-[#4a3e29] text-center font-['JetBrains_Mono'] text-xs font-bold text-[#111]"
        disabled={colaReclutamientoActiva || isPending}
      />
      <button
        type="submit"
        disabled={colaReclutamientoActiva || isPending}
        className="retro-btn h-11 px-3 text-xs font-['Chivo'] font-bold min-h-[44px] min-w-[44px] disabled:opacity-50"
      >
        {isPending ? 'ENVIANDO...' : colaReclutamientoActiva ? 'EN COLA' : 'RECLUTAR'}
      </button>
      {error && <p className="text-xs text-[#c00000] font-mono">{error}</p>}
    </form>
  );
}

export function RecruitmentView({ user, troopConfigsWithStats }: RecruitmentViewProps) {
  const { selectedProperty } = useProperty();

  if (!selectedProperty) {
    return (
      <div className="v-outer-frame p-4 text-center font-mono text-[#221c13]">
        Por favor, selecciona una propiedad para reclutar tropas.
      </div>
    );
  }

  const userTroopsMap = new Map(selectedProperty.TropaUsuario.map(t => [t.configuracionTropaId, t]));

  const troopsWithCounts = troopConfigsWithStats.map(config => {
    const userTropa = userTroopsMap.get(config.id);
    return {
      ...config,
      count: userTropa ? userTropa.cantidad : 0,
    };
  });

  return (
    <div className="space-y-3 w-full">
      <section className="v-outer-frame">
        <div className="crimson-th p-2 flex items-center justify-between">
          <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
            RECLUTAMIENTO // {selectedProperty.nombre}
          </span>
        </div>

        <div className="p-2 bg-[#dfdbc9]">
          <RecruitmentQueueAlert />
        </div>

        <div className="divide-y divide-[#cbc4b0]">
          {troopsWithCounts.map((troop, idx) => {
            const isAlt = idx % 2 === 1;
            return (
              <Dialog key={troop.id}>
                <div className={`p-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center ${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'} hover:bg-[#efeadd] transition-colors`}>
                  <div className="lg:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-16 h-16 relative rounded border border-[#5a4f3d] bg-[#181410] overflow-hidden shrink-0 shadow-sm">
                      <Image
                        src={troop.urlImagen || "https://placehold.co/80x56.png"}
                        alt={troop.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold font-['Chivo'] text-[#801e00] text-sm uppercase truncate">
                        {troop.nombre}
                      </div>
                      <div className="text-xs font-['JetBrains_Mono'] font-bold text-[#221c13]">
                        EN BASE: <span className="text-[#a84e00] font-bold">( {troop.count} )</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 min-w-0">
                    <p className="text-xs text-[#4a4031] line-clamp-2 leading-tight">{troop.descripcion}</p>
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-1 sm:items-end">
                    <div className="flex flex-wrap gap-2 text-xs font-['JetBrains_Mono'] tabular-nums font-bold">
                      <span className="text-[#c00000]">ATQ: {formatNumber(troop.ataqueActual)}</span>
                      <span className="text-[#008800]">DEF: {formatNumber(troop.defensaActual)}</span>
                      <span className="text-[#8f6d00]">CAP: {formatNumber(troop.capacidadActual)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="timer-pill px-2 py-0.5 text-[11px]">
                        {formatDuration(troop.duracion)}/u
                      </span>
                      <DialogTrigger asChild>
                        <button className="retro-btn-dark p-2 rounded-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
                          <MaterialIcon name="info" size={16} />
                        </button>
                      </DialogTrigger>
                      <TroopForm troopId={troop.id} />
                    </div>
                  </div>
                </div>
                <TroopDetailsModal
                  troop={troop}
                  user={user}
                  ataqueActual={troop.ataqueActual}
                  defensaActual={troop.defensaActual}
                  capacidadActual={troop.capacidadActual}
                  velocidadActual={troop.velocidadActual}
                />
              </Dialog>
            );
          })}
        </div>
      </section>
    </div>
  );
}
