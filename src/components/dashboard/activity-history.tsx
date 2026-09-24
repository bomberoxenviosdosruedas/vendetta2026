'use client';

import { useState } from 'react';
import Link from 'next/link';
import MaterialIcon from '@/components/ui/material-icon';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import type { ActivityItem, ActivityType, ActivityStatus } from '@/lib/data';

interface ActivityHistoryProps {
    activities: ActivityItem[];
}

function formatRelativeTime(dateInput: Date | string): string {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} d`;

    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function formatExactDateTime(dateInput: Date | string): string {
    const date = new Date(dateInput);
    return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function getActivityConfig(type: ActivityType) {
    switch (type) {
        case 'CONSTRUCCION':
            return {
                label: 'Construcción',
                iconName: 'construction',
                route: '/rooms',
                routeLabel: 'Ir a Habitaciones'
            };
        case 'RECLUTAMIENTO':
            return {
                label: 'Reclutamiento',
                iconName: 'group_add',
                route: '/recruitment',
                routeLabel: 'Ir a Reclutamiento'
            };
        case 'ATAQUE':
            return {
                label: 'Ataques y Misiones',
                iconName: 'swords',
                route: '/missions',
                routeLabel: 'Ir a Misiones'
            };
        case 'ENTRENAMIENTO':
            return {
                label: 'Investigación',
                iconName: 'psychology',
                route: '/training',
                routeLabel: 'Ir a Entrenamiento'
            };
        case 'SISTEMA':
        default:
            return {
                label: 'Sistema',
                iconName: 'shield',
                route: '/messages',
                routeLabel: 'Ir a Mensajes'
            };
    }
}

export function ActivityHistoryCard({ activities }: ActivityHistoryProps) {
    const [selectedTab, setSelectedTab] = useState<string>('TODAS');
    const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

    const filteredActivities = activities.filter(a => {
        if (selectedTab === 'TODAS') return true;
        return a.type === selectedTab;
    });

    const activeConfig = selectedActivity ? getActivityConfig(selectedActivity.type) : null;

    return (
        <section className="cell-darker p-2 border border-[#333333] space-y-2 text-[#dfdbc9]">
            <div className="crimson-th px-2 py-1 flex items-center justify-between font-['Chivo'] font-bold text-[11px] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                    <MaterialIcon name="history" size={15} className="text-[#fff400]" />
                    <span>HISTORIAL DE OPERACIONES ({activities.length})</span>
                </div>
                <div className="flex items-center gap-1">
                    {['TODAS', 'CONSTRUCCION', 'RECLUTAMIENTO', 'ATAQUE', 'ENTRENAMIENTO'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setSelectedTab(tab)}
                            className={`px-2 py-0.5 text-[9px] font-['JetBrains_Mono'] uppercase transition-colors min-h-[36px] ${
                                selectedTab === tab
                                    ? 'bg-[#6C0000] text-white font-bold border border-[#fff400]'
                                    : 'btn-tactical text-[#888888]'
                            }`}
                        >
                            {tab === 'CONSTRUCCION' ? 'OBRAS' : tab === 'RECLUTAMIENTO' ? 'RECLUT' : tab === 'ENTRENAMIENTO' ? 'I+D' : tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="divide-y divide-[#222222] cell-dark border border-[#333333]">
                {filteredActivities.length === 0 ? (
                    <p className="p-3 text-center text-[#888888] text-xs font-mono">
                        Sin operaciones registradas en esta categoría.
                    </p>
                ) : (
                    filteredActivities.slice(0, 8).map((activity) => {
                        const config = getActivityConfig(activity.type);
                        return (
                            <div
                                key={activity.id}
                                onClick={() => setSelectedActivity(activity)}
                                className="p-2 flex items-center justify-between gap-2 hover:bg-[#1a1a1a] cursor-pointer transition-colors text-xs font-['JetBrains_Mono']"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <MaterialIcon name={config.iconName} size={15} className="text-[#fabd00] shrink-0" />
                                    <span className="font-bold text-white truncate">{activity.title}</span>
                                    <span className="text-[#888888] text-[10px] hidden sm:inline truncate">{activity.description}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[#00ff00] text-[10px]">{formatRelativeTime(activity.timestamp)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                {selectedActivity && activeConfig && (
                    <DialogContent className="bg-[#0d0d0d] border-[#333333] text-[#dfdbc9] max-w-md">
                        <DialogHeader>
                            <DialogTitle className="crimson-th text-white p-2 font-['Chivo'] uppercase text-sm">
                                DETALLE DE OPERACIÓN
                            </DialogTitle>
                            <DialogDescription className="text-[#a0a0a0] text-xs font-['JetBrains_Mono'] pt-2">
                                {formatExactDateTime(selectedActivity.timestamp)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2 py-2 text-xs font-['JetBrains_Mono']">
                            <div className="cell-dark p-2 text-white font-bold">
                                {selectedActivity.title}
                            </div>
                            <div className="cell-dark p-2 text-[#a0a0a0]">
                                {selectedActivity.description}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-between">
                            <button
                                type="button"
                                onClick={() => setSelectedActivity(null)}
                                className="btn-tactical px-3 py-1 text-xs min-h-[44px]"
                            >
                                CERRAR
                            </button>
                            <Link href={activeConfig.route} className="btn-crimson px-3 py-1 text-xs font-bold min-h-[44px] flex items-center">
                                {activeConfig.routeLabel}
                            </Link>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </section>
    );
}
