
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrainingPage() {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Entrenamiento</h2>
      <Card>
        <CardHeader>
          <CardTitle>Centro de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Próximamente: Aquí podrás entrenar a tus unidades en diferentes especialidades y mejorar sus habilidades.</p>
        </CardContent>
      </Card>
    </div>
  );
}
