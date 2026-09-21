import { getSessionUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Bell, Briefcase, MessageSquare, Users2, Building2, ChevronRight, ShieldCheck, MapPin } from "lucide-react";
import { QueueStatusCard } from "./queue-status-card";
import { ActivityHistoryCard } from "./activity-history";
import { CityNewsCard } from "./city-news-ticker";
import { getRoomConfigurations, getUserActivityHistory } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";

function ActionIcons({ unreadMessages }: { unreadMessages: number }) {
    const actions = [
        { href: "/messages?categoria=SISTEMA", icon: <Bell className="h-4 w-4" />, notification: 0, label: "Notificaciones del Sistema" },
        { href: "/messages", icon: <MessageSquare className="h-4 w-4" />, notification: unreadMessages, label: "Mensajes Clandestinos" },
        { href: "/settings", icon: <Briefcase className="h-4 w-4" />, notification: 0, label: "Ajustes de la Organización" },
    ];

    return (
        <div className="flex items-center gap-1.5">
            {actions.map((action, index) => (
                <TooltipProvider key={index} delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                asChild 
                                variant="outline" 
                                size="icon" 
                                className="h-11 w-11 bg-background/60 border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white relative btn-tactical-press min-h-[44px] min-w-[44px]"
                            >
                                <Link href={action.href}>
                                    {action.icon}
                                    <span className="sr-only">{action.label}</span>
                                    {action.notification > 0 && (
                                        <Badge 
                                            variant="destructive" 
                                            className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-mono leading-none bg-red-600 animate-pulse-subtle"
                                        >
                                            {action.notification}
                                        </Badge>
                                    )}
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p className="text-xs sm:text-base">{action.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
        </div>
    );
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export async function OverviewView() {
    const user = await getSessionUser();

    if (!user) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Usuario no encontrado o sesión expirada.
            </div>
        );
    }

    const { puntuacion, familyMember } = user;
    const [allRoomConfigs, activities] = await Promise.all([
        getRoomConfigurations(),
        getUserActivityHistory(user.id)
    ]);
    const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre }));
    const unreadMessages = user._count?.receivedMessages || 0;

    const puntosTotales = (puntuacion?.puntosHabitaciones || 0) + 
                          (puntuacion?.puntosTropas || 0) + 
                          (puntuacion?.puntosEntrenamientos || 0);

    const mainProperty = user.propiedades[0];

    return (
        <div className="flex-grow space-y-4 max-w-7xl mx-auto w-full px-3 md:px-6">
            {/* Top Tactical Command Header (Responsive: 1→2→3 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Boss Dossier Card */}
                <Card className="tactical-card flex flex-col justify-between p-4 min-h-[200px] sm:min-h-[250px]">
                    <div>
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/40">
                            <span className="text-[11px] font-mono font-medium tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                EXPEDIENTE CRIMINAL
                            </span>
                            <ActionIcons unreadMessages={unreadMessages} />
                        </div>

                        <div className="flex items-center gap-3.5 mt-4">
                            <Avatar className="h-16 w-16 border-2 border-primary ring-2 ring-primary/20 shadow-md flex-shrink-0">
                                <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="mafia boss" />
                                <AvatarFallback className="bg-surface-elevated text-zinc-100 font-heading text-xl">
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-base text-muted-foreground uppercase tracking-wider font-mono">
                                    {user.title || "Don de la Familia"}
                                </p>
                                <h3 className="text-2xl font-bold font-heading tracking-wide text-zinc-100 truncate">
                                    {user.name}
                                </h3>
                                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded mt-1">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                    </span>
                                    EN LÍNEA // OPERATIVO
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs sm:text-base mt-3">
                        <span className="text-muted-foreground uppercase font-mono tracking-wider">
                            Puntuación Global
                        </span>
                        <span className="font-mono font-bold text-accent tabular-nums text-sm">
                            {formatPoints(puntosTotales)} pts
                        </span>
                    </div>
                </Card>

                {/* 2. Main Turf Headquarters Card */}
                <Card className="relative overflow-hidden min-h-[200px] sm:min-h-[250px] rounded-lg border border-border/60 shadow-lg group flex flex-col justify-between">
                    <div className="relative aspect-[16/9] w-full">
                        <Image 
                            src="/nuevas/edificionuevo.jpg"
                            alt="Vista de la sede principal"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            data-ai-hint="mafia building dark"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

                    {/* Top coordinate badge */}
                    <div className="relative z-10 p-4 flex items-center justify-between flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-200 bg-black/60 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded whitespace-nowrap">
                            <Building2 className="h-3 w-3 text-primary" />
                            SEDE PRINCIPAL
                        </span>
                        {mainProperty && (
                            <span className="text-[11px] font-mono text-red-400 bg-red-950/70 border border-red-900/50 px-2 py-0.5 rounded whitespace-nowrap">
                                [{mainProperty.ciudad}:{mainProperty.barrio}:{mainProperty.edificio}]
                            </span>
                        )}
                    </div>

                    {/* Bottom property details & quick action */}
                    <div className="relative z-10 p-4 flex items-end justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-base text-zinc-400 uppercase font-mono tracking-wider">
                                Cuartel General
                            </p>
                            <h3 className="text-xl font-bold font-heading tracking-wide text-white uppercase truncate">
                                {mainProperty?.nombre || "Propiedad Principal"}
                            </h3>
                        </div>
                        {mainProperty && (
                            <Button 
                                asChild 
                                size="sm" 
                                variant="outline" 
                                className="bg-black/60 backdrop-blur-md border-white/20 hover:bg-white/10 text-white text-xs sm:text-base h-10 px-3 btn-tactical-press min-h-[44px] flex-shrink-0"
                            >
                                <Link href={`/rooms/${mainProperty.ciudad}:${mainProperty.barrio}:${mainProperty.edificio}`}>
                                    Entrar
                                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </Card>

                {/* 3. Syndicate / Family Card */}
                <Card className="tactical-card flex flex-col justify-between p-4 min-h-[200px] sm:min-h-[250px]">
                    <div>
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/40">
                            <span className="text-[11px] font-mono font-medium tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                                <Users2 className="h-3.5 w-3.5 text-accent" />
                                SINDICATO CLANDESTINO
                            </span>
                            <Badge 
                                variant="outline" 
                                className={`text-[10px] font-mono uppercase ${
                                    familyMember 
                                        ? 'border-accent/40 text-accent bg-accent/10' 
                                        : 'border-zinc-700 text-zinc-400'
                                }`}
                            >
                                {familyMember ? 'AFILIADO' : 'INDEPENDIENTE'}
                            </Badge>
                        </div>

                        <div className="mt-3 flex flex-col items-center text-center">
                            {familyMember ? (
                                <>
                                    <Avatar className="h-14 w-14 border-2 border-accent ring-2 ring-accent/20 shadow-md mb-2">
                                        <AvatarImage src={familyMember.family.avatarUrl || ''} alt={familyMember.family.name} data-ai-hint="family crest" />
                                        <AvatarFallback className="bg-surface-elevated text-accent font-heading text-lg">
                                            {familyMember.family.tag}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h4 className="text-xl font-bold font-heading tracking-widest text-zinc-100">
                                        {familyMember.family.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                                        <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0 border border-white/10">
                                            [{familyMember.family.tag}]
                                        </Badge>
                                        <span className="text-xs sm:text-base text-muted-foreground font-mono">
                                            Rol: <span className="text-zinc-200">{familyMember.role}</span>
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="h-12 w-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground mb-2">
                                        <Users2 className="h-6 w-6" />
                                    </div>
                                    <p className="text-base font-bold font-heading text-zinc-200">
                                        Sin Familia Asignada
                                    </p>
                                    <p className="text-xs sm:text-base text-muted-foreground mt-0.5 max-w-[200px]">
                                        Únete a un clan para protección territorial y bonificaciones.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 mt-3">
                        <Button 
                            asChild 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs sm:text-base h-10 bg-surface-elevated/80 hover:bg-surface-overlay border-border/80 text-zinc-200 btn-tactical-press min-h-[44px]"
                        >
                            <Link href="/family">
                                {familyMember ? 'Cuartel de Familia' : 'Buscar o Fundar Familia'}
                                <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Link>
                        </Button>
                    </div>
                </Card>
            </div>

            {/* City News Ticker */}
            <CityNewsCard />

            {/* Live Operational Queues */}
            <QueueStatusCard user={user} allRooms={simpleRoomConfigs} />

            {/* Recent Activity Ledger */}
            <ActivityHistoryCard activities={activities} />

            {/* Syndicate Empire Ledger (Bottom Stats Bar - Real Data) */}
            <Card className="tactical-card">
                <CardContent className="p-3.5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
                        <div className="text-center p-2 sm:py-1">
                            <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                                Puntos Totales
                            </p>
                            <p className="font-bold font-mono tabular-nums text-lg sm:text-xl text-accent">
                                {formatPoints(puntosTotales)}
                            </p>
                        </div>
                        <Separator orientation="vertical" className="h-10 mx-auto hidden sm:block bg-border/60" />
                        <div className="text-center p-2 sm:py-1">
                            <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                                Habitaciones
                            </p>
                            <p className="font-bold font-mono tabular-nums text-lg sm:text-xl text-zinc-100">
                                {formatPoints(puntuacion?.puntosHabitaciones)}
                            </p>
                        </div>
                        <Separator orientation="vertical" className="h-10 mx-auto hidden sm:block bg-border/60" />
                        <div className="text-center p-2 sm:py-1">
                            <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                                Tropas
                            </p>
                            <p className="font-bold font-mono tabular-nums text-lg sm:text-xl text-zinc-100">
                                {formatPoints(puntuacion?.puntosTropas)}
                            </p>
                        </div>
                        <Separator orientation="vertical" className="h-10 mx-auto hidden sm:block bg-border/60" />
                        <div className="text-center p-2 sm:py-1">
                            <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                                Entrenamientos
                            </p>
                            <p className="font-bold font-mono tabular-nums text-lg sm:text-xl text-zinc-100">
                                {formatPoints(puntuacion?.puntosEntrenamientos)}
                            </p>
                        </div>
                        <Separator orientation="vertical" className="h-10 mx-auto hidden sm:block bg-border/60" />
                        <div className="text-center p-2 sm:py-1">
                            <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                                Territorios
                            </p>
                            <p className="font-bold font-mono tabular-nums text-lg sm:text-xl text-zinc-100">
                                {user.propiedades.length}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
