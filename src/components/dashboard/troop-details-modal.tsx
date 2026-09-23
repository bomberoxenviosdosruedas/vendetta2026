'use client';

import Image from 'next/image';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
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
    { label: 'Ataque', base: troop.ataque, actual: ataqueActual, color: 'text-[#ff3f3f]' },
    { label: 'Defensa', base: troop.defensa, actual: defensaActual, color: 'text-[#00ff00]' },
    { label: 'Capacidad', base: troop.capacidad, actual: capacidadActual, color: 'text-[#fabd00]' },
    { label: 'Velocidad', base: Number(troop.velocidad), actual: velocidadActual, color: 'text-[#ee7000]' },
    { label: 'Salario', base: troop.salario, actual: troop.salario, color: 'text-[#fff400]' },
    { label: 'Puntos', base: troop.puntos, actual: troop.puntos, color: 'text-white' },
  ];

  return (
    <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col p-0 bg-[#0d0d0d] border-[#333333] text-[#dfdbc9]">
      <DialogHeader className="p-3 crimson-th border-b border-[#8e1515] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 relative rounded border border-[#333333] bg-black overflow-hidden shrink-0">
            <Image src={troop.urlImagen} alt={troop.nombre} fill className="w-full h-auto object-cover" />
          </div>
          <div>
            <DialogTitle className="text-base font-['Space_Grotesk'] text-white uppercase">{troop.nombre}</DialogTitle>
            <DialogDescription className="text-xs text-[#ffdad4] font-['Space_Mono']">
              Ficha Técnica de Combate
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          <p className="text-xs text-[#a0a0a0]">{troop.descripcion}</p>

          <div className="crimson-th px-2 py-0.5 text-[10px] font-['Space_Grotesk'] font-bold uppercase text-white">
            MATRIZ DE ATRIBUTOS TÁCTICOS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-['Space_Mono'] text-xs">
            {stats.map((st) => (
              <div key={st.label} className="cell-dark p-2 flex justify-between items-center">
                <span className="text-[#888888]">{st.label.toUpperCase()}:</span>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-[#a0a0a0] line-through text-[10px]">{formatNumber(Number(st.base))}</span>
                  <span className={`font-bold ${st.color}`}>{formatNumber(st.actual)}</span>
                </div>
              </div>
            ))}
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
