'use client'

import Image from "next/image"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, BrainCircuit } from "lucide-react"
import { calcularCostosEntrenamiento, calcularTiempoEntrenamiento } from "@/lib/formulas/training-formulas"
import { iniciarEntrenamiento } from "@/lib/actions/training.actions"
import type { ConfiguracionEntrenamiento } from "@prisma/client"
import { useProperty } from "@/contexts/property-context"
import type { UserWithProgress } from "@/lib/data"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

function formatNumber(num: number): string {
    return num.toLocaleString('de-DE');
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

function TrainingForm({ training, user, propertyId }: { training: any, user: UserWithProgress, propertyId: string }) {
    const [isPending, setIsPending] = useState(false);
    const { toast } = useToast();

    const handleAction = async () => {
        setIsPending(true);
        const result = await iniciarEntrenamiento(training.id, propertyId);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result.success) {
            toast({ title: 'Éxito', description: result.success });
        }
        setIsPending(false);
    }
    
    return (
        <form action={handleAction}>
            <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                <BrainCircuit className="mr-2 h-4 w-4" /> {isPending ? 'Entrenando...' : 'Entrenar'}
            </Button>
        </form>
    )
}

interface TrainingViewProps {
    user: UserWithProgress;
    allTrainingConfigs: ConfiguracionEntrenamiento[];
}

export function TrainingView({ user, allTrainingConfigs }: TrainingViewProps) {
  const { selectedProperty } = useProperty();

  if (!selectedProperty) {
      return (
        <div className="main-view">
          <h2 className="text-3xl font-bold tracking-tight">Centro de Entrenamiento</h2>
          <Card><CardContent className="p-6">Selecciona una propiedad para ver los entrenamientos.</CardContent></Card>
        </div>
      )
  }

  const userTrainingsMap = new Map(user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t]));
  const nivelEscuela = selectedProperty.habitaciones.find(h => h.configuracionHabitacionId === 'escuela_especializacion')?.nivel || 0;
  
  const desiredOrder = [
    'rutas', 'encargos', 'extorsion', 'administracion', 'contrabando', 'espionaje', 
    'seguridad', 'proteccion', 'combate', 'armas', 'tiro', 'explosivos', 
    'guerrilla', 'psicologico', 'quimico', 'honor'
  ];

  const sortedTrainingsData = desiredOrder.map(id => {
      const config = allTrainingConfigs.find(c => c.id === id);
      if (!config) return null;

      const userTraining = userTrainingsMap.get(id);
      const nivel = userTraining ? userTraining.nivel : 0;
      
      const costosSiguienteNivel = calcularCostosEntrenamiento(nivel + 1, config);
      const tiempoSiguienteNivel = calcularTiempoEntrenamiento(nivel + 1, config, nivelEscuela);

      return {
          id: config.id,
          nombre: config.nombre,
          urlImagen: config.urlImagen,
          nivel,
          costos: costosSiguienteNivel,
          tiempo: tiempoSiguienteNivel,
      };
  }).filter(Boolean);


  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Centro de Entrenamiento</h2>
                <p className="text-muted-foreground">
                    Mejora tus habilidades desde {selectedProperty.nombre}.
                </p>
            </div>
       </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
              {sortedTrainingsData.map((training) => (
                <div key={training.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Imagen y Nombre */}
                    <div className="md:col-span-3 flex items-start gap-4">
                        <div className="w-20 h-16 relative rounded-md overflow-hidden border flex-shrink-0">
                            <Image
                                src={training.urlImagen || "https://placehold.co/80x56.png"}
                                alt={training.nombre}
                                fill
                                className="object-cover"
                                data-ai-hint="skill icon"
                            />
                        </div>
                        <div>
                            <div className="font-bold">{training.nombre}</div>
                            <div className="text-sm text-primary">
                              Nivel {training.nivel}
                            </div>
                        </div>
                    </div>
                    {/* Descripción (placeholder) */}
                    <div className="md:col-span-4">
                        <p className="text-sm text-muted-foreground">Mejora de {training.nombre.toLowerCase()} para desbloquear nuevas capacidades.</p>
                    </div>
                    {/* Costos y Acciones */}
                    <div className="md:col-span-5">
                       <div className="font-semibold text-sm mb-2">Mejora a Nivel: {training.nivel + 1}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                            <div className="flex flex-col gap-1 text-sm flex-grow">
                                <div className="grid grid-cols-3 gap-x-3">
                                    {training.costos.armas > 0 && <div className="flex items-center gap-1.5" title={`${training.costos.armas.toLocaleString('de-DE')} Armas`}><Image src="/img/recursos/armas.svg" alt="Armas" width={16} height={16} /><span>{formatNumber(training.costos.armas)}</span></div>}
                                    {training.costos.municion > 0 && <div className="flex items-center gap-1.5" title={`${training.costos.municion.toLocaleString('de-DE')} Munición`}><Image src="/img/recursos/municion.svg" alt="Munición" width={16} height={16} /><span>{formatNumber(training.costos.municion)}</span></div>}
                                    {training.costos.dolares > 0 && <div className="flex items-center gap-1.5" title={`${training.costos.dolares.toLocaleString('de-DE')} Dólares`}><Image src="/img/recursos/dolares.svg" alt="Dólares" width={16} height={16} /><span>{formatNumber(training.costos.dolares)}</span></div>}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDuration(training.tiempo)}</span>
                                </div>
                            </div>
                           <TrainingForm training={training} user={user} propertyId={selectedProperty.id} />
                        </div>
                    </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
