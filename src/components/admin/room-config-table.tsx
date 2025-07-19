
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
                        <TableHead className="text-right">Duración (s)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rooms.map(room => (
                        <TableRow key={room.id}>
                            <TableCell className="font-mono">{room.id}</TableCell>
                            <TableCell className="font-medium">{room.nombre}</TableCell>
                            <TableCell>{room.puntos}</TableCell>
                            <TableCell className="text-right">{room.duracion}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
