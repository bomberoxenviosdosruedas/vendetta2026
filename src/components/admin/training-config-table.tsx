
import { getTrainingConfigurations } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card } from "../ui/card";

export async function TrainingConfigTable() {
    const trainings = await getTrainingConfigurations();

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead className="text-right">Armas</TableHead>
                        <TableHead className="text-right">Munición</TableHead>
                        <TableHead className="text-right">Dólares</TableHead>
                        <TableHead className="text-right">Duración (s)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trainings.map(training => (
                        <TableRow key={training.id}>
                            <TableCell className="font-mono text-xs">{training.id}</TableCell>
                            <TableCell className="font-medium">{training.nombre}</TableCell>
                            <TableCell>{training.puntos}</TableCell>
                            <TableCell className="text-right">{training.costoArmas.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{training.costoMunicion.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{training.costoDolares.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{training.duracion}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
