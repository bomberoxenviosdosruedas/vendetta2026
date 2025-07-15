import Image from "next/image"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getRoomConfigurations } from "@/lib/data"
import { Clock, PlusCircle, Target, Boxes, DollarSign } from "lucide-react"
import { getSessionUser } from "@/lib/auth"
import { calcularCostosNivel, calcularTiempoConstruccion } from "@/lib/formulas"
import type { FullHabitacionUsuario } from "@/lib/data"

function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.round(seconds % 60);

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (remainingSeconds > 0 || result === '') result += `${remainingSeconds}s`;
    
    return result.trim();
}

export async function RoomsView() {
  const user = await getSessionUser()

  if (!user) {
    return <div>Usuario no encontrado</div>
  }

  const userRoomsMap = new Map(user.habitaciones.map(h => [h.configuracionHabitacionId, h]));

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
      const nivel = userRoom ? userRoom.nivel : 0;
      const nivelOficinaJefe = userRoomsMap.get('oficina_del_jefe')?.nivel || 1;

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Imagen</TableHead>
                <TableHead className="w-[200px]">Edificio</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[220px]">Costo de Ampliación</TableHead>
                <TableHead className="text-right w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRoomsData.map((room) => (
                <TableRow key={room.id} className="align-top">
                  <TableCell>
                    <div className="w-20 h-14 relative rounded-md overflow-hidden border">
                        <Image
                            src={room.urlImagen || "https://placehold.co/80x56.png"}
                            alt={room.nombre}
                            fill
                            className="object-cover"
                            data-ai-hint="game building"
                        />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{room.nombre}</div>
                    <div className="text-sm text-primary">
                      Nivel {room.nivel}
                    </div>
                  </TableCell>
                  <TableCell>
                     <p className="text-sm text-muted-foreground">{room.descripcion}</p>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold">Al Nivel: {room.nivel + 1}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
                       {room.costos.armas > 0 && <div className="flex items-center gap-1.5"><Target className="h-3 w-3" /><span>{room.costos.armas.toLocaleString()}</span></div>}
                       {room.costos.municion > 0 && <div className="flex items-center gap-1.5"><Boxes className="h-3 w-3" /><span>{room.costos.municion.toLocaleString()}</span></div>}
                       {room.costos.dolares > 0 && <div className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" /><span>{room.costos.dolares.toLocaleString()}</span></div>}
                    </div>
                     <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(room.tiempo)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                       <PlusCircle className="mr-2 h-4 w-4" /> Ampliar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
