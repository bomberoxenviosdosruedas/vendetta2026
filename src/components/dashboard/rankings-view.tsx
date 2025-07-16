import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import type { UserForRanking } from "@/lib/data";
import { Separator } from "../ui/separator";

interface RankingsViewProps {
    users: UserForRanking[];
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function RankingsView({ users }: RankingsViewProps) {
    return (
        <Card>
            <CardContent className="p-0">
                {/* Vista de Tabla para Escritorio */}
                <Table className="hidden md:table">
                    <TableHeader>
                        <TableRow className="bg-primary/80 hover:bg-primary/90">
                            <TableHead className="w-[50px] text-primary-foreground font-bold">#</TableHead>
                            <TableHead className="text-primary-foreground font-bold">NOMBRE</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold">PUNTOS (ENTRÉN.)</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold">PUNTOS (EDIFICIOS)</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold">PUNTOS (TROPAS)</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold">SUMA</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold">EDIFICIOS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell className="font-bold">{user.name}</TableCell>
                                <TableCell className="text-right">{formatPoints(user.puntuacion?.puntosEntrenamientos)}</TableCell>
                                <TableCell className="text-right">{formatPoints(user.puntuacion?.puntosHabitaciones)}</TableCell>
                                <TableCell className="text-right">{formatPoints(user.puntuacion?.puntosTropas)}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{formatPoints(user.puntuacion?.puntosTotales)}</TableCell>
                                <TableCell className="text-right">{user._count.propiedades}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Vista de Tarjetas para Móvil */}
                <div className="md:hidden">
                    <div className="p-4 bg-primary/80 text-primary-foreground font-bold text-center">Clasificaciones</div>
                    <div className="space-y-2 p-2">
                        {users.map((user, index) => (
                            <Card key={user.id} className="p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                                        <span className="font-bold text-lg">{user.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-primary text-lg">{formatPoints(user.puntuacion?.puntosTotales)}</div>
                                        <div className="text-xs text-muted-foreground">Puntos Totales</div>
                                    </div>
                                </div>
                                <Separator className="my-3" />
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Entrenamiento:</span>
                                        <span className="font-semibold">{formatPoints(user.puntuacion?.puntosEntrenamientos)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Edificios:</span>
                                        <span className="font-semibold">{formatPoints(user.puntuacion?.puntosHabitaciones)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tropas:</span>
                                        <span className="font-semibold">{formatPoints(user.puntuacion?.puntosTropas)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Propiedades:</span>
                                        <span className="font-semibold">{user._count.propiedades}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}