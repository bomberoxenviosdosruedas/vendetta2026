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
import { getRoomConfigurations, getUserWithProgressByUsername } from "@/lib/data"
import { Clock, PlusCircle } from "lucide-react"
import { getSessionUser } from "@/lib/auth"

function formatDuration(seconds: number) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}


export async function RoomsView() {
  const [roomConfigs, user] = await Promise.all([
    getRoomConfigurations(),
    getSessionUser()
  ]);

  const desiredOrder = [
    'oficina_del_jefe',
    'escuela_especializacion',
    'armeria',
    'almacen_de_municion',
    'cerveceria',
    'taberna',
    'contrabando',
    'almacen_de_armas',
    'deposito_de_municion',
    'almacen_de_alcohol',
    'caja_fuerte',
    'campo_de_entrenamiento',
    'seguridad',
    'torreta_de_fuego_automatico',
    'minas_ocultas'
  ];

  const sortedRooms = [...roomConfigs].sort((a, b) => {
    const indexA = desiredOrder.indexOf(a.id);
    const indexB = desiredOrder.indexOf(b.id);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const userRoomsMap = new Map(user?.habitaciones.map(h => [h.configuracionHabitacionId, h]));

  const roomsWithLevels = sortedRooms.map(config => {
    const userRoom = userRoomsMap.get(config.id);
    return {
      ...config,
      level: userRoom ? userRoom.nivel : 0,
    }
  });


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
                <TableHead className="w-24">Imagen</TableHead>
                <TableHead>Edificio y Nivel</TableHead>
                <TableHead>Costo de Ampliación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomsWithLevels.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <div className="w-20 h-14 relative rounded-md overflow-hidden">
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
                    <div className="text-sm text-muted-foreground">
                      Nivel: {room.level}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">Al Nivel: {room.level + 1}</div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                       {room.costoArmas > 0 && <span>{room.costoArmas.toLocaleString()} Armas</span>}
                       {room.costoMunicion > 0 && <span>{room.costoMunicion.toLocaleString()} Munición</span>}
                       {room.costoDolares > 0 && <span>${room.costoDolares.toLocaleString()}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(room.duracion)}</span>
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
