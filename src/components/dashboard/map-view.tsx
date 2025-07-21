
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getPropertiesByLocation, UserWithProgress } from '@/lib/data';
import type { Propiedad, User as PrismaUser, Family } from '@prisma/client';
import { ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type PropertyWithOwner = Propiedad & { user: (PrismaUser & { familyMember: { family: Family } | null }) | null };

const BuildingGrid = ({ properties, currentUser, currentCiudad, currentBarrio }: { properties: PropertyWithOwner[], currentUser: UserWithProgress, currentCiudad: number, currentBarrio: number }) => {
    const router = useRouter();
    const buildings = Array.from({ length: 255 }, (_, i) => {
        const edificio = i + 1;
        const property = properties.find(p => p.edificio === edificio);
        return { edificio, property };
    });

    const handleSendMission = (ciudad: number, barrio: number, edificio: number) => {
        const params = new URLSearchParams();
        params.set('ciudad', ciudad.toString());
        params.set('barrio', barrio.toString());
        params.set('edificio', edificio.toString());
        router.push(`/missions?${params.toString()}`);
    }

    return (
        <div className="relative w-full aspect-video rounded-lg border overflow-hidden">
             <Image
                src="/img/map.png"
                alt="Mapa de la ciudad"
                fill
                className="object-cover z-0"
                data-ai-hint="city map background"
            />
            <div className="absolute inset-0 grid grid-cols-17 gap-0.5 p-1 md:p-2 z-10">
                {buildings.map(({ edificio, property }) => {
                    const isOwnedByCurrentUser = property?.userId === currentUser.id;
                    const hasOwner = !!property;
                    
                    return (
                        <TooltipProvider key={edificio} delayDuration={0}>
                            <Tooltip>
                                <Dialog>
                                    <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                            <div className={cn(
                                                "aspect-square flex items-center justify-center rounded-sm text-xs font-bold transition-colors cursor-pointer",
                                                isOwnedByCurrentUser ? "bg-primary/90 text-primary-foreground hover:bg-primary" : 
                                                hasOwner ? "bg-destructive/90 text-destructive-foreground hover:bg-destructive" : 
                                                "bg-black/40 hover:bg-black/60"
                                            )}>
                                                {hasOwner && <span>{edificio}</span>}
                                            </div>
                                        </DialogTrigger>
                                    </TooltipTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Propiedad en [{currentCiudad}:{currentBarrio}:{edificio}]</DialogTitle>
                                             <DialogDescription>
                                                {property ? (
                                                    `Esta propiedad pertenece a ${property.user?.name || 'Desconocido'}.`
                                                ) : (
                                                    "Este solar está actualmente desocupado."
                                                )}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-2">
                                             <h4 className="mb-2 font-semibold">Información del Objetivo</h4>
                                             <p><strong>Jugador:</strong> {property?.user?.name || 'N/A'}</p>
                                             <p><strong>Familia:</strong> {property?.user?.familyMember?.family.name || 'Sin familia'}</p>
                                             <p><strong>Coordenadas:</strong> {`${currentCiudad}:${currentBarrio}:${edificio}`}</p>
                                        </div>
                                        <DialogFooter>
                                             <DialogClose asChild>
                                                <Button variant="outline">Cerrar</Button>
                                            </DialogClose>
                                            <Button onClick={() => handleSendMission(currentCiudad, currentBarrio, edificio)}>
                                                <Send className="mr-2 h-4 w-4" />
                                                Enviar Misión
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <TooltipContent>
                                    <p className='font-bold'>[{currentCiudad}:{currentBarrio}:{edificio}]</p>
                                    <p className='text-sm'>{property?.user?.name || "Desocupado"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
        </div>
    );
};

const CoordinateInput = ({ label, value, onChange }: { label: string, value: number, onChange: (newValue: number) => void }) => {
    const handleChange = (increment: number) => {
        const newValue = value + increment;
        if (newValue > 0) {
            onChange(newValue);
        }
    }
    
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium">{label}</span>
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 transition-colors" onClick={() => handleChange(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input 
                    type="number" 
                    className="w-16 h-8 text-center" 
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
                />
                <Button variant="outline" size="icon" className="h-8 w-8 transition-colors" onClick={() => handleChange(1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export function MapView({ initialCiudad, initialBarrio, initialProperties, currentUser }: { initialCiudad: number, initialBarrio: number, initialProperties: PropertyWithOwner[], currentUser: UserWithProgress }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [ciudad, setCiudad] = useState(initialCiudad);
    const [barrio, setBarrio] = useState(initialBarrio);
    const [properties, setProperties] = useState(initialProperties);
    const [isLoading, setIsLoading] = useState(false);

    const updateMap = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.set('ciudad', ciudad.toString());
        params.set('barrio', barrio.toString());
        router.push(`${pathname}?${params.toString()}`);
    }, [ciudad, barrio, pathname, router, searchParams]);

    useEffect(() => {
        const ciudadParam = searchParams.get('ciudad');
        const barrioParam = searchParams.get('barrio');
        
        const newCiudad = ciudadParam ? parseInt(ciudadParam, 10) : initialCiudad;
        const newBarrio = barrioParam ? parseInt(barrioParam, 10) : initialBarrio;

        if (newCiudad !== ciudad || newBarrio !== barrio || !properties.length) {
            setCiudad(newCiudad);
            setBarrio(newBarrio);
            setIsLoading(true);
            getPropertiesByLocation(newCiudad, newBarrio).then(data => {
                setProperties(data as any);
                setIsLoading(false);
            });
        }
    }, [searchParams, ciudad, barrio, initialCiudad, initialBarrio, properties.length]);

    return (
        <Card className="bg-card/80">
            <div className="space-y-4 p-4">
                <div className="flex flex-row flex-wrap justify-center items-end gap-2 p-2 rounded-lg bg-muted border">
                    <CoordinateInput label="Ciudad" value={ciudad} onChange={setCiudad} />
                    <CoordinateInput label="Barrio" value={barrio} onChange={setBarrio} />
                    <Button onClick={updateMap} disabled={isLoading} size="sm" className="h-8">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Ir
                    </Button>
                </div>

                <div className="relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg z-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <BuildingGrid properties={properties} currentUser={currentUser} currentCiudad={ciudad} currentBarrio={barrio} />
                </div>
            </div>
        </Card>
    )
}
