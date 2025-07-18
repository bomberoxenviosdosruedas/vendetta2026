import { getSessionUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Bell, Briefcase, MessageSquare, UserPlus } from "lucide-react";
import { QueueStatusCard } from "./queue-status-card";
import { getRoomConfigurations } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";


function ActionIcons() {
    // Estas son acciones placeholder, puedes darles funcionalidad en el futuro
    const actions = [
        { icon: <Bell className="h-5 w-5" />, notification: 0, label: "Notificaciones" },
        { icon: <MessageSquare className="h-5 w-5" />, notification: 3, label: "Mensajes" },
        { icon: <Briefcase className="h-5 w-5" />, notification: 0, label: "Operaciones" },
        { icon: <UserPlus className="h-5 w-5" />, notification: 1, label: "Invitaciones" },
    ]
    return (
        <div className="absolute top-4 right-4 flex flex-col items-center gap-3">
            {actions.map((action, index) => (
                 <TooltipProvider key={index} delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 bg-background/50 border-white/20 hover:bg-white/10 text-white relative">
                                {action.icon}
                                <span className="sr-only">{action.label}</span>
                                {action.notification > 0 && 
                                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0">{action.notification}</Badge>
                                }
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>{action.label}</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            ))}
        </div>
    )
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export async function OverviewView() {
    const user = await getSessionUser();

    if (!user) {
        return <div>Usuario no encontrado.</div>
    }

    const { puntuacion } = user;
    const allRoomConfigs = await getRoomConfigurations();
    const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre }));


    return (
        <div className="flex-grow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[min-content,1fr] gap-4 h-full">
                
                {/* Player Card */}
                <Card className="md:col-span-1 md:row-span-1">
                    <CardContent className="p-4 flex items-center gap-4 h-full">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="mafia boss" />
                            <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">Jugador</p>
                            <p className="text-xl font-bold">{user.name}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Property Card */}
                <Card className="md:col-span-1 md:row-span-2 relative overflow-hidden min-h-[250px]">
                    <Image 
                        src="https://placehold.co/600x400.png"
                        alt="Vista de la propiedad principal"
                        fill
                        className="object-cover"
                        data-ai-hint="mafia building dark"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <CardContent className="absolute bottom-0 left-0 p-4 text-white">
                        <p className="font-bold text-lg">Visión General - Propiedad Principal</p>
                        <p className="text-muted-foreground text-white/80">[1:1:1]</p>
                    </CardContent>
                </Card>

                {/* Family Card */}
                <Card className="md:col-span-1 md:row-span-2 relative min-h-[250px]">
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                            <AvatarFallback>B</AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">Familia</p>
                        <p className="text-xl font-bold tracking-widest">BADBOYS</p>
                    </CardContent>
                    <ActionIcons />
                </Card>
                
                 {/* Queue Status Card */}
                 <div className="md:col-span-3">
                    <QueueStatusCard user={user} allRooms={simpleRoomConfigs} />
                </div>
            </div>

            {/* Bottom Stats Bar */}
            <Card>
                <CardContent className="p-3 grid grid-cols-2 md:grid-cols-5 gap-y-2 gap-x-4 items-center justify-items-center">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Puntos (Entrenamiento)</p>
                        <p className="font-bold text-lg">{formatPoints(puntuacion?.puntosEntrenamientos)}</p>
                    </div>
                     <Separator orientation="vertical" className="h-8 hidden md:block" />
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Puntos (Edificios)</p>
                        <p className="font-bold text-lg">{formatPoints(puntuacion?.puntosHabitaciones)}</p>
                    </div>
                     <Separator orientation="vertical" className="h-8 hidden md:block" />
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Puntos (Tropas)</p>
                        <p className="font-bold text-lg">{formatPoints(puntuacion?.puntosTropas)}</p>
                    </div>
                    <Separator orientation="vertical" className="h-8 hidden md:block" />
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Edificios</p>
                        <p className="font-bold text-lg">{user.propiedades.length}</p>
                    </div>
                    <Separator orientation="vertical" className="h-8 hidden md:block" />
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Lealtad</p>
                        <p className="font-bold text-lg">99%</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
