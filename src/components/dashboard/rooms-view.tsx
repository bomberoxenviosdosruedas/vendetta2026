import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Clock, PlusCircle } from "lucide-react"

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
  const rooms = await getRoomConfigurations()

  // For now we assume all rooms are at level 0
  const userRooms = rooms.map(room => ({
    ...room,
    level: 0,
  }))

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
              {userRooms.map((room) => (
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
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
