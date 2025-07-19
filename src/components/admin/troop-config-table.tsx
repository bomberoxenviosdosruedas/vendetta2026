
import { getTroopConfigurations } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card } from "../ui/card";

export async function TroopConfigTable() {
    const troops = await getTroopConfigurations();

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead className="text-right">Ataque</TableHead>
                        <TableHead className="text-right">Defensa</TableHead>
                        <TableHead className="text-right">Velocidad</TableHead>
                        <TableHead className="text-right">Capacidad</TableHead>
                        <TableHead className="text-right">Salario</TableHead>
                        <TableHead>Tipo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {troops.map(troop => (
                        <TableRow key={troop.id}>
                            <TableCell className="font-mono text-xs">{troop.id}</TableCell>
                            <TableCell className="font-medium">{troop.nombre}</TableCell>
                            <TableCell>{troop.puntos}</TableCell>
                            <TableCell className="text-right">{troop.ataque}</TableCell>
                            <TableCell className="text-right">{troop.defensa}</TableCell>
                            <TableCell className="text-right">{troop.velocidad}</TableCell>
                            <TableCell className="text-right">{troop.capacidad}</TableCell>
                            <TableCell className="text-right">{troop.salario}</TableCell>
                            <TableCell>{troop.tipo}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

