
'use client';
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { RoomConfigForm } from "./forms/room-config-form";
import type { ConfiguracionHabitacion } from "@prisma/client";
import { DeleteConfigButton } from "./delete-config-button";
import { deleteRoomConfig } from "@/lib/actions/admin.actions";

interface RoomConfigTableProps {
    initialData: ConfiguracionHabitacion[];
}

export function RoomConfigTable({ initialData }: RoomConfigTableProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<ConfiguracionHabitacion | null>(null);

    const handleEdit = (room: ConfiguracionHabitacion) => {
        setSelectedRoom(room);
        setIsOpen(true);
    };

    const handleCreate = () => {
        setSelectedRoom(null);
        setIsOpen(true);
    }
    
    return (
        <Card>
            <div className="p-4">
                <Button onClick={handleCreate}>Crear Nueva Habitación</Button>
            </div>
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
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialData.map(room => (
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
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>Editar</Button>
                                <DeleteConfigButton id={room.id} action={deleteRoomConfig} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedRoom ? 'Editar' : 'Crear'} Habitación</DialogTitle>
                    </DialogHeader>
                    <RoomConfigForm room={selectedRoom} onFinished={() => setIsOpen(false)} />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
