
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SearchPage() {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Buscar</h2>
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda Avanzada</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Próximamente: Aquí podrás buscar jugadores, familias y coordenadas.</p>
        </CardContent>
      </Card>
    </div>
  );
}
