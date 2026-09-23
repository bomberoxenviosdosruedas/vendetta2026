'use client';

import Image from 'next/image';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { FullConfiguracionHabitacion } from '@/lib/data';
import { calcularCostosNivel, calcularProduccionRecurso } from '@/lib/formulas/room-formulas';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';

type RoomWithLevel = FullConfiguracionHabitacion & { nivel: number };

interface RoomDetailsModalProps {
  room: RoomWithLevel;
}

function formatNumber(num: number): string {
  return num.toLocaleString('de-DE');
}

function getBenefitText(roomId: string, level: number): string {
  if (!roomId) return '-';
  if (roomId.includes('almacen') || roomId.includes('deposito') || roomId.includes('caja_fuerte')) {
    return `+${formatNumber(level * 5000)} Capacidad`;
  }
  if (roomId === 'oficina_del_jefe') return `-${level * 2}% Tiempo const.`;
  if (roomId === 'escuela_especializacion') return `-${level * 2}% Tiempo entren.`;
  if (roomId === 'campo_de_entrenamiento') return `-${level * 5}% Tiempo reclut.`;
  if (roomId.includes('seguridad') || roomId.includes('torreta') || roomId.includes('minas')) return `+${level * 5}% Defensa`;

  return 'Beneficio mejorado';
}

function CostList({ costos }: { costos: { armas: number, municion: number, dolares: number } }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-['Space_Mono'] tabular-nums">
      {costos.armas > 0 && <span className="text-[#ee7000]">ARMAS: {formatNumber(costos.armas)}</span>}
      {costos.municion > 0 && <span className="text-[#fabd00]">MUN: {formatNumber(costos.municion)}</span>}
      {costos.dolares > 0 && <span className="text-[#00ff00]">$ {formatNumber(costos.dolares)}</span>}
    </div>
  );
}

export function RoomDetailsModal({ room }: RoomDetailsModalProps) {
  const projectionLevels = Array.from({ length: 5 }, (_, i) => room.nivel + i + 1);

  return (
    <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col p-0 bg-[#0d0d0d] border-[#333333] text-[#dfdbc9]">
      <DialogHeader className="p-3 crimson-th border-b border-[#8e1515] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 relative rounded border border-[#333333] bg-black overflow-hidden shrink-0">
            <Image src={room.urlImagen} alt={room.nombre} fill className="w-full h-auto object-cover" />
          </div>
          <div>
            <DialogTitle className="text-base font-['Space_Grotesk'] text-white uppercase">{room.nombre}</DialogTitle>
            <DialogDescription className="text-xs text-[#ffdad4] font-['Space_Mono']">
              Nivel actual: <span className="font-bold text-[#fff400]">{room.nivel}</span>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          <p className="text-xs text-[#a0a0a0]">{room.descripcion}</p>

          <div className="crimson-th px-2 py-0.5 text-[10px] font-['Space_Grotesk'] font-bold uppercase text-white">
            PROYECCIÓN DE MEJORAS
          </div>

          <div className="divide-y divide-[#222222] cell-dark border border-[#333333]">
            {projectionLevels.map((level) => {
              const costos = calcularCostosNivel(level, room);
              const produccion = room.produccionRecurso
                ? calcularProduccionRecurso(room.id, level)
                : 0;

              return (
                <div key={level} className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-['Space_Mono'] font-bold text-[#00ff00] text-xs">
                      NVL {level}
                    </span>
                    <CostList costos={costos} />
                  </div>
                  <span className="text-xs font-['Space_Mono'] text-[#fff400] font-bold">
                    {produccion > 0
                      ? `+${formatNumber(produccion)}/h`
                      : getBenefitText(room.id, level)
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-[#333333] bg-[#0a0a0a] shrink-0">
        <DialogClose asChild>
          <Button type="button" className="btn-tactical w-full text-xs font-['Space_Grotesk'] font-bold h-11 min-h-[44px]">
            CERRAR DETALLES
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}
