
import { getRoomConfigurations } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card } from "../ui/card";

export async function RoomConfigTable() {
    const rooms = await getRoomConfigurations();

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
                        <TableHead className="text-right">Prod. Base</TableHead>
                        <TableHead>Recurso</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rooms.map(room => (
                        <TableRow key={room.id}>
                            <TableCell className="font-mono text-xs">{room.id}</TableCell>
                            <TableCell className="font-medium">{room.nombre}</TableCell>
                            <TableCell>{room.puntos}</TableCell>
                            <TableCell className="text-right">{room.costoArmas.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{room.costoMunicion.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{room.costoDolares.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{room.duracion}</TableCell>
                            <TableCell className="text-right">{room.produccionBase}</TableCell>
                            <TableCell>{room.produccionRecurso || '-'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

