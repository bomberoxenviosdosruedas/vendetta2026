
import { getSessionUser, type UserWithProgress } from "@/lib/auth";
import { calcularProduccionTotalPorSegundo } from "@/lib/formulas-produccion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Boxes, DollarSign, Droplets, Target } from 'lucide-react';

const resourceIcons: { [key: string]: React.ReactNode } = {
    armas: <Target className="h-5 w-5 mr-2" />,
    municion: <Boxes className="h-5 w-5 mr-2" />,
    alcohol: <Droplets className="h-5 w-5 mr-2" />,
    dolares: <DollarSign className="h-5 w-5 mr-2" />,
};

const resourceNames: { [key: string]: string } = {
    armas: "Armas",
    municion: "Munición",
    alcohol: "Alcohol",
    dolares: "Dólares",
};

function formatProduction(num: number): string {
    return `+${Math.floor(num).toLocaleString('de-DE')}`;
}

export async function ResourcesView() {
    const user = await getSessionUser();

    if (!user) {
        return <div>Usuario no encontrado</div>
    }

    const produccionPorSegundo = calcularProduccionTotalPorSegundo(user);

    const productionData = Object.keys(produccionPorSegundo).map(key => {
        const porHora = produccionPorSegundo[key as keyof typeof produccionPorSegundo] * 3600;
        const porDia = porHora * 24;
        const porSemana = porDia * 7;
        return {
            name: resourceNames[key],
            icon: resourceIcons[key],
            porHora,
            porDia,
            porSemana,
        }
    });

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Producción de Recursos</CardTitle>
                    <CardDescription>
                        Esta es la producción total de tus edificios por hora, día y semana.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Recurso</TableHead>
                                <TableHead className="text-right">Por Hora</TableHead>
                                <TableHead className="text-right">Por Día</TableHead>
                                <TableHead className="text-right">Por Semana</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productionData.map(res => (
                                <TableRow key={res.name}>
                                    <TableCell className="font-medium flex items-center">
                                        {res.icon}
                                        {res.name}
                                    </TableCell>
                                    <TableCell className="text-right text-green-400 font-mono">{formatProduction(res.porHora)}</TableCell>
                                    <TableCell className="text-right text-green-400 font-mono">{formatProduction(res.porDia)}</TableCell>
                                    <TableCell className="text-right text-green-400 font-mono">{formatProduction(res.porSemana)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
