
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

const resourceColors: { [key: string]: string } = {
    armas: 'text-resource-armas',
    municion: 'text-resource-municion',
    alcohol: 'text-resource-alcohol',
    dolares: 'text-resource-dolares',
};

const resourceBgColors: { [key: string]: string } = {
    armas: 'bg-resource-armas/15',
    municion: 'bg-resource-municion/15',
    alcohol: 'bg-resource-alcohol/15',
    dolares: 'bg-resource-dolares/15',
};

function formatNumber(num: number | undefined) {
    if (typeof num !== 'number') return '0';
    return Math.floor(num).toLocaleString('de-DE');
}

function getCapacityColor(current: number, max: number): string {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    if (percentage > 95) return 'text-red-500';
    if (percentage > 80) return 'text-yellow-500';
    return 'text-accent';
}

function getProgressColor(current: number, max: number): string {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    if (percentage > 95) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-accent';
}

interface ResourceBarProps {
    user: UserWithProgress | null;
}

export function ResourceBar({ user }: ResourceBarProps) {
    const { selectedProperty } = useProperty();

    if (!user || !selectedProperty) {
        return (
            <header className="w-full h-14 bg-background/95 backdrop-blur-sm border-b border-border/40">
                <div className="container mx-auto flex h-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">Selecciona una propiedad para ver tus recursos.</p>
                </div>
            </header>
        );
    }

    const capacity = calculateStorageCapacity(selectedProperty);

    const resources = [
        { key: 'armas', name: 'ARMAS', value: selectedProperty.armas, icon: resourceIcons.armas, capacity: capacity.armas },
        { key: 'municion', name: 'MUNICIÓN', value: selectedProperty.municion, icon: resourceIcons.municion, capacity: capacity.municion },
        { key: 'alcohol', name: 'ALCOHOL', value: selectedProperty.alcohol, icon: resourceIcons.alcohol, capacity: capacity.alcohol },
        { key: 'dolares', name: 'DÓLARES', value: selectedProperty.dolares, icon: resourceIcons.dolares, capacity: capacity.dolares },
    ];

    return (
        <header className="w-full h-14 bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-md z-20 sticky top-0">
            <div className="container mx-auto flex h-full items-center justify-between px-3 md:px-6 gap-4">
                {/* Resources - horizontal scroll on mobile, grid on larger screens */}
                <nav 
                    className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1 flex-shrink-0 min-w-0"
                    role="list"
                    aria-label="Recursos de la propiedad"
                >
                    {resources.map((res) => {
                        const percentage = res.capacity > 0 ? Math.min(100, (res.value / res.capacity) * 100) : 0;
                        const progressColor = getProgressColor(res.value, res.capacity);
                        const textColor = getCapacityColor(res.value, res.capacity);
                        
                        return (
                            <div 
                                key={res.key} 
                                className="flex flex-col items-start gap-1 min-w-[140px] sm:min-w-[160px] px-2.5 py-1.5 rounded-lg border border-border/40 bg-card/80 backdrop-blur-sm flex-shrink-0"
                                role="listitem"
                            >
                                <div className="flex items-center gap-1.5 w-full">
                                    <div className={cn("flex-shrink-0 p-1 rounded", resourceBgColors[res.key])}>
                                        <Image 
                                            src={res.icon} 
                                            alt="" 
                                            width={18} 
                                            height={18} 
                                            className="h-4.5 w-4.5"
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground hidden sm:inline">
                                        {res.name}
                                    </span>
                                </div>
                                
                                <div className="w-full flex items-center justify-between gap-2">
                                    <span className={cn("font-bold tabular-nums text-sm sm:text-base", resourceColors[res.key])}>
                                        {formatNumber(res.value)}
                                    </span>
                                    <span className={cn("text-[10px] font-mono tabular-nums text-muted-foreground", textColor)}>
                                        / {formatNumber(res.capacity)}
                                    </span>
                                </div>
                                
                                {/* Capacity progress bar */}
                                <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-500 ease-out", progressColor)}
                                        style={{ width: `${percentage}%` }}
                                        role="progressbar"
                                        aria-valuenow={Math.round(percentage)}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`${res.name}: ${Math.round(percentage)}% de capacidad`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </nav>
                
                {/* Clock - fixed position on right */}
                <div className="flex-shrink-0 ml-auto hidden sm:block">
                    <LiveClock />
                </div>
                <div className="flex-shrink-0 ml-2 sm:hidden">
                    <LiveClock />
                </div>
            </div>
        </header>
    );
}
