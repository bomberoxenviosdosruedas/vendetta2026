
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

type PropertyWithOwner = Propiedad & { user: PrismaUser | null };

const BuildingGrid = ({ properties, currentUser }: { properties: PropertyWithOwner[], currentUser: UserWithProgress }) => {
    const buildings = Array.from({ length: 225 }, (_, i) => {
        const edificio = i + 1;
        const property = properties.find(p => p.edificio === edificio);
        return { edificio, property };
    });

    return (
        <div className="grid grid-cols-15 gap-1 bg-card p-2 rounded-lg border">
            {buildings.map(({ edificio, property }) => {
                const isOwnedByCurrentUser = property?.userId === currentUser.id;
                const hasOwner = !!property;
                
                return (
                    <TooltipProvider key={edificio}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "aspect-square flex items-center justify-center rounded-sm text-xs font-bold transition-colors",
                                    isOwnedByCurrentUser ? "bg-primary text-primary-foreground hover:bg-primary/90" : 
                                    hasOwner ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : 
                                    "bg-muted hover:bg-muted/80"
                                )}>
                                    {edificio}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {property ? (
                                    <div>
                                        <p>Jugador: <span className="font-bold">{property.user?.name || 'Desconocido'}</span></p>
                                        <p>Coordenadas: <span className="font-bold">{`${property.ciudad}:${property.barrio}:${property.edificio}`}</span></p>
                                    </div>
                                ) : (
                                    <p>Solar Vacío</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            })}
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
        <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleChange(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input 
                    type="number" 
                    className="w-20 h-8 text-center" 
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

    // Effect to refetch data when ciudad/barrio changes via router params
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
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 p-2 rounded-lg bg-muted border">
                    <CoordinateInput label="Ciudad" value={ciudad} onChange={setCiudad} />
                    <CoordinateInput label="Barrio" value={barrio} onChange={setBarrio} />
                    <Button onClick={updateMap} disabled={isLoading} className="mt-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Ir
                    </Button>
                </div>

                <div className="relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg z-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <BuildingGrid properties={properties} currentUser={currentUser} />
                </div>
            </CardContent>
        </Card>
    )
}
