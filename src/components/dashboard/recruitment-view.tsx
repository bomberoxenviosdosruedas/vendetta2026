import Image from "next/image"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTroopConfigurations } from "@/lib/data"
import { Clock, PlusCircle, Target, Boxes, DollarSign, Shield, Swords } from "lucide-react"
import { getSessionUser } from "@/lib/auth"

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
          <div className="divide-y divide-border">
              {troopsWithCounts.map((troop) => (
                <div key={troop.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-3 flex items-start gap-4">
                      <div className="w-20 h-16 relative rounded-md overflow-hidden border flex-shrink-0">
                          <Image
                              src={troop.urlImagen || "https://placehold.co/80x56.png"}
                              alt={troop.nombre}
                              fill
                              className="object-contain"
                              data-ai-hint="mafia character unit"
                          />
                      </div>
                      <div>
                          <div className="font-bold">{troop.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                              Posees: <span className="text-primary font-bold">{troop.count}</span>
                          </div>
                      </div>
                  </div>

                  <div className="md:col-span-4">
                      <p className="text-sm text-muted-foreground">{troop.descripcion}</p>
                  </div>
                  
                  <div className="md:col-span-5">
                      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                          <div className="flex flex-col gap-2 text-sm flex-grow">
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div className="flex items-center gap-2" title="Ataque">
                                      <Swords className="h-4 w-4 text-red-500" /> 
                                      <span>{formatNumber(troop.ataque)}</span>
                                  </div>
                                  <div className="flex items-center gap-2" title="Defensa">
                                      <Shield className="h-4 w-4 text-blue-500" />
                                      <span>{formatNumber(troop.defensa)}</span>
                                  </div>
                              </div>
                              <div className="grid grid-cols-3 gap-x-3">
                                  {troop.costoArmas > 0 && <div className="flex items-center gap-1.5" title={`${troop.costoArmas.toLocaleString()} Armas`}><Target className="h-4 w-4" /><span>{formatNumber(troop.costoArmas)}</span></div>}
                                  {troop.costoMunicion > 0 && <div className="flex items-center gap-1.5" title={`${troop.costoMunicion.toLocaleString()} Munición`}><Boxes className="h-4 w-4" /><span>{formatNumber(troop.costoMunicion)}</span></div>}
                                  {troop.costoDolares > 0 && <div className="flex items-center gap-1.5" title={`${troop.costoDolares.toLocaleString()} Dólares`}><DollarSign className="h-4 w-4" /><span>{formatNumber(troop.costoDolares)}</span></div>}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(troop.duracion)}</span>
                              </div>
                          </div>
                          <form>
                              <Button variant="outline" size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" /> Reclutar
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
