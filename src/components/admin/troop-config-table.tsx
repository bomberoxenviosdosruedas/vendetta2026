
'use client';
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { TroopConfigForm } from "./forms/troop-config-form";
import type { ConfiguracionTropa } from "@prisma/client";
import { DeleteConfigButton } from "./delete-config-button";
import { deleteTroopConfig } from "@/lib/actions/admin.actions";
import { FullConfiguracionTropa } from "@/lib/data";

interface TroopConfigTableProps {
    initialData: FullConfiguracionTropa[];
}

export function TroopConfigTable({ initialData }: TroopConfigTableProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FullConfiguracionTropa | null>(null);

    const handleEdit = (item: FullConfiguracionTropa) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setIsOpen(true);
    }
    
    return (
        <Card>
            <div className="p-4">
                <Button onClick={handleCreate}>Crear Nueva Tropa</Button>
            </div>
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
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialData.map(troop => (
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
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(troop)}>Editar</Button>
                                <DeleteConfigButton id={troop.id} action={deleteTroopConfig} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Editar' : 'Crear'} Tropa</DialogTitle>
                    </DialogHeader>
                    <TroopConfigForm troop={selectedItem} allTroops={initialData} onFinished={() => setIsOpen(false)} />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
