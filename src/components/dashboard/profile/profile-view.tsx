
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserProfileData } from "@/lib/data";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileViewProps {
    user: UserProfileData;
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function ProfileView({ user }: ProfileViewProps) {
    const router = useRouter();

    const handleSendMission = (ciudad: number, barrio: number, edificio: number) => {
        const params = new URLSearchParams();
        params.set('ciudad', ciudad.toString());
        params.set('barrio', barrio.toString());
        params.set('edificio', edificio.toString());
        router.push(`/missions?${params.toString()}`);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6 flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="mafia boss" />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
                        <p className="text-lg text-muted-foreground">{user.title || 'Jefe Mafioso'}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Estadísticas de Puntuación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Puntos Totales</span>
                            <span className="font-bold text-lg text-primary">{formatPoints(user.puntuacion?.puntosTotales)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Puntos de Edificios</span>
                            <span className="text-sm font-semibold">{formatPoints(user.puntuacion?.puntosHabitaciones)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Puntos de Tropas</span>
                            <span className="text-sm font-semibold">{formatPoints(user.puntuacion?.puntosTropas)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Puntos de Entrenamiento</span>
                            <span className="text-sm font-semibold">{formatPoints(user.puntuacion?.puntosEntrenamientos)}</span>
                        </div>
                        <Separator />
                         <div className="flex justify-between text-xs text-muted-foreground pt-2">
                            <span>Miembro desde</span>
                            <span>{new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Propiedades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {user.propiedades.map(prop => (
                                <div key={prop.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{prop.nombre}</p>
                                        <p className="text-sm text-muted-foreground">[{prop.ciudad}:{prop.barrio}:{prop.edificio}]</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => handleSendMission(prop.ciudad, prop.barrio, prop.edificio)}>
                                        <Send className="mr-2 h-4 w-4" />
                                        Misión
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
