
'use client';

import Image from 'next/image';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FullConfiguracionHabitacion } from '@/lib/data';
import { calcularCostosNivel, calcularProduccionRecurso } from '@/lib/formulas/room-formulas';
import { Boxes, DollarSign, Target } from 'lucide-react';

type RoomWithLevel = FullConfiguracionHabitacion & { nivel: number };

interface RoomDetailsModalProps {
  room: RoomWithLevel;
}

function formatNumber(num: number): string {
    return num.toLocaleString('de-DE');
}

function getBenefitText(roomId: string, level: number): string {
    if (!roomId) return '-';
    
    // Simplificado, en un futuro se puede hacer más dinámico
    if (roomId.includes('almacen') || roomId.includes('deposito') || roomId.includes('caja_fuerte')) {
        return `+${formatNumber(level * 5000)} Capacidad`;
    }
    if (roomId === 'oficina_del_jefe') return `-${level * 2}% Tiempo const.`;
    if (roomId === 'escuela_especializacion') return `-${level * 2}% Tiempo entren.`;
    if (roomId === 'campo_de_entrenamiento') return `-${level * 5}% Tiempo reclut.`;
    if (roomId.includes('seguridad') || roomId.includes('torreta') || roomId.includes('minas')) return `+${level * 5}% Defensa`;

    return 'Beneficio mejorado';
}

export function RoomDetailsModal({ room }: RoomDetailsModalProps) {
  const projectionLevels = Array.from({ length: 5 }, (_, i) => room.nivel + i + 1);

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <div className="flex items-start gap-4">
          <div className="w-24 h-20 relative rounded-md overflow-hidden border flex-shrink-0">
            <Image src={room.urlImagen} alt={room.nombre} fill className="object-cover" data-ai-hint="game building icon" />
          </div>
          <div>
            <DialogTitle className="text-2xl">{room.nombre}</DialogTitle>
            <DialogDescription>
              Nivel actual: <span className="font-bold text-primary">{room.nivel}</span>
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-2">{room.descripcion}</p>
          </div>
        </div>
      </DialogHeader>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Proyección de Mejoras</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Nivel</TableHead>
              <TableHead>Costos</TableHead>
              <TableHead className="text-right">Producción / Beneficio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectionLevels.map((level) => {
              const costos = calcularCostosNivel(level, room);
              const produccion = room.escalado?.produccionRecurso 
                ? calcularProduccionRecurso(room.id, level)
                : 0;

              return (
                <TableRow key={level}>
                  <TableCell className="font-medium text-primary">{level}</TableCell>
                  <TableCell>
                    <div className="grid grid-cols-3 gap-x-2 text-xs">
                        {costos.armas > 0 && <div className="flex items-center gap-1.5" title='Armas'><Target className="h-3.5 w-3.5"/><span>{formatNumber(costos.armas)}</span></div>}
                        {costos.municion > 0 && <div className="flex items-center gap-1.5" title='Munición'><Boxes className="h-3.5 w-3.5"/><span>{formatNumber(costos.municion)}</span></div>}
                        {costos.dolares > 0 && <div className="flex items-center gap-1.5" title='Dólares'><DollarSign className="h-3.5 w-3.5"/><span>{formatNumber(costos.dolares)}</span></div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-green-400 font-mono text-sm">
                    {produccion > 0 
                      ? `+${formatNumber(produccion)}/h`
                      : getBenefitText(room.id, level)
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  );
}

