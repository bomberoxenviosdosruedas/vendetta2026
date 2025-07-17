
import { getSessionUser, type UserWithProgress } from "@/lib/auth";
import { calcularProduccionTotalPorSegundo } from "@/lib/formulas/room-formulas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

const resourceIcons: { [key: string]: string } = {
    armas: '/img/recursos/armas.svg',
    municion: '/img/recursos/municion.svg',
    alcohol: '/img/recursos/alcohol.svg',
    dolares: '/img/recursos/dolares.svg',
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

    // TODO: This should be based on selected property
    const produccionPorSegundo = user.propiedades.reduce((acc, propiedad) => {
        const prod = calcularProduccionTotalPorSegundo(propiedad);
        acc.armas += prod.armas;
        acc.municion += prod.municion;
        acc.alcohol += prod.alcohol;
        acc.dolares += prod.dolares;
        return acc;
    }, { armas: 0, municion: 0, alcohol: 0, dolares: 0 });

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
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Image src={res.icon} alt={res.name} width={20} height={20} />
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
