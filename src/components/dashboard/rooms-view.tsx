'use client';

import Image from "next/image";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MaterialIcon from "@/components/ui/material-icon";
import { iniciarAmpliacion } from "@/lib/actions/room.actions";
import { ConstructionQueue } from "./construction-queue";
import { FullConfiguracionHabitacion, UserWithProgress } from "@/lib/data";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { RoomDetailsModal } from "./room-details-modal";
import { useProperty } from "@/contexts/property-context";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { calcularCostosNivel, calcularTiempoConstruccion } from "@/lib/formulas/room-formulas";

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

type RoomsViewProps = {
  user: UserWithProgress;
  allRoomConfigs: FullConfiguracionHabitacion[];
};

export function RoomsView({ user, allRoomConfigs }: RoomsViewProps) {
  const router = useRouter();
  const { selectedProperty } = useProperty();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const { toast } = useToast();

  const construccionEnCola = selectedProperty?.colaConstruccion || [];

  useEffect(() => {
    if (!construccionEnCola || construccionEnCola.length === 0) return;
    const construccionActiva = construccionEnCola.find(c => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());
    if (!construccionActiva?.fechaFinalizacion) return;

    const fin = new Date(construccionActiva.fechaFinalizacion).getTime();
    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      if (ahora >= fin) {
        router.refresh();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [construccionEnCola, router]);

  if (!selectedProperty) {
    return (
      <div className="v-outer-frame p-4 text-center font-mono text-[#221c13]">
        Por favor, selecciona una propiedad para gestionar sus habitaciones.
      </div>
    );
  }

  const userRoomsMap = new Map(selectedProperty.habitaciones.map(h => [h.configuracionHabitacionId, h]));

  const desiredOrder = [
    'oficina_del_jefe', 'escuela_especializacion', 'armeria', 'almacen_de_municion',
    'cerveceria', 'taberna', 'contrabando', 'almacen_de_armas', 'deposito_de_municion',
    'almacen_de_alcohol', 'caja_fuerte', 'campo_de_entrenamiento', 'seguridad',
    'torreta_de_fuego_automatico', 'minas_ocultas'
  ];

  const roomsData = desiredOrder.map(id => {
    const config = allRoomConfigs.find(c => c.id === id);
    if (!config) return null;

    const userRoom = userRoomsMap.get(id);
    const nivelBase = userRoom ? userRoom.nivel : 0;

    const mejorasEnCola = selectedProperty.colaConstruccion.filter(c => c.habitacionId === id).length;
    const nivelProyectado = nivelBase + mejorasEnCola;
    const nivelSiguiente = nivelProyectado + 1;

    const nivelOficinaJefe = userRoomsMap.get('oficina_del_jefe')?.nivel || 1;
    const enConstruccion = selectedProperty.colaConstruccion.some(c => c.habitacionId === id);

    const costosSiguienteNivel = calcularCostosNivel(nivelSiguiente, config);
    const tiempoSiguienteNivel = calcularTiempoConstruccion(nivelSiguiente, config, nivelOficinaJefe);

    const requirements = config.requirements || [];
    const meetsRequirements = requirements.every(req => (userRoomsMap.get(req.requiredRoomId)?.nivel || 0) >= req.requiredLevel);
    const requirementsText = !meetsRequirements
      ? requirements.map(req => `${allRoomConfigs.find(r => r.id === req.requiredRoomId)?.nombre || req.requiredRoomId} (Nvl ${req.requiredLevel})`).join(', ')
      : null;

    return {
      ...config,
      nivel: nivelBase,
      nivelProyectado,
      nivelSiguiente,
      costos: costosSiguienteNivel,
      tiempo: tiempoSiguienteNivel,
      enConstruccion,
      meetsRequirements,
      requirementsText,
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  const isQueueFull = construccionEnCola.length >= 5;

  const handleAmpliacion = async (habitacionId: string) => {
    if (!selectedProperty) return;
    setIsSubmitting(habitacionId);
    const resultado = await iniciarAmpliacion(selectedProperty.id, habitacionId);
    if (resultado?.error) {
      toast({
        title: "Error al ampliar",
        description: resultado.error,
        variant: "destructive"
      });
    } else if (resultado?.success) {
      toast({
        title: "¡Éxito!",
        description: resultado.success
      });
    }
    setIsSubmitting(null);
  };

  const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre }));

  return (
    <div className="space-y-3 w-full">
      <ConstructionQueue propiedad={selectedProperty} allRooms={simpleRoomConfigs} />

      <section className="v-outer-frame">
        <div className="crimson-th p-2 flex items-center justify-between">
          <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
            HABITACIONES // {selectedProperty.nombre}
          </span>
          <span className="timer-pill px-2 py-0.5 text-xs text-[#ffe569]">
            COLA: {construccionEnCola.length}/5
          </span>
        </div>

        <div className="divide-y divide-[#cbc4b0]">
          {roomsData.map((room, idx) => {
            const isAlt = idx % 2 === 1;
            const button = (
              <button
                type="submit"
                disabled={isQueueFull || isSubmitting === room.id || !room.meetsRequirements}
                className="retro-btn text-xs px-3 py-1.5 rounded-sm min-h-[44px] disabled:opacity-50"
              >
                {isSubmitting === room.id ? 'AMPLIANDO...' : isQueueFull ? 'COLA LLENA' : 'AMPLIAR'}
              </button>
            );

            return (
              <Dialog key={room.id}>
                <div className={`p-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center ${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'} hover:bg-[#efeadd] transition-colors`}>
                  <div className="lg:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-16 h-16 relative rounded border border-[#5a4f3d] bg-[#181410] overflow-hidden shrink-0 shadow-sm">
                      <Image
                        src={room.urlImagen || "https://placehold.co/80x56.png"}
                        alt={room.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold font-['Chivo'] text-[#801e00] text-sm uppercase truncate">
                        {room.nombre}
                      </div>
                      <div className="text-xs font-['JetBrains_Mono'] font-bold text-[#008800]">
                        NIVEL {room.nivelProyectado}
                      </div>
                      {room.enConstruccion && (
                        <div className="text-[11px] text-[#b35900] font-['JetBrains_Mono'] flex items-center gap-1 font-bold">
                          <MaterialIcon name="hourglass_top" size={12} /> EN COLA
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-4 min-w-0">
                    <p className="text-xs text-[#4a4031] line-clamp-2 leading-tight">{room.descripcion}</p>
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-1 sm:items-end">
                    <div className="text-[11px] font-['Chivo'] text-[#221c13] uppercase font-bold">
                      SIGUIENTE: NIVEL {room.nivelSiguiente}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-['JetBrains_Mono'] tabular-nums font-bold">
                      {room.costos.armas > 0 && <span className="text-[#a84e00]">ARMAS: {formatNumber(room.costos.armas)}</span>}
                      {room.costos.municion > 0 && <span className="text-[#8f6d00]">MUN: {formatNumber(room.costos.municion)}</span>}
                      {room.costos.dolares > 0 && <span className="text-[#007000]">$ {formatNumber(room.costos.dolares)}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="timer-pill px-2 py-0.5 text-[11px]">
                        {formatDuration(room.tiempo)}
                      </span>
                      <DialogTrigger asChild>
                        <button className="retro-btn-dark p-2 rounded-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
                          <MaterialIcon name="info" size={16} />
                        </button>
                      </DialogTrigger>
                      <form action={() => handleAmpliacion(room.id)}>
                        {button}
                      </form>
                    </div>
                  </div>
                </div>
                <RoomDetailsModal room={{ ...room, nivel: room.nivelProyectado }} />
              </Dialog>
            );
          })}
        </div>
      </section>
    </div>
  );
}
