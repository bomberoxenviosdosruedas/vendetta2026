'use client';

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
        <header className="w-full h-14 sm:h-auto min-h-[56px] sm:min-h-[56px] py-2 sm:py-0 bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-tactical z-20 sticky top-0">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-3 md:px-6 gap-3">
                {/* Resources - vertical stack on mobile, horizontal on tablet+ */}
                <nav 
                    className="flex flex-col sm:flex-row items-center gap-2 w-full sm:flex-1 min-w-0"
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
                                className={cn(
                                    "flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2",
                                    "px-2.5 py-1.5 sm:px-3 sm:py-2",
                                    "rounded-base border border-border/40 bg-card/80 backdrop-blur-sm",
                                    "flex-shrink-0 w-full sm:min-w-[140px] sm:max-w-[200px]"
                                )}
                                role="listitem"
                            >
                                <div className="flex items-center gap-1.5 w-full sm:w-auto flex-shrink-0">
                                    <div className={cn("flex-shrink-0 p-1.5 rounded-md", resourceBgColors[res.key])}>
                                        <Image 
                                            src={res.icon} 
                                            alt="" 
                                            width={20} 
                                            height={20} 
                                            className="h-5 w-5"
                                        />
                                    </div>
                                    <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-muted-foreground hidden sm:inline whitespace-nowrap">
                                        {res.name}
                                    </span>
                                </div>
                                
                                <div className="w-full sm:w-auto flex items-center justify-between gap-2 min-w-0">
                                    <span className={cn("font-bold tabular-nums text-sm sm:text-base", resourceColors[res.key])}>
                                        {formatNumber(res.value)}
                                    </span>
                                    <span className={cn("text-[11px] font-mono tabular-nums text-muted-foreground", textColor)}>
                                        / {formatNumber(res.capacity)}
                                    </span>
                                </div>
                                
                                {/* Capacity progress bar - full width on mobile, fixed width on desktop */}
                                <div className="w-full sm:w-24 h-1.5 bg-background/50 rounded-full overflow-hidden">
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
                <div className="flex-shrink-0 ml-auto sm:ml-0">
                    <LiveClock />
                </div>
            </div>
        </header>
    );
}