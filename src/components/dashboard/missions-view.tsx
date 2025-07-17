
'use client'

import { useState, useTransition, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getPropertyOwner, UserWithProgress } from '@/lib/data';
import { debounce } from 'lodash';
import { Loader2, User, UserX } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { enviarMision } from '@/lib/actions/mission.actions';
import { useToast } from '@/hooks/use-toast';

type TroopInput = {
    id: string;
    cantidad: number;
}

export function MissionsView({ user }: { user: UserWithProgress }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [coordinates, setCoordinates] = useState({ ciudad: '', barrio: '', edificio: '' });
    const [targetOwner, setTargetOwner] = useState<{ id: string, name: string } | null | undefined>(undefined);
    const [isLoadingTarget, setIsLoadingTarget] = useState(false);
    const [missionType, setMissionType] = useState('ATAQUE');
    const [tropas, setTropas] = useState<TroopInput[]>([]);

    const debouncedFetchOwner = useCallback(
        debounce(async (ciudad: number, barrio: number, edificio: number) => {
            if (!ciudad || !barrio || !edificio) {
                setTargetOwner(undefined);
                setIsLoadingTarget(false);
                return;
            };
            const owner = await getPropertyOwner({ ciudad, barrio, edificio });
            setTargetOwner(owner);
            setIsLoadingTarget(false);
        }, 500),
        []
    );

    const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newCoords = { ...coordinates, [name]: value };
        setCoordinates(newCoords);
        
        const { ciudad, barrio, edificio } = newCoords;
        if (ciudad && barrio && edificio) {
            setIsLoadingTarget(true);
            debouncedFetchOwner(parseInt(ciudad), parseInt(barrio), parseInt(edificio));
        } else {
            setTargetOwner(undefined);
        }
    };
    
    const handleTroopChange = (troopId: string, cantidad: number) => {
        setTropas(prev => {
            const existing = prev.find(t => t.id === troopId);
            if (existing) {
                if (cantidad > 0) {
                    return prev.map(t => t.id === troopId ? { ...t, cantidad } : t);
                } else {
                    return prev.filter(t => t.id !== troopId);
                }
            } else if (cantidad > 0) {
                return [...prev, { id: troopId, cantidad }];
            }
            return prev;
        })
    }
    
    const handleSubmit = async () => {
        startTransition(async () => {
            const result = await enviarMision({
                coordinates: {
                    ciudad: parseInt(coordinates.ciudad),
                    barrio: parseInt(coordinates.barrio),
                    edificio: parseInt(coordinates.edificio)
                },
                tropas: tropas.filter(t => t.cantidad > 0),
                tipo: missionType
            });

            if (result.error) {
                toast({ variant: 'destructive', title: 'Error en la misión', description: result.error });
            } else {
                toast({ title: '¡Misión enviada!', description: result.success });
                // Reset form
                setTropas([]);
            }
        });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Configuración de la Misión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className='space-y-2'>
                            <Label htmlFor='ciudad'>Ciudad</Label>
                            <Input id='ciudad' name='ciudad' placeholder='1' value={coordinates.ciudad} onChange={handleCoordinateChange} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='barrio'>Barrio</Label>
                            <Input id='barrio' name='barrio' placeholder='1' value={coordinates.barrio} onChange={handleCoordinateChange} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='edificio'>Edificio</Label>
                            <Input id='edificio' name='edificio' placeholder='1' value={coordinates.edificio} onChange={handleCoordinateChange} />
                        </div>
                    </div>

                    <Card className='p-4'>
                        <div className='flex items-center gap-4'>
                            {isLoadingTarget ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : targetOwner === undefined ? (
                                 <UserX className="h-6 w-6 text-muted-foreground" />
                            ) : targetOwner === null ? (
                                 <UserX className="h-6 w-6 text-green-500" />
                            ) : (
                                <User className="h-6 w-6 text-destructive" />
                            )}
                            <div>
                                <p className='text-sm text-muted-foreground'>Objetivo</p>
                                <p className='font-bold'>
                                    {isLoadingTarget ? 'Buscando...' : targetOwner?.name || 'Nadie'}
                                </p>
                            </div>
                        </div>
                    </Card>
                    
                     <div className='space-y-2'>
                        <Label htmlFor='missionType'>Tipo de Misión</Label>
                        <Select onValueChange={setMissionType} defaultValue={missionType}>
                            <SelectTrigger id='missionType'>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ATAQUE">Ataque</SelectItem>
                                <SelectItem value="OCUPAR">Ocupar</SelectItem>
                                <SelectItem value="DEFENDER">Defender</SelectItem>
                                <SelectItem value="TRANSPORTE">Transporte</SelectItem>
                                <SelectItem value="ESPIONAJE">Espionaje</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Selección de Tropas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tropa</TableHead>
                                <TableHead className='text-right'>Disponible</TableHead>
                                <TableHead className='w-[100px]'>Cantidad</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {user.tropas.map(tropa => (
                                <TableRow key={tropa.configuracionTropaId}>
                                    <TableCell className='flex items-center gap-2'>
                                         <div className="w-10 h-8 relative rounded-md overflow-hidden border flex-shrink-0">
                                            <Image src={tropa.configuracion.urlImagen} alt={tropa.configuracion.nombre} fill className='object-contain' />
                                        </div>
                                        <span className='font-semibold'>{tropa.configuracion.nombre}</span>
                                    </TableCell>
                                    <TableCell className='text-right'>{tropa.cantidad}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type='number'
                                            min="0"
                                            max={tropa.cantidad}
                                            value={tropas.find(t => t.id === tropa.configuracionTropaId)?.cantidad || 0}
                                            onChange={(e) => handleTroopChange(tropa.configuracionTropaId, parseInt(e.target.value) || 0)}
                                            className='h-8 text-center'
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button onClick={handleSubmit} disabled={isPending} className='w-full mt-4'>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Misión
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
