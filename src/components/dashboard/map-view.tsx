
'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getPropertiesByLocation, UserWithProgress } from '@/lib/data';
import type { Propiedad, User as PrismaUser } from '@prisma/client';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from 'next/image';

type PropertyWithOwner = Propiedad & { user: PrismaUser | null };

const BuildingGrid = ({ properties, currentUser }: { properties: PropertyWithOwner[], currentUser: UserWithProgress }) => {
    const buildings = Array.from({ length: 225 }, (_, i) => {
        const edificio = i + 1;
        const property = properties.find(p => p.edificio === edificio);
        return { edificio, property };
    });

    return (
        <div className="relative w-full aspect-square rounded-lg border overflow-hidden">
             <Image
                src="/img/map.png"
                alt="Mapa de la ciudad"
                fill
                className="object-cover z-0"
                data-ai-hint="city map background"
            />
            <div className="absolute inset-0 grid grid-cols-15 gap-0.5 p-1 md:p-2 z-10">
                {buildings.map(({ edificio, property }) => {
                    const isOwnedByCurrentUser = property?.userId === currentUser.id;
                    const hasOwner = !!property;
                    
                    return (
                        <TooltipProvider key={edificio} delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={cn(
                                        "aspect-square flex items-center justify-center rounded-sm text-xs font-bold transition-colors",
                                        isOwnedByCurrentUser ? "bg-primary/90 text-primary-foreground hover:bg-primary" : 
                                        hasOwner ? "bg-destructive/90 text-destructive-foreground hover:bg-destructive" : 
                                        "bg-black/40 hover:bg-black/60"
                                    )}>
                                        {hasOwner && <span>{edificio}</span>}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {property ? (
                                        <div>
                                            <p>Jugador: <span className="font-bold">{property.user?.name || 'Desconocido'}</span></p>
                                            <p>Coordenadas: <span className="font-bold">{`${property.ciudad}:${property.barrio}:${property.edificio}`}</span></p>
                                        </div>
                                    ) : (
                                        <p>Solar Vacío [{edificio}]</p>
                                    )}
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
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleChange(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input 
                    type="number" 
                    className="w-16 h-8 text-center" 
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleChange(1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export function MapView({ initialCiudad, initialBarrio, initialProperties, currentUser }: { initialCiudad: number, initialBarrio: number, initialProperties: PropertyWithOwner[], currentUser: UserWithProgress }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ciudad, setCiudad] = useState(initialCiudad);
    const [barrio, setBarrio] = useState(initialBarrio);
    const [properties, setProperties] = useState(initialProperties);
    const [isLoading, setIsLoading] = useState(false);

    const updateMap = () => {
        const params = new URLSearchParams();
        params.set('ciudad', ciudad.toString());
        params.set('barrio', barrio.toString());
        router.push(`${pathname}?${params.toString()}`);
    }

    const searchParams = useSearchParams();
    useEffect(() => {
        const ciudadParam = searchParams.get('ciudad');
        const barrioParam = searchParams.get('barrio');
        
        if (ciudadParam && barrioParam) {
            const newCiudad = parseInt(ciudadParam, 10);
            const newBarrio = parseInt(barrioParam, 10);

            if (newCiudad !== ciudad || newBarrio !== barrio) {
                 setCiudad(newCiudad);
                 setBarrio(newBarrio);
            }

            setIsLoading(true);
            getPropertiesByLocation(newCiudad, newBarrio).then(data => {
                setProperties(data);
                setIsLoading(false);
            });
        }

    }, [searchParams, ciudad, barrio]);

    return (
        <Card>
            <CardContent className="p-4 space-y-4">
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
                    <BuildingGrid properties={properties} currentUser={currentUser} />
                </div>
            </CardContent>
        </Card>
    )
}
