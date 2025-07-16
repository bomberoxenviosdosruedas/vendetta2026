
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
                <Table>
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
            </CardContent>
        </Card>
    )
}
