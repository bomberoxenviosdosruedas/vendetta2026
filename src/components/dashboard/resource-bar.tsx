
'use client'

import { LiveClock } from "./live-clock";
import type { UserWithProgress } from '@/lib/data';
import { useProperty } from '@/contexts/property-context';
import Image from "next/image";
import { calculateStorageCapacity } from "@/lib/formulas/room-formulas";
import { cn } from "@/lib/utils";

const resourceIcons: { [key: string]: string } = {
    armas: '/img/recursos/armas.svg',
    municion: '/img/recursos/municion.svg',
    alcohol: '/img/recursos/alcohol.svg',
    dolares: '/img/recursos/dolares.svg',
};

function formatNumber(num: number | undefined) {
    if (typeof num !== 'number') return '0';
    return Math.floor(num).toLocaleString('de-DE');
}

function getCapacityColor(current: number, max: number): string {
    const percentage = (current / max) * 100;
    if (percentage > 95) return 'text-red-500';
    if (percentage > 80) return 'text-yellow-500';
    return 'text-foreground';
}

interface ResourceBarProps {
    user: UserWithProgress | null;
}

export function ResourceBar({ user }: ResourceBarProps) {
    const { selectedProperty } = useProperty();

    if (!user || !selectedProperty) {
        return (
            <div className="w-full bg-background/95 backdrop-blur-sm text-white p-2">
                <div className="container mx-auto flex items-center justify-center">
                    <p>Selecciona una propiedad para ver tus recursos.</p>
                </div>
            </div>
        );
    }

    const capacity = calculateStorageCapacity(selectedProperty);

    const resources = [
        { name: 'ARMAS', value: selectedProperty.armas, icon: resourceIcons.armas, capacity: capacity.armas },
        { name: 'MUNICION', value: selectedProperty.municion, icon: resourceIcons.municion, capacity: capacity.municion },
        { name: 'ALCOHOL', value: selectedProperty.alcohol, icon: resourceIcons.alcohol, capacity: capacity.alcohol },
        { name: 'DOLARES', value: selectedProperty.dolares, icon: resourceIcons.dolares, capacity: capacity.dolares },
    ];

    return (
        <header className="w-full bg-background/95 backdrop-blur-sm text-white shadow-md z-20">
            <div className="container mx-auto flex h-full items-center justify-between p-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 md:flex md:items-center md:gap-x-6 w-full">
                    {resources.map((res) => (
                        <div key={res.name} className="flex items-center gap-2" title={`Capacidad: ${formatNumber(res.capacity)}`}>
                            <Image src={res.icon} alt={res.name} width={20} height={20} className="h-5 w-5" />
                            <div className="flex flex-col">
                                <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-muted-foreground">{res.name}</span>
                                <span className={cn("font-bold tabular-nums", getCapacityColor(res.value, res.capacity))}>
                                    {formatNumber(res.value)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <LiveClock />
            </div>
        </header>
    );
}
