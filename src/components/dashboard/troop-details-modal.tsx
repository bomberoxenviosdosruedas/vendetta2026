'use client';

import Image from 'next/image';
import { resolveConfigImageUrl } from '@/lib/config-images';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import type { ConfiguracionTropa } from '@prisma/client';
import type { UserWithProgress } from '@/lib/data';

interface TroopDetailsModalProps {
  troop: ConfiguracionTropa;
  user: UserWithProgress;
  ataqueActual: number;
  defensaActual: number;
  capacidadActual: number;
  velocidadActual: number;
}

function formatNumber(num: number): string {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString('de-DE');
}

export function TroopDetailsModal({ troop, user, ataqueActual, defensaActual, capacidadActual, velocidadActual }: TroopDetailsModalProps) {
  const stats = [
    { label: 'Ataque', base: troop.ataque, actual: ataqueActual, color: 'text-[#c00000]' },
    { label: 'Defensa', base: troop.defensa, actual: defensaActual, color: 'text-[#1e6b28]' },
    { label: 'Capacidad', base: troop.capacidad, actual: capacidadActual, color: 'text-[#6b5210]' },
    { label: 'Velocidad', base: Number(troop.velocidad), actual: velocidadActual, color: 'text-[#8f4200]' },
    { label: 'Salario', base: troop.salario, actual: troop.salario, color: 'text-[#ffe569]' },
    { label: 'Puntos', base: troop.puntos, actual: troop.puntos, color: 'text-[#221c13]' },
  ];

  return (
    <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col p-0 bg-[#161410] border-2 border-[#5a4b33] text-[#dfdbc9] overflow-hidden">
      <DialogHeader className="p-3 crimson-th shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 relative rounded border border-[#5a4f3d] bg-[#181410] overflow-hidden shrink-0">
            <Image src={resolveConfigImageUrl(troop.urlImagen)} alt={troop.nombre} fill className="object-cover" />
          </div>
          <div>
            <DialogTitle className="text-sm font-['Chivo'] font-bold text-white uppercase">{troop.nombre}</DialogTitle>
            <DialogDescription className="text-xs text-[#ffe569] font-['JetBrains_Mono']">
              Ficha Técnica de Combate
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 p-3 bg-[#f1ebda] text-[#221c13]">
        <div className="space-y-3">
          <p className="text-xs text-[#4a4031]">{troop.descripcion}</p>

          <div className="v-header-c text-[10px] font-['Chivo'] font-bold uppercase">
            MATRIZ DE ATRIBUTOS TÁCTICOS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-['JetBrains_Mono'] text-xs">
            {stats.map((st) => (
              <div key={st.label} className="p-2 bg-[#e5dfcb] border border-[#cbc4b0] rounded-sm flex justify-between items-center">
                <span className="text-[#554a37] font-bold">{st.label.toUpperCase()}:</span>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-[#695d48] line-through text-[10px]">{formatNumber(Number(st.base))}</span>
                  <span className={`font-bold ${st.color}`}>{formatNumber(st.actual)}</span>
                </div>
              </div>
            ))}
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
