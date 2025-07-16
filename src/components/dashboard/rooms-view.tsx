import Image from "next/image"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getRoomConfigurations } from "@/lib/data"
import { Clock, PlusCircle, Target, Boxes, DollarSign, Ban } from "lucide-react"
import { getSessionUser } from "@/lib/auth"
import { calcularCostosNivel, calcularTiempoConstruccion } from "@/lib/formulas/room-formulas"
import { iniciarAmpliacion } from "@/lib/actions/room.actions"
import { revalidatePath } from "next/cache"

function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  const suffixes = ["", "K", "M", "B", "T"];
  const i = Math.floor(Math.log10(num) / 3);
  const shortValue = (num / Math.pow(1000, i));
  return shortValue.toFixed(i > 0 ? 2 : 0) + suffixes[i];
}


function formatDuration(seconds: number) {
    if (seconds <= 0) return "0s";

    const units = [
        { name: 'a', seconds: 31536000 },
        { name: 'mes', seconds: 2592000 },
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
            result += `${amount}${unit.name} `;
            remainingSeconds %= unit.seconds;
            parts++;
        }
    }

    return result.trim() || '0s';
}


async function handleAmpliacion(habitacionId: string) {
  'use server'
  const resultado = await iniciarAmpliacion(habitacionId);
  if (resultado?.error) {
    // Idealmente, mostrar un toast de error aquí
    console.error(resultado.error);
  } else {
    revalidatePath('/rooms');
    revalidatePath('/(dashboard)/layout', 'layout');
  }
  return resultado;
}


export async function RoomsView() {
  const user = await getSessionUser()

  if (!user || !user.propiedades || user.propiedades.length === 0) {
    return <div>Usuario o propiedad no encontrado</div>
  }

  // Por ahora trabajamos con la primera propiedad
  const propiedadActual = user.propiedades[0];
  const userRoomsMap = new Map(propiedadActual.habitaciones.map(h => [h.configuracionHabitacionId, h]));
  const construccionActiva = user.colaConstruccion;

  const allRoomConfigs = await getRoomConfigurations();

  const desiredOrder = [
    'oficina_del_jefe', 'escuela_especializacion', 'armeria', 'almacen_de_municion',
    'cerveceria', 'taberna', 'contrabando', 'almacen_de_armas', 'deposito_de_municion',
    'almacen_de_alcohol', 'caja_fuerte', 'campo_de_entrenamiento', 'seguridad',
    'torreta_de_fuego_automatico', 'minas_ocultas'
  ];

  const sortedRoomsData = desiredOrder.map(id => {
      const config = allRoomConfigs.find(c => c.id === id);
      if (!config) return null;

      const userRoom = userRoomsMap.get(id);
      let nivel = userRoom ? userRoom.nivel : 0;
      const nivelOficinaJefe = userRoomsMap.get('oficina_del_jefe')?.nivel || 1;
      
      let enConstruccion = false;
      if (construccionActiva && construccionActiva.habitacionId === id) {
        enConstruccion = true;
      }

      const costosSiguienteNivel = calcularCostosNivel(nivel + 1, config);
      const tiempoSiguienteNivel = calcularTiempoConstruccion(nivel + 1, config, nivelOficinaJefe);
      
      return {
          id: config.id,
          nombre: config.nombre,
          descripcion: config.descripcion,
          urlImagen: config.urlImagen,
          nivel,
          costos: costosSiguienteNivel,
          tiempo: tiempoSiguienteNivel,
          enConstruccion,
      };
  }).filter(Boolean);


  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Habitaciones</h2>
                <p className="text-muted-foreground">
                    Amplía y gestiona los edificios de tu propiedad.
                </p>
            </div>
       </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
              {sortedRoomsData.map((room) => (
                <div key={room.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Imagen y Nombre */}
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
                            <div className="font-bold">{room.nombre}</div>
                            <div className="text-sm text-primary">
                             Nivel {room.nivel} {room.enConstruccion ? '(Mejorando...)' : ''}
                            </div>
                        </div>
                    </div>
                    {/* Descripción */}
                    <div className="md:col-span-4">
                        <p className="text-sm text-muted-foreground">{room.descripcion}</p>
                    </div>
                    {/* Costos y Acciones */}
                    <div className="md:col-span-5">
                       <div className="font-semibold text-sm mb-2">Ampliación a Nivel: {room.nivel + 1}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                            <div className="flex flex-col gap-1 text-sm flex-grow">
                                <div className="grid grid-cols-3 gap-x-3">
                                    {room.costos.armas > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.armas.toLocaleString()} Armas`}><Target className="h-4 w-4" /><span>{formatNumber(room.costos.armas)}</span></div>}
                                    {room.costos.municion > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.municion.toLocaleString()} Munición`}><Boxes className="h-4 w-4" /><span>{formatNumber(room.costos.municion)}</span></div>}
                                    {room.costos.dolares > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.dolares.toLocaleString()} Dólares`}><DollarSign className="h-4 w-4" /><span>{formatNumber(room.costos.dolares)}</span></div>}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDuration(room.tiempo)}</span>
                                </div>
                            </div>
                             <form action={handleAmpliacion.bind(null, room.id)}>
                                <Button type="submit" variant="outline" size="sm" disabled={!!construccionActiva}>
                                    {construccionActiva ? <Ban className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    {construccionActiva ? 'En cola...' : 'Ampliar'}
                                </Button>
                            </form>
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
