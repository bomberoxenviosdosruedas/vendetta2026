'use client';

import Image from 'next/image';
import { resolveConfigImageUrl } from '@/lib/config-images';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { FullConfiguracionHabitacion } from '@/lib/data';
import { calcularCostosNivel, calcularProduccionRecurso } from '@/lib/formulas/room-formulas';
import { ScrollArea } from '../ui/scroll-area';

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
    <div className="flex flex-wrap gap-2 text-xs font-['JetBrains_Mono'] tabular-nums font-bold">
      {costos.armas > 0 && <span className="text-[#8f4200]">ARMAS: {formatNumber(costos.armas)}</span>}
      {costos.municion > 0 && <span className="text-[#6b5210]">MUN: {formatNumber(costos.municion)}</span>}
      {costos.dolares > 0 && <span className="text-[#256e2e]">$ {formatNumber(costos.dolares)}</span>}
    </div>
  );
}

export function RoomDetailsModal({ room }: RoomDetailsModalProps) {
  const projectionLevels = Array.from({ length: 5 }, (_, i) => room.nivel + i + 1);

  return (
    <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col p-0 bg-[#161410] border-2 border-[#5a4b33] text-[#dfdbc9] overflow-hidden">
      <DialogHeader className="p-3 crimson-th shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 relative rounded border border-[#5a4f3d] bg-[#181410] overflow-hidden shrink-0">
            <Image src={resolveConfigImageUrl(room.urlImagen)} alt={room.nombre} fill className="object-cover" />
          </div>
          <div>
            <DialogTitle className="text-sm font-['Chivo'] font-bold text-white uppercase">{room.nombre}</DialogTitle>
            <DialogDescription className="text-xs text-[#ffe569] font-['JetBrains_Mono']">
              Nivel actual: <span className="font-bold text-white">{room.nivel}</span>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 p-3 bg-[#f1ebda] text-[#221c13]">
        <div className="space-y-3">
          <p className="text-xs text-[#4a4031]">{room.descripcion}</p>

          <div className="v-header-c text-[10px] font-['Chivo'] font-bold uppercase">
            PROYECCIÓN DE MEJORAS
          </div>

          <div className="divide-y divide-[#cbc4b0] border border-[#cbc4b0] bg-[#e5dfcb] rounded-sm">
            {projectionLevels.map((level) => {
              const costos = calcularCostosNivel(level, room);
              const produccion = room.produccionRecurso
                ? calcularProduccionRecurso(room.id, level)
                : 0;

              return (
                <div key={level} className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-['JetBrains_Mono'] font-bold text-[#1e6b28] text-xs">
                      NVL {level}
                    </span>
                    <CostList costos={costos} />
                  </div>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#801e00] font-bold">
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

      <div className="p-2 border-t border-[#cbc4b0] bg-[#dfdbc9] shrink-0">
        <DialogClose asChild>
          <button type="button" className="retro-btn-dark w-full text-xs font-['Chivo'] font-bold py-2 min-h-[44px]">
            CERRAR DETALLES
          </button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}
