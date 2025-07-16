
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityPage() {
  return (
    <div className="main-view">
      <h2 className="text-3xl font-bold tracking-tight">Seguridad</h2>
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Próximamente: Aquí podrás gestionar tus defensas, ver informes de ataques y configurar tu seguridad.</p>
        </CardContent>
      </Card>
    </div>
  );
}
