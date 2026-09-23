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
      <div className="cell-darker p-4 border border-[#333333] text-center font-mono text-[#a0a0a0]">
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
    <div className="space-y-2 w-full text-[#dfdbc9]">
      <ConstructionQueue propiedad={selectedProperty} allRooms={simpleRoomConfigs} />

      <div className="crimson-th p-2 text-white font-['Space_Grotesk'] font-bold text-sm uppercase flex items-center justify-between">
        <span>HABITACIONES // {selectedProperty.nombre}</span>
        <span className="font-['Space_Mono'] text-xs text-[#fff400]">
          COLA: {construccionEnCola.length}/5
        </span>
      </div>

      <div className="cell-darker divide-y divide-[#222222] border border-[#333333]">
        {roomsData.map((room) => {
          const button = (
            <Button
              type="submit"
              disabled={isQueueFull || isSubmitting === room.id || !room.meetsRequirements}
              className="btn-crimson text-xs font-['Space_Grotesk'] font-bold px-3 min-h-[44px] min-w-[44px]"
            >
              {isSubmitting === room.id ? 'AMPLIANDO...' : isQueueFull ? 'COLA LLENA' : 'AMPLIAR'}
            </Button>
          );

          return (
            <Dialog key={room.id}>
              <div className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-3 items-center hover:bg-[#141414] transition-colors">
                <div className="xl:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-16 sm:w-20 h-16 relative rounded border border-[#333333] bg-black overflow-hidden shrink-0">
                    <Image
                      src={room.urlImagen || "https://placehold.co/80x56.png"}
                      alt={room.nombre}
                      fill
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold font-['Space_Grotesk'] text-white text-sm uppercase truncate">
                      {room.nombre}
                    </div>
                    <div className="text-xs font-['Space_Mono'] text-[#00ff00]">
                      NIVEL {room.nivelProyectado}
                    </div>
                    {room.enConstruccion && (
                      <div className="text-[10px] text-[#fabd00] font-['Space_Mono'] flex items-center gap-1">
                        <MaterialIcon name="hourglass_top" size={12} /> EN COLA
                      </div>
                    )}
                  </div>
                </div>

                <div className="xl:col-span-4 min-w-0">
                  <p className="text-xs text-[#a0a0a0] line-clamp-2">{room.descripcion}</p>
                </div>

                <div className="xl:col-span-4 flex flex-col gap-1 sm:items-end">
                  <div className="text-xs font-['Space_Grotesk'] text-[#ffdad4] uppercase font-bold">
                    SIGUIENTE: NIVEL {room.nivelSiguiente}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-['Space_Mono'] tabular-nums text-white">
                    {room.costos.armas > 0 && <span className="text-[#ee7000]">ARMAS: {formatNumber(room.costos.armas)}</span>}
                    {room.costos.municion > 0 && <span className="text-[#fabd00]">MUN: {formatNumber(room.costos.municion)}</span>}
                    {room.costos.dolares > 0 && <span className="text-[#00ff00]">$ {formatNumber(room.costos.dolares)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-['Space_Mono'] text-[#888888]">
                      {formatDuration(room.tiempo)}
                    </span>
                    <DialogTrigger asChild>
                      <Button className="btn-tactical h-11 w-11 p-0 min-h-[44px] min-w-[44px]">
                        <MaterialIcon name="info" size={18} />
                      </Button>
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
    </div>
  );
}
