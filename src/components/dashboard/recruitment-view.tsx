'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
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
    <div className="cell-dark border-[#ff3f3f] p-2 flex items-center justify-between text-xs font-['JetBrains_Mono']">
      <div className="flex items-center gap-1.5 text-[#ffdad4]">
        <MaterialIcon name="group_add" size={16} className="text-[#ff3f3f]" />
        <span>
          Reclutando {colaReclutamiento.cantidad}x {colaReclutamiento.tropaConfig.nombre}
        </span>
      </div>
      <span className="text-[#00ff00] font-bold tabular-nums">{tiempoRestante}</span>
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
        className="w-16 h-11 min-h-[44px] bg-black border-[#333333] text-center font-['JetBrains_Mono'] text-xs font-bold text-[#fff400]"
        disabled={colaReclutamientoActiva || isPending}
      />
      <Button
        type="submit"
        disabled={colaReclutamientoActiva || isPending}
        className="btn-crimson h-11 px-3 text-xs font-['Chivo'] font-bold min-h-[44px] min-w-[44px]"
      >
        {isPending ? 'ENVIANDO...' : colaReclutamientoActiva ? 'EN COLA' : 'RECLUTAR'}
      </Button>
      {error && <p className="text-xs text-[#ff3f3f] font-mono">{error}</p>}
    </form>
  );
}

export function RecruitmentView({ user, troopConfigsWithStats }: RecruitmentViewProps) {
  const { selectedProperty } = useProperty();

  if (!selectedProperty) {
    return (
      <div className="cell-darker p-4 border border-[#333333] text-center font-mono text-[#a0a0a0]">
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
    <div className="space-y-2 w-full text-[#dfdbc9]">
      <div className="crimson-th p-2 text-white font-['Chivo'] font-bold text-sm uppercase flex items-center justify-between">
        <span>RECLUTAMIENTO // {selectedProperty.nombre}</span>
      </div>

      <RecruitmentQueueAlert />

      <div className="cell-darker divide-y divide-[#222222] border border-[#333333]">
        {troopsWithCounts.map((troop) => (
          <Dialog key={troop.id}>
            <div className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-3 items-center hover:bg-[#141414] transition-colors">
              <div className="xl:col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-16 sm:w-20 h-16 relative rounded border border-[#333333] bg-black overflow-hidden shrink-0">
                  <Image
                    src={troop.urlImagen || "https://placehold.co/80x56.png"}
                    alt={troop.nombre}
                    fill
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-bold font-['Chivo'] text-white text-sm uppercase truncate">
                    {troop.nombre}
                  </div>
                  <div className="text-xs font-['JetBrains_Mono'] text-[#fff400]">
                    EN PROPIEDAD: {troop.count}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-4 min-w-0">
                <p className="text-xs text-[#a0a0a0] line-clamp-2">{troop.descripcion}</p>
              </div>

              <div className="xl:col-span-4 flex flex-col gap-1 sm:items-end">
                <div className="flex flex-wrap gap-2 text-xs font-['JetBrains_Mono'] tabular-nums text-white">
                  <span className="text-[#ff3f3f]">ATQ: {formatNumber(troop.ataqueActual)}</span>
                  <span className="text-[#00ff00]">DEF: {formatNumber(troop.defensaActual)}</span>
                  <span className="text-[#fabd00]">CAP: {formatNumber(troop.capacidadActual)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-['JetBrains_Mono'] text-[#888888]">
                    {formatDuration(troop.duracion)}/u
                  </span>
                  <DialogTrigger asChild>
                    <Button className="btn-tactical h-11 w-11 p-0 min-h-[44px] min-w-[44px]">
                      <MaterialIcon name="info" size={18} />
                    </Button>
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
        ))}
      </div>
    </div>
  );
}
