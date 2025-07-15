
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
import { getTroopConfigurations } from "@/lib/data"
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

export async function RecruitmentView() {
  const [troopConfigs, user] = await Promise.all([
    getTroopConfigurations(),
    getSessionUser()
  ]);

  const desiredOrder = [
    'maton', 'portero', 'acuchillador', 'pistolero', 'ocupacion',
    'espia', 'porteador', 'cia', 'fbi', 'transportista',
    'francotirador', 'asesino', 'ninja', 'mercenario'
  ];

  const sortedTroops = [...troopConfigs].sort((a, b) => {
    const indexA = desiredOrder.indexOf(a.id);
    const indexB = desiredOrder.indexOf(b.id);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const userTroopsMap = new Map(user?.tropas.map(t => [t.configuracionTropaId, t]));

  const troopsWithCounts = sortedTroops.map(config => {
    const userTropa = userTroopsMap.get(config.id);
    return {
      ...config,
      count: userTropa ? userTropa.cantidad : 0,
    }
  });

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reclutamiento de Tropas</h2>
                <p className="text-muted-foreground">
                    Entrena a tus unidades para expandir tu imperio.
                </p>
            </div>
       </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Tropa</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Costos y Estadísticas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {troopsWithCounts.map((troop) => (
                <TableRow key={troop.id}>
                  <TableCell>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-20 h-14 relative rounded-md overflow-hidden border">
                            <Image
                                src={troop.urlImagen || "https://placehold.co/80x56.png"}
                                alt={troop.nombre}
                                fill
                                className="object-contain"
                                data-ai-hint="mafia character unit"
                            />
                        </div>
                        <div className="font-medium text-center">{troop.nombre}</div>
                        <div className="text-xs text-muted-foreground text-center">
                            Posees: {troop.count}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                     <p className="text-sm text-muted-foreground max-w-xs">{troop.descripcion}</p>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm font-semibold">Costos de Reclutamiento</div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                       {troop.costoArmas > 0 && <span>{troop.costoArmas.toLocaleString()} Armas</span>}
                       {troop.costoMunicion > 0 && <span>{troop.costoMunicion.toLocaleString()} Munición</span>}
                       {troop.costoDolares > 0 && <span>{troop.costoDolares.toLocaleString()} Dólares</span>}
                    </div>
                     <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(troop.duracion)}</span>
                    </div>

                    <div className="text-sm font-semibold mt-2">Estadísticas</div>
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Ataque: {troop.ataque}</span>
                        <span>Defensa: {troop.defensa}</span>
                        <span>Velocidad: {troop.velocidad}</span>
                     </div>

                  </TableCell>
                  <TableCell className="text-right align-top">
                    <Button variant="outline" size="sm">
                       <PlusCircle className="mr-2 h-4 w-4" /> Reclutar
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
