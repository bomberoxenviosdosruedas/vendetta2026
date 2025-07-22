
'use client'

import Image from "next/image"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, PlusCircle, Ban, Info, Hourglass, Loader2 } from "lucide-react"
import { iniciarAmpliacion } from "@/lib/actions/room.actions"
import { ConstructionQueue } from "./construction-queue"
import { FullConfiguracionHabitacion, UserWithProgress } from "@/lib/data"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { RoomDetailsModal } from "./room-details-modal"
import { useProperty } from "@/contexts/property-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { calcularCostosNivel, calcularTiempoConstruccion } from "@/lib/formulas/room-formulas"

function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  const suffixes = ["", "K", "M", "B", "T"];
  const i = Math.floor(Math.log10(num) / 3);
  const shortValue = (num / Math.pow(1000, i));
  return shortValue.toFixed(i > 0 ? 2 : 0) + suffixes[i];
}


function formatDuration(seconds: number): string {
    if (seconds <= 0) return "0s";

    const units: {name: string, seconds: number}[] = [
        { name: 'año', seconds: 31536000 },
        { name: 'sem', seconds: 604800 },
        { name: 'd', seconds: 86400 },
        { name: 'h', seconds: 3600 },
        { name: 'm', seconds: 60 },
        { name: 's', seconds: 1 }
    ];

    let remainingSeconds = seconds;
    let result = '';
    let parts = 0;

    for (const unit of units) {
        if (remainingSeconds >= unit.seconds && parts < 3) {
            const amount = Math.floor(remainingSeconds / unit.seconds);
            if (amount > 0) {
                result += `${amount}${unit.name} `;
                remainingSeconds %= unit.seconds;
                parts++;
            }
        }
    }

    return result.trim() || '0s';
}

type RoomsViewProps = {
    user: UserWithProgress;
    allRoomConfigs: FullConfiguracionHabitacion[];
}

export function RoomsView({ user, allRoomConfigs }: RoomsViewProps) {
    const router = useRouter();
    const { selectedProperty } = useProperty();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const { toast } = useToast();

    if (!selectedProperty) {
      return (
        <div className="main-view">
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Habitaciones</h2>
          <Card>
            <CardContent className="p-6">
                <p>Por favor, selecciona una propiedad para gestionar sus habitaciones.</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    const construccionEnCola = selectedProperty.colaConstruccion;

    const userRoomsMap = new Map(selectedProperty.habitaciones.map(h => [h.configuracionHabitacionId, h]));
      
    const desiredOrder = [
        'oficina_del_jefe', 'escuela_especializacion', 'armeria', 'almacen_de_municion',
        'cerveceria', 'taberna', 'contrabando', 'almacen_de_armas', 'deposito_de_municion',
        'almacen_de_alcohol', 'caja_fuerte', 'campo_de_entrenamiento', 'seguridad',
        'torreta_de_fuego_automatico', 'minas_ocultas'
    ];
      
    const roomsData = desiredOrder.map(id => {
        const config = allRoomConfigs.find(c => c.id === id);
        if (!config) return null;

        const userRoom = userRoomsMap.get(id);
        const nivelBase = userRoom ? userRoom.nivel : 0;
        
        const mejorasEnCola = selectedProperty.colaConstruccion.filter(c => c.habitacionId === id).length;
        const nivelProyectado = nivelBase + mejorasEnCola;
        const nivelSiguiente = nivelProyectado + 1;

        const nivelOficinaJefe = userRoomsMap.get('oficina_del_jefe')?.nivel || 1;
        
        const enConstruccion = selectedProperty.colaConstruccion.some(c => c.habitacionId === id);

        const costosSiguienteNivel = calcularCostosNivel(nivelSiguiente, config);
        const tiempoSiguienteNivel = calcularTiempoConstruccion(nivelSiguiente, config, nivelOficinaJefe);
        
        const requirements = config.requirements || [];
        const meetsRequirements = requirements.every(req => (userRoomsMap.get(req.requiredRoomId)?.nivel || 0) >= req.requiredLevel);
        const requirementsText = !meetsRequirements
            ? requirements.map(req => `${allRoomConfigs.find(r=>r.id === req.requiredRoomId)?.nombre || req.requiredRoomId} (Nvl ${req.requiredLevel})`).join(', ')
            : null;

        return {
            ...config,
            nivel: nivelBase,
            nivelProyectado,
            nivelSiguiente,
            costos: costosSiguienteNivel,
            tiempo: tiempoSiguienteNivel,
            enConstruccion,
            meetsRequirements,
            requirementsText,
        };
    }).filter((r): r is NonNullable<typeof r> => r !== null);


    useEffect(() => {
        if (!construccionEnCola || construccionEnCola.length === 0) return;
        
        const construccionActiva = construccionEnCola.find(c => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());
        if (!construccionActiva?.fechaFinalizacion) return;

        const fin = new Date(construccionActiva.fechaFinalizacion).getTime();
        const interval = setInterval(() => {
            const ahora = new Date().getTime();
            if (ahora >= fin) {
                router.refresh();
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [construccionEnCola, router]);

    const isQueueFull = construccionEnCola.length >= 5;

    const handleAmpliacion = async (habitacionId: string) => {
        if (!selectedProperty) return;
        setIsSubmitting(habitacionId);
        const resultado = await iniciarAmpliacion(selectedProperty.id, habitacionId);
        if (resultado?.error) {
            toast({
                title: "Error al ampliar",
                description: resultado.error,
                variant: "destructive"
            })
        } else if (resultado?.success) {
            toast({
                title: "¡Éxito!",
                description: resultado.success
            })
        }
        setIsSubmitting(null);
    }

    const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre }));

    return (
        <div className="space-y-4">
            <ConstructionQueue propiedad={selectedProperty} allRooms={simpleRoomConfigs} />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Habitaciones</h2>
                    <p className="text-muted-foreground">
                        Amplía y gestiona los edificios de tu propiedad: {selectedProperty.nombre}.
                    </p>
                </div>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {roomsData.map((room) => {
                            const button = (
                                <Button type="submit" variant="outline" size="sm" disabled={isQueueFull || isSubmitting === room.id || !room.meetsRequirements}>
                                    {isSubmitting === room.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (isQueueFull ? <Ban className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                                    {isSubmitting === room.id ? 'Enviando...' : (isQueueFull ? 'Cola llena' : 'Ampliar')}
                                </Button>
                            );

                            return (
                                <Dialog key={room.id}>
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                        <div className="md:col-span-3 flex items-start gap-4">
                                            <div className="w-20 h-16 relative rounded-md overflow-hidden border flex-shrink-0">
                                                <Image
                                                    src={room.urlImagen || "https://placehold.co/80x56.png"}
                                                    alt={room.nombre}
                                                    fill
                                                    className="object-cover"
                                                    data-ai-hint="game building"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold font-heading tracking-wide">{room.nombre}</div>
                                                <div className="text-sm text-primary">
                                                    Nivel {room.nivelProyectado}
                                                </div>
                                                {room.enConstruccion && <div className="text-xs text-amber-500 flex items-center gap-1"><Hourglass className="h-3 w-3" /> En cola</div>}
                                                {!room.meetsRequirements && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="h-4 w-4 text-destructive mt-1"/>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="text-xs">{room.requirementsText}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-4">
                                            <p className="text-sm text-muted-foreground">{room.descripcion}</p>
                                        </div>
                                        <div className="md:col-span-5">
                                            <div className="font-semibold text-sm mb-2 font-heading">Ampliación a Nivel: {room.nivelSiguiente}</div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                                                <div className="flex flex-col gap-1 text-sm flex-grow">
                                                    <div className="grid grid-cols-3 gap-x-3">
                                                        {room.costos.armas > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.armas.toString()} Armas`}><Image src="/img/recursos/armas.svg" alt="Armas" width={16} height={16} /><span>{formatNumber(room.costos.armas)}</span></div>}
                                                        {room.costos.municion > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.municion.toString()} Munición`}><Image src="/img/recursos/municion.svg" alt="Munición" width={16} height={16} /><span>{formatNumber(room.costos.municion)}</span></div>}
                                                        {room.costos.dolares > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.dolares.toString()} Dólares`}><Image src="/img/recursos/dolares.svg" alt="Dólares" width={16} height={16} /><span>{formatNumber(room.costos.dolares)}</span></div>}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{formatDuration(room.tiempo)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9">
                                                            <Info className="h-5 w-5" />
                                                            <span className="sr-only">Detalles</span>
                                                        </Button>
                                                    </DialogTrigger>
                                                    <form action={() => handleAmpliacion(room.id)}>
                                                        {room.meetsRequirements ? (
                                                            button
                                                        ) : (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span>{button}</span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p className="text-xs">Requisitos no cumplidos:</p>
                                                                        <p className="text-xs font-semibold">{room.requirementsText}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <RoomDetailsModal room={{...room, nivel: room.nivelProyectado}} />
                                </Dialog>
                            )})}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
