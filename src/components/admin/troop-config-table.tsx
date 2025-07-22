

'use client';
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { TroopConfigForm } from "./forms/troop-config-form";
import type { TipoTropa } from "@prisma/client";
import { DeleteConfigButton } from "./delete-config-button";
import { deleteTroopConfig } from "@/lib/actions/admin.actions";
import { FullConfiguracionEntrenamiento, FullConfiguracionTropa } from "@/lib/data";

interface TroopConfigTableProps {
    initialData: FullConfiguracionTropa[];
    allTrainings: FullConfiguracionEntrenamiento[];
    tiposTropa: string[];
}

export function TroopConfigTable({ initialData, allTrainings, tiposTropa }: TroopConfigTableProps) {
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
            <CardHeader>
                <CardTitle>Configuración de Tropas</CardTitle>
                <CardDescription>
                    Define las estadísticas, costos y requisitos de todas las unidades del juego.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Button onClick={handleCreate}>Crear Nueva Tropa</Button>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="hidden sm:table-cell">Puntos</TableHead>
                                <TableHead className="text-right">Ataque</TableHead>
                                <TableHead className="text-right">Defensa</TableHead>
                                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.map(troop => (
                                <TableRow key={troop.id}>
                                    <TableCell className="font-medium">{troop.nombre}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{troop.puntos}</TableCell>
                                    <TableCell className="text-right">{troop.ataque.toLocaleString('de-DE')}</TableCell>
                                    <TableCell className="text-right">{troop.defensa.toLocaleString('de-DE')}</TableCell>
                                    <TableCell className="hidden md:table-cell">{troop.tipo}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(troop)}>Editar</Button>
                                        <DeleteConfigButton id={troop.id} action={deleteTroopConfig} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
             <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl h-full flex flex-col sm:h-auto sm:max-h-[90svh]">
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Editar' : 'Crear'} Tropa</DialogTitle>
                         <DialogDescription>
                            Ajusta todos los parámetros de la unidad.
                        </DialogDescription>
                    </DialogHeader>
                    <TroopConfigForm 
                        troop={selectedItem} 
                        allTroops={initialData} 
                        allTrainings={allTrainings}
                        tiposTropa={tiposTropa}
                        onFinished={() => setIsOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
