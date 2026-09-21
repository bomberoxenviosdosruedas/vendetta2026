'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Building2, 
    Users, 
    Swords, 
    FlaskConical, 
    ShieldAlert, 
    History, 
    Clock, 
    CheckCircle2, 
    Compass, 
    ExternalLink, 
    Calendar, 
    MapPin, 
    ArrowUpRight,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;

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
                icon: Building2,
                colorClass: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
                badgeClass: 'text-amber-300 border-amber-800/60 bg-amber-950/50',
                route: '/rooms',
                routeLabel: 'Ir a Habitaciones'
            };
        case 'RECLUTAMIENTO':
            return {
                label: 'Reclutamiento',
                icon: Users,
                colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
                badgeClass: 'text-emerald-300 border-emerald-800/60 bg-emerald-950/50',
                route: '/recruitment',
                routeLabel: 'Ir a Reclutamiento'
            };
        case 'ATAQUE':
            return {
                label: 'Ataques y Misiones',
                icon: Swords,
                colorClass: 'text-red-400 bg-red-950/40 border-red-800/50',
                badgeClass: 'text-red-300 border-red-800/60 bg-red-950/50',
                route: '/missions',
                routeLabel: 'Ir a Misiones'
            };
        case 'ENTRENAMIENTO':
            return {
                label: 'Investigación',
                icon: FlaskConical,
                colorClass: 'text-sky-400 bg-sky-950/40 border-sky-800/50',
                badgeClass: 'text-sky-300 border-sky-800/60 bg-sky-950/50',
                route: '/training',
                routeLabel: 'Ir a Entrenamiento'
            };
        case 'SISTEMA':
        default:
            return {
                label: 'Sistema',
                icon: ShieldAlert,
                colorClass: 'text-purple-400 bg-purple-950/40 border-purple-800/50',
                badgeClass: 'text-purple-300 border-purple-800/60 bg-purple-950/50',
                route: '/messages',
                routeLabel: 'Ir a Mensajes'
            };
    }
}

function renderStatusBadge(status: ActivityStatus) {
    switch (status) {
        case 'COMPLETADO':
            return (
                <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-800/60 bg-emerald-950/40 gap-1 font-medium whitespace-nowrap">
                    <CheckCircle2 className="h-3 w-3" />
                    Completado
                </Badge>
            );
        case 'EN_CURSO':
            return (
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-800/60 bg-amber-950/40 gap-1 font-medium whitespace-nowrap">
                    <Clock className="h-3 w-3 animate-pulse" />
                    En curso
                </Badge>
            );
        case 'DESPLEGADO':
            return (
                <Badge variant="outline" className="text-xs text-red-400 border-red-800/60 bg-red-950/40 gap-1 font-medium whitespace-nowrap">
                    <Compass className="h-3 w-3 animate-spin" />
                    Desplegado
                </Badge>
            );
    }
}

export function ActivityHistoryCard({ activities }: ActivityHistoryProps) {
    const [selectedTab, setSelectedTab] = useState<string>('TODAS');
    const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
    const [showAll, setShowAll] = useState<boolean>(false);

    const counts = {
        TODAS: activities.length,
        CONSTRUCCION: activities.filter(a => a.type === 'CONSTRUCCION').length,
        RECLUTAMIENTO: activities.filter(a => a.type === 'RECLUTAMIENTO').length,
        ATAQUE: activities.filter(a => a.type === 'ATAQUE').length,
        ENTRENAMIENTO: activities.filter(a => a.type === 'ENTRENAMIENTO').length,
    };

    const filteredActivities = activities.filter(a => {
        if (selectedTab === 'TODAS') return true;
        return a.type === selectedTab;
    });

    const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 6);

    const activeConfig = selectedActivity ? getActivityConfig(selectedActivity.type) : null;

    return (
        <Card id="activity-history-card" className="rounded-base border border-border/60 bg-card/80 shadow-tactical">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <History className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg font-bold tracking-tight">Historial de Actividad</CardTitle>
                                <Badge variant="secondary" className="text-xs font-mono">
                                    {activities.length} {activities.length === 1 ? 'registro' : 'registros'}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                Registro en tiempo real de construcciones, reclutamientos y despliegues militares.
                            </CardDescription>
                        </div>
                    </div>

                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto">
                        <Link href="/messages?categoria=CONSTRUCCION">
                            Centro de Mensajes
                            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 text-xs">
                    <button
                        id="tab-todas"
                        type="button"
                        onClick={() => setSelectedTab('TODAS')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            selectedTab === 'TODAS'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        Todas
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            selectedTab === 'TODAS' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/80 text-muted-foreground'
                        }`}>
                            {counts.TODAS}
                        </span>
                    </button>

                    <button
                        id="tab-construccion"
                        type="button"
                        onClick={() => setSelectedTab('CONSTRUCCION')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            selectedTab === 'CONSTRUCCION'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Building2 className="h-3.5 w-3.5" />
                        Construcción
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            selectedTab === 'CONSTRUCCION' ? 'bg-white/20 text-white' : 'bg-background/80 text-muted-foreground'
                        }`}>
                            {counts.CONSTRUCCION}
                        </span>
                    </button>

                    <button
                        id="tab-reclutamiento"
                        type="button"
                        onClick={() => setSelectedTab('RECLUTAMIENTO')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            selectedTab === 'RECLUTAMIENTO'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Users className="h-3.5 w-3.5" />
                        Reclutamiento
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            selectedTab === 'RECLUTAMIENTO' ? 'bg-white/20 text-white' : 'bg-background/80 text-muted-foreground'
                        }`}>
                            {counts.RECLUTAMIENTO}
                        </span>
                    </button>

                    <button
                        id="tab-ataques"
                        type="button"
                        onClick={() => setSelectedTab('ATAQUE')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            selectedTab === 'ATAQUE'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Swords className="h-3.5 w-3.5" />
                        Ataques y Misiones
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            selectedTab === 'ATAQUE' ? 'bg-white/20 text-white' : 'bg-background/80 text-muted-foreground'
                        }`}>
                            {counts.ATAQUE}
                        </span>
                    </button>

                    <button
                        id="tab-entrenamiento"
                        type="button"
                        onClick={() => setSelectedTab('ENTRENAMIENTO')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            selectedTab === 'ENTRENAMIENTO'
                                ? 'bg-sky-600 text-white shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <FlaskConical className="h-3.5 w-3.5" />
                        Investigación
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            selectedTab === 'ENTRENAMIENTO' ? 'bg-white/20 text-white' : 'bg-background/80 text-muted-foreground'
                        }`}>
                            {counts.ENTRENAMIENTO}
                        </span>
                    </button>
                </div>
            </CardHeader>

            <CardContent className="pt-3">
                {displayedActivities.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 rounded-full bg-muted/40 border border-border/40 text-muted-foreground">
                            <History className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">No hay actividades en esta categoría</p>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Las órdenes iniciadas y finalizadas quedarán registradas automáticamente aquí.
                            </p>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                                <Link href="/rooms">Construir</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                                <Link href="/recruitment">Reclutar</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                                <Link href="/map">Explorar Mapa</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayedActivities.map((activity) => {
                            const config = getActivityConfig(activity.type);
                            const IconComponent = config.icon;

                            return (
                                <div
                                    id={`activity-item-${activity.id}`}
                                    key={activity.id}
                                    onClick={() => setSelectedActivity(activity)}
                                    className="group flex items-start justify-between gap-3 p-2.5 rounded-lg border border-border/40 bg-card/40 hover:bg-accent/40 hover:border-border/80 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        {/* Icon Badge */}
                                        <div className={`mt-0.5 p-2 rounded-md border shrink-0 ${config.colorClass}`}>
                                            <IconComponent className="h-4 w-4" />
                                        </div>

                                        {/* Text Content */}
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                                                    {activity.title}
                                                </h4>
                                                {renderStatusBadge(activity.status)}
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {activity.description}
                                            </p>

                                            {/* Meta pills */}
                                            {(activity.propertyName || activity.coordinates) && (
                                                <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground/80">
                                                    {activity.propertyName && (
                                                        <span className="inline-flex items-center gap-1 font-mono">
                                                            <MapPin className="h-3 w-3 text-amber-500/80" />
                                                            {activity.propertyName}
                                                        </span>
                                                    )}
                                                    {activity.coordinates && (
                                                        <span className="font-mono text-muted-foreground">
                                                            {activity.coordinates}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timestamp & CTA Indicator */}
                                    <div className="flex flex-col items-end shrink-0 pl-2">
                                        <span 
                                            className="text-[11px] font-mono text-muted-foreground whitespace-nowrap"
                                            title={formatExactDateTime(activity.timestamp)}
                                        >
                                            {formatRelativeTime(activity.timestamp)}
                                        </span>
                                        <span className="text-[10px] text-primary/70 group-hover:text-primary mt-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Detalles
                                            <ArrowUpRight className="h-3 w-3" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Expand / Collapse Button */}
                        {filteredActivities.length > 6 && (
                            <div className="pt-2 text-center">
                                <Button
                                    id="btn-toggle-activity-count"
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAll(!showAll)}
                                    className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
                                >
                                    {showAll ? (
                                        <>
                                            <ChevronUp className="h-3.5 w-3.5" />
                                            Mostrar menos
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-3.5 w-3.5" />
                                            Ver todas las actividades ({filteredActivities.length})
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Activity Details Modal */}
            <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                {selectedActivity && activeConfig && (
                    <DialogContent className="sm:max-w-md border-border bg-card">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className={`p-1.5 rounded-md border ${activeConfig.colorClass}`}>
                                    <activeConfig.icon className="h-4 w-4" />
                                </div>
                                <Badge variant="outline" className={`text-xs ${activeConfig.badgeClass}`}>
                                    {activeConfig.label}
                                </Badge>
                                {renderStatusBadge(selectedActivity.status)}
                            </div>
                            <DialogTitle className="text-base font-bold text-foreground">
                                {selectedActivity.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatExactDateTime(selectedActivity.timestamp)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2 text-sm">
                            <div className="rounded-lg bg-muted/30 border border-border/50 p-3 text-xs leading-relaxed text-muted-foreground">
                                {selectedActivity.description}
                            </div>

                            {(selectedActivity.propertyName || selectedActivity.coordinates) && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {selectedActivity.propertyName && (
                                        <div className="p-2.5 rounded-md bg-muted/20 border border-border/40">
                                            <span className="text-[11px] text-muted-foreground block">Propiedad</span>
                                            <span className="font-semibold text-foreground">{selectedActivity.propertyName}</span>
                                        </div>
                                    )}
                                    {selectedActivity.coordinates && (
                                        <div className="p-2.5 rounded-md bg-muted/20 border border-border/40">
                                            <span className="text-[11px] text-muted-foreground block">Coordenadas</span>
                                            <span className="font-mono font-semibold text-foreground">{selectedActivity.coordinates}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedActivity(null)}
                                    className="h-8 text-xs"
                                >
                                    Cerrar
                                </Button>

                                <Button asChild size="sm" className="h-8 text-xs gap-1">
                                    <Link href={activeConfig.route}>
                                        {activeConfig.routeLabel}
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </Card>
    );
}
