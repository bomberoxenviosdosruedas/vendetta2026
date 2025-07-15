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
import { Clock, PlusCircle, Target, Boxes, DollarSign, Shield, Swords } from "lucide-react"
import { getSessionUser } from "@/lib/auth"

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
                <TableHead className="w-[100px]">Tropa</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[200px]">Estadísticas</TableHead>
                <TableHead className="w-[220px]">Costo</TableHead>
                <TableHead className="text-right w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {troopsWithCounts.map((troop) => (
                <TableRow key={troop.id} className="align-top">
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-20 h-14 relative rounded-md overflow-hidden border">
                            <Image
                                src={troop.urlImagen || "https://placehold.co/80x56.png"}
                                alt={troop.nombre}
                                fill
                                className="object-contain"
                                data-ai-hint="mafia character unit"
                            />
                        </div>
                        <div className="font-medium text-center text-sm">{troop.nombre}</div>
                        <div className="text-xs text-muted-foreground text-center">
                            Posees: <span className="text-primary font-bold">{troop.count}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <p className="text-sm text-muted-foreground">{troop.descripcion}</p>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                            <Swords className="h-4 w-4 text-red-500" /> 
                            <span>Ataque: {troop.ataque}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span>Defensa: {troop.defensa}</span>
                         </div>
                     </div>
                  </TableCell>
                  <TableCell>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                       {troop.costoArmas > 0 && <div className="flex items-center gap-1"><Target className="h-3 w-3" /><span>{troop.costoArmas.toLocaleString()}</span></div>}
                       {troop.costoMunicion > 0 && <div className="flex items-center gap-1"><Boxes className="h-3 w-3" /><span>{troop.costoMunicion.toLocaleString()}</span></div>}
                       {troop.costoDolares > 0 && <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" /><span>{troop.costoDolares.toLocaleString()}</span></div>}
                    </div>
                     <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(troop.duracion)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
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
