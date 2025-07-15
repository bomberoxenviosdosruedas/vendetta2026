
import { getSessionUser } from "@/lib/auth";
import { Boxes, DollarSign, Droplets, Target, Clock, Bot } from 'lucide-react';
import { LiveClock } from "./live-clock";
import type { User } from "@prisma/client";

const resourceIcons = {
    armas: <Target className="h-5 w-5" />,
    municion: <Boxes className="h-5 w-5" />,
    alcohol: <Droplets className="h-5 w-5" />,
    dolares: <DollarSign className="h-5 w-5" />,
};

function formatNumber(num: number) {
    return num.toLocaleString('de-DE');
}

interface ResourceBarProps {
    user: User | null;
}

export function ResourceBar({ user }: ResourceBarProps) {
    if (!user) {
        return (
            <div className="w-full bg-gray-800 text-white p-2">
                <div className="container mx-auto flex items-center justify-center">
                    <p>No se pudieron cargar los datos del usuario.</p>
                </div>
            </div>
        );
    }
    
    const resources = [
        { name: 'ARMAS', value: user.armas, icon: resourceIcons.armas },
        { name: 'MUNICION', value: user.municion, icon: resourceIcons.municion },
        { name: 'ALCOHOL', value: user.alcohol, icon: resourceIcons.alcohol },
        { name: 'DOLARES', value: user.ingresos, icon: resourceIcons.dolares, isCurrency: true },
    ];

    return (
        <header className="w-full bg-gray-900 text-white shadow-md z-20">
            <div className="container mx-auto flex h-full items-center justify-between p-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 md:flex md:items-center md:gap-x-6 w-full">
                    {resources.map((res) => (
                        <div key={res.name} className="flex items-center gap-2">
                            {res.icon}
                            <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase">{res.name}</span>
                            <span className="font-bold text-red-500 tabular-nums">
                                {res.isCurrency ? `$${formatNumber(res.value)}` : formatNumber(res.value)}
                            </span>
                        </div>
                    ))}
                </div>
                <LiveClock />
            </div>
        </header>
    );
}
