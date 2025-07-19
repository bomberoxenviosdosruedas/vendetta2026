
'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullConfiguracionHabitacion, FullConfiguracionTropa, FullConfiguracionEntrenamiento } from "@/lib/data";
import { TechItemCard } from "./tech-item-card";

interface TechnologyTreeViewProps {
    rooms: FullConfiguracionHabitacion[];
    trainings: FullConfiguracionEntrenamiento[];
    troops: FullConfiguracionTropa[];
}

export function TechnologyTreeView({ rooms, trainings, troops }: TechnologyTreeViewProps) {
    const roomMap = new Map(rooms.map(r => [r.id, r.nombre]));
    const trainingMap = new Map(trainings.map(t => [t.id, t.nombre]));
    const troopMap = new Map(troops.map(t => [t.id, t.nombre]));

    return (
        <Tabs defaultValue="rooms" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rooms">Habitaciones</TabsTrigger>
                <TabsTrigger value="trainings">Entrenamientos</TabsTrigger>
                <TabsTrigger value="troops">Tropas</TabsTrigger>
            </TabsList>
            <TabsContent value="rooms">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {rooms.map(room => (
                        <TechItemCard
                            key={room.id}
                            name={room.nombre}
                            description={room.descripcion}
                            imageUrl={room.urlImagen}
                            requirements={room.requirements.map(req => ({
                                id: req.requiredRoomId,
                                name: roomMap.get(req.requiredRoomId) || req.requiredRoomId,
                                level: req.requiredLevel
                            }))}
                        />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="trainings">
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {trainings.map(training => (
                        <TechItemCard
                            key={training.id}
                            name={training.nombre}
                            description={null}
                            imageUrl={training.urlImagen}
                            requirements={training.requirements.map(req => ({
                                id: req.requiredTrainingId,
                                name: trainingMap.get(req.requiredTrainingId) || req.requiredTrainingId,
                                level: req.requiredLevel
                            }))}
                        />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="troops">
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {troops.map(troop => (
                        <TechItemCard
                            key={troop.id}
                            name={troop.nombre}
                            description={troop.descripcion}
                            imageUrl={troop.urlImagen}
                            requirements={troop.requisitos.map(reqId => ({
                                id: reqId,
                                name: troopMap.get(reqId) || reqId,
                            }))}
                        />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
}
