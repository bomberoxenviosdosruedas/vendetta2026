import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, Droplets, Target, Boxes } from "lucide-react"
import { getSessionUser } from "@/lib/auth"

function formatPercentage(current: number, previous: number) {
    if (previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    const percentageChange = ((current - previous) / previous) * 100;
    return `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;
}

export async function DashboardHeader() {
  const user = await getSessionUser();

  if (!user) {
    // This can be a loading state or a fallback UI
    return (
        <header className="w-full">
            <div className="p-4 md:p-6">
                <p>Cargando datos del usuario...</p>
            </div>
        </header>
    );
  }

  const incomePercentage = formatPercentage(user.ingresos, user.ingresosAnterior);

  return (
    <header className="w-full">
      <div className="p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ARMAS</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.armas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Listas para usar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MUNICIÓN</CardTitle>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{user.municion.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Cajas disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ALCOHOL</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.alcohol.toLocaleString()} L</div>
              <p className="text-xs text-muted-foreground">En stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">INGRESOS</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user.ingresos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">{incomePercentage} desde el mes pasado</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </header>
  )
}

    