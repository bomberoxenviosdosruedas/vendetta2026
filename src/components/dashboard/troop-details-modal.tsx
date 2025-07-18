
'use client';

import Image from 'next/image';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calcularStatsTropaConBonus } from '@/lib/formulas/troop-formulas';
import { X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import type { ConfiguracionTropa } from '@prisma/client';
import type { UserWithProgress } from '@/lib/data';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TroopDetailsModalProps {
  troop: ConfiguracionTropa;
  user: UserWithProgress;
}

function formatNumber(num: number): string {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString('de-DE');
}

export function TroopDetailsModal({ troop, user }: TroopDetailsModalProps) {
    const { ataqueActual, defensaActual } = calcularStatsTropaConBonus(troop, user.entrenamientos);
    const stats = [
        { label: 'Ataque', base: troop.ataque, actual: ataqueActual },
        { label: 'Defensa', base: troop.defensa, actual: defensaActual },
        { label: 'Capacidad', base: troop.capacidad, actual: troop.capacidad },
        { label: 'Velocidad', base: troop.velocidad, actual: troop.velocidad },
        { label: 'Salario', base: troop.salario, actual: troop.salario },
        { label: 'Puntos', base: troop.puntos, actual: troop.puntos },
    ];
  return (
    <DialogContent className="max-w-3xl w-full max-h-[90svh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-24 h-20 relative rounded-md overflow-hidden border flex-shrink-0">
                <Image src={troop.urlImagen} alt={troop.nombre} fill className="object-contain" data-ai-hint="mafia character icon" />
            </div>
            <div>
                <DialogTitle className="text-2xl">{troop.nombre}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-2">{troop.descripcion}</DialogDescription>
            </div>
            </div>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground sm:hidden">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogClose>

        <ScrollArea className="flex-grow px-6">
            <h3 className="font-semibold mb-2">Estadísticas de la Tropa</h3>
            
            {/* Vista de tabla para escritorio */}
            <Table className="hidden sm:table">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Valor</TableHead>
                        <TableHead className="text-right">Ataque</TableHead>
                        <TableHead className="text-right">Defensa</TableHead>
                        <TableHead className="text-right">Capacidad</TableHead>
                        <TableHead className="text-right">Velocidad</TableHead>
                        <TableHead className="text-right">Salario</TableHead>
                        <TableHead className="text-right">Puntos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">Base</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(troop.ataque)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(troop.defensa)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(troop.capacidad)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(troop.velocidad)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(troop.salario)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(troop.puntos)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                        <TableCell className="font-medium text-primary">Actual</TableCell>
                        <TableCell className="text-right font-mono text-primary font-bold">{formatNumber(ataqueActual)}</TableCell>
                        <TableCell className="text-right font-mono text-primary font-bold">{formatNumber(defensaActual)}</TableCell>
                        <TableCell className="text-right font-mono text-primary font-bold">{formatNumber(troop.capacidad)}</TableCell>
                        <TableCell className="text-right font-mono text-primary font-bold">{formatNumber(troop.velocidad)}</TableCell>
                        <TableCell className="text-right font-mono text-primary font-bold">{formatNumber(troop.salario)}</TableCell>
                        <TableCell className="text-right font-mono text-primary font-bold">{formatNumber(troop.puntos)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            
            {/* Vista de tarjetas para móvil */}
            <div className='sm:hidden space-y-4'>
                <Card>
                    <CardHeader className='p-4'>
                        <CardTitle className='text-base'>Estadísticas Base</CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 pt-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                        {stats.map(stat => (
                            <div key={`base-${stat.label}`} className='flex justify-between items-baseline'>
                                <span className='text-muted-foreground'>{stat.label}:</span>
                                <span className='font-mono font-semibold'>{formatNumber(stat.base)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                 <Card className='bg-muted/30'>
                    <CardHeader className='p-4'>
                        <CardTitle className='text-base text-primary'>Estadísticas Actuales</CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 pt-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                         {stats.map(stat => (
                            <div key={`actual-${stat.label}`} className='flex justify-between items-baseline'>
                                <span className='text-muted-foreground'>{stat.label}:</span>
                                <span className='font-mono font-bold text-primary'>{formatNumber(stat.actual)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
        <div className="px-6 py-4 border-t mt-auto">
             <DialogClose asChild>
                <Button type="button" variant="secondary" className="w-full">
                    Cerrar
                </Button>
            </DialogClose>
        </div>
    </DialogContent>
  );
}
