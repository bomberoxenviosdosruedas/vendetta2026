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
        <section className="v-outer-frame w-full">
            <div className="crimson-th p-2">
                <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                    ÁRBOL DE TECNOLOGÍAS Y REQUISITOS
                </span>
            </div>

            <Tabs defaultValue="rooms" className="w-full p-2.5">
                <TabsList className="grid w-full grid-cols-3 bg-[#c7c2b0] border border-[#555] p-1 rounded-none mb-3">
                    <TabsTrigger value="rooms" className="retro-btn text-xs font-bold py-1.5 data-[state=active]:bg-[#eee8d5]">
                        Habitaciones
                    </TabsTrigger>
                    <TabsTrigger value="trainings" className="retro-btn text-xs font-bold py-1.5 data-[state=active]:bg-[#eee8d5]">
                        Entrenamientos
                    </TabsTrigger>
                    <TabsTrigger value="troops" className="retro-btn text-xs font-bold py-1.5 data-[state=active]:bg-[#eee8d5]">
                        Tropas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="rooms">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
        </section>
    );
}
