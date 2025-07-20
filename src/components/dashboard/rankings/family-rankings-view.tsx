
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import type { FullFamily } from "@/lib/data";
import { Separator } from "@/components/ui/separator";

interface FamilyRankingsViewProps {
    families: FullFamily[];
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function FamilyRankingsView({ families }: FamilyRankingsViewProps) {
    if (!families || families.length === 0) {
        return (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No hay familias en la clasificación.
                </CardContent>
            </Card>
        )
    }

    // You might need to calculate total points for families in the future
    const sortedFamilies = families; //.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-primary/80 hover:bg-primary/90">
                            <TableHead className="w-[50px] text-primary-foreground font-bold">#</TableHead>
                            <TableHead className="text-primary-foreground font-bold">NOMBRE</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold">PUNTOS TOTALES</TableHead>
                            <TableHead className="text-right text-primary-foreground font-bold">MIEMBROS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedFamilies.map((family, index) => (
                            <TableRow key={family.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell className="font-bold">[{family.tag}] {family.name}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{formatPoints(0)}</TableCell>
                                <TableCell className="text-right">{family.members.length}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
