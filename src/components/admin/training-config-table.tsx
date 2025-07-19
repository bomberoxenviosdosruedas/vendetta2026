
'use client';
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { TrainingConfigForm } from "./forms/training-config-form";
import { deleteTrainingConfig } from "@/lib/actions/admin.actions";
import { DeleteConfigButton } from "./delete-config-button";
import { FullConfiguracionEntrenamiento } from "@/lib/data";

interface TrainingConfigTableProps {
    initialData: FullConfiguracionEntrenamiento[];
}

function formatRequirements(requirements: FullConfiguracionEntrenamiento['requirements']) {
    if (!requirements || requirements.length === 0) return '-';
    return requirements.map(req => `${req.requiredTrainingId} (Nvl ${req.requiredLevel})`).join(', ');
}


export function TrainingConfigTable({ initialData }: TrainingConfigTableProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FullConfiguracionEntrenamiento | null>(null);

    const handleEdit = (item: FullConfiguracionEntrenamiento) => {
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
                <Button onClick={handleCreate}>Crear Nuevo Entrenamiento</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Requisitos</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead className="text-right">Armas</TableHead>
                        <TableHead className="text-right">Munición</TableHead>
                        <TableHead className="text-right">Dólares</TableHead>
                        <TableHead className="text-right">Duración (s)</TableHead>
                         <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialData.map(training => (
                        <TableRow key={training.id}>
                            <TableCell className="font-mono text-xs">{training.id}</TableCell>
                            <TableCell className="font-medium">{training.nombre}</TableCell>
                            <TableCell className="text-xs">{formatRequirements(training.requirements)}</TableCell>
                            <TableCell>{training.puntos}</TableCell>
                            <TableCell className="text-right">{training.costoArmas.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{training.costoMunicion.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{training.costoDolares.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{training.duracion}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(training)}>Editar</Button>
                                <DeleteConfigButton id={training.id} action={deleteTrainingConfig} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Editar' : 'Crear'} Entrenamiento</DialogTitle>
                    </DialogHeader>
                    <TrainingConfigForm 
                        training={selectedItem} 
                        allTrainings={initialData}
                        onFinished={() => setIsOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
