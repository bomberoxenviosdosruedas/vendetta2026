
'use client'

import { Boxes, DollarSign, Droplets, Target } from 'lucide-react';
import { LiveClock } from "./live-clock";
import type { UserWithProgress } from '@/lib/data';
import { useProperty } from '@/contexts/property-context';

const resourceIcons = {
    armas: <Target className="h-5 w-5 text-destructive" />,
    municion: <Boxes className="h-5 w-5 text-blue-400" />,
    alcohol: <Droplets className="h-5 w-5 text-purple-400" />,
    dolares: <DollarSign className="h-5 w-5 text-green-400" />,
};

function formatNumber(num: number) {
    if (typeof num !== 'number') return '0';
    return Math.floor(num).toLocaleString('de-DE');
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

    const resources = [
        { name: 'ARMAS', value: selectedProperty.armas, icon: resourceIcons.armas },
        { name: 'MUNICION', value: selectedProperty.municion, icon: resourceIcons.municion },
        { name: 'ALCOHOL', value: selectedProperty.alcohol, icon: resourceIcons.alcohol },
        { name: 'DOLARES', value: selectedProperty.dolares, icon: resourceIcons.dolares },
    ];

    return (
        <header className="w-full bg-background/95 backdrop-blur-sm text-white shadow-md z-20">
            <div className="container mx-auto flex h-full items-center justify-between p-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 md:flex md:items-center md:gap-x-6 w-full">
                    {resources.map((res) => (
                        <div key={res.name} className="flex items-center gap-2">
                            {res.icon}
                            <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-muted-foreground">{res.name}</span>
                            <span className="font-bold text-foreground tabular-nums">
                                {formatNumber(res.value)}
                            </span>
                        </div>
                    ))}
                </div>
                <LiveClock />
            </div>
        </header>
    );
}
