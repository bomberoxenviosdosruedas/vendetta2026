
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BuildingsPage() {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Edificios</h2>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Edificios</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Próximamente: Aquí podrás ver una lista de todos tus edificios y su estado.</p>
        </CardContent>
      </Card>
    </div>
  );
}
