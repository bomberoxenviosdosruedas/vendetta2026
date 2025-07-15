import { getSessionUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Bell, Briefcase, MessageSquare, ShieldCheck, Swords, UserPlus } from "lucide-react";


async function ActionIcons() {
    // Estas son acciones placeholder, puedes darles funcionalidad en el futuro
    const actions = [
        { icon: <Bell className="h-5 w-5" />, notification: 5, label: "Notificaciones" },
        { icon: <MessageSquare className="h-5 w-5" />, notification: 12, label: "Mensajes" },
        { icon: <Briefcase className="h-5 w-5" />, notification: 2, label: "Operaciones" },
        { icon: <UserPlus className="h-5 w-5" />, notification: 1, label: "Invitaciones" },
    ]
    return (
        <div className="absolute top-4 right-4 flex flex-col items-center gap-3">
            {actions.map((action, index) => (
                <div key={index} className="relative">
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-background/50 border-white/20 hover:bg-white/10 text-white">
                        {action.icon}
                        <span className="sr-only">{action.label}</span>
                    </Button>
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">{action.notification}</Badge>
                </div>
            ))}
        </div>
    )
}

export async function OverviewView() {
    const user = await getSessionUser();

    if (!user) {
        return <div>Usuario no encontrado.</div>
    }

    return (
        <div className="flex-grow p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-[min-content,1fr] gap-4 h-full">
                
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
                <Card className="md:col-span-2 md:row-span-2 relative overflow-hidden">
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
                <Card className="md:col-span-1 md:row-span-2 relative">
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                            {/* Idealmente aquí iría el logo de la familia */}
                            <AvatarImage src="https://placehold.co/128x128.png" alt="Logo Familia" data-ai-hint="mafia family crest" />
                            <AvatarFallback>B</AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">Familia</p>
                        <p className="text-xl font-bold tracking-widest">BADBOYS</p>
                    </CardContent>
                    <ActionIcons />
                </Card>

                {/* Status Card */}
                <Card className="md:col-span-1 md:row-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Estado Actual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Misiones</p>
                                <p className="text-xs text-muted-foreground">3 misiones activas</p>
                            </div>
                            <Button variant="outline" size="sm">Ver misiones</Button>
                       </div>
                       <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Construcción</p>
                                <p className="text-xs text-muted-foreground">2 edificios en cola</p>
                            </div>
                            <Button variant="outline" size="sm">Mostrar todo</Button>
                       </div>
                       <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Reclutamiento</p>
                                <p className="text-xs text-muted-foreground">5 unidades en cola</p>
                            </div>
                            <Button variant="outline" size="sm">Mostrar todo</Button>
                       </div>
                    </CardContent>
                </Card>
                
                {/* Security and Training Cards */}
                <div className="md:col-span-1 md:row-span-2 flex flex-col gap-4">
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-base">Seguridad</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-400">ÓPTIMA</p>
                            <p className="text-xs text-muted-foreground">Tus defensas están al máximo.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-base">Entrenamiento</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-2xl font-bold">3/5 Unidades</p>
                             <p className="text-xs text-muted-foreground">Entrenando sicarios...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Stats Bar */}
            <Card>
                <CardContent className="p-3 grid grid-cols-2 md:grid-cols-5 gap-y-2 gap-x-4 items-center justify-items-center">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Puntos (Entrenamiento)</p>
                        <p className="font-bold text-lg">686</p>
                    </div>
                     <Separator orientation="vertical" className="h-8 hidden md:block" />
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Puntos (Edificios)</p>
                        <p className="font-bold text-lg">63</p>
                    </div>
                     <Separator orientation="vertical" className="h-8 hidden md:block" />
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Puntos (Tropas)</p>
                        <p className="font-bold text-lg">74</p>
                    </div>
                    <Separator orientation="vertical" className="h-8 hidden md:block" />
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Edificios</p>
                        <p className="font-bold text-lg">1</p>
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
