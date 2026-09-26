import { getSessionUser } from "@/lib/auth";
import { calcularProduccionTotalPorSegundo } from "@/lib/formulas/room-formulas";
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

const resourceColors: { [key: string]: string } = {
    armas: "text-[#ee7000]",
    municion: "text-[#fabd00]",
    alcohol: "text-[#ff3f3f]",
    dolares: "text-[#1e6b28]",
};

function formatProduction(num: number): string {
    return `+${Math.floor(num).toLocaleString('de-DE')}`;
}

export async function ResourcesView() {
    const user = await getSessionUser();

    if (!user) {
        return <div className="v-outer-frame p-4 text-center font-mono">Usuario no encontrado</div>;
    }

    const produccionPorSegundo = user.propiedades.reduce((acc: { armas: number; municion: number; alcohol: number; dolares: number }, propiedad: any) => {
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
            key,
            name: resourceNames[key],
            icon: resourceIcons[key],
            color: resourceColors[key],
            porHora,
            porDia,
            porSemana,
        };
    });

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        PRODUCCIÓN TOTAL DE RECURSOS (TODAS LAS PROPIEDADES)
                    </span>
                </div>

                <div className="p-3 bg-[#f1ebda] space-y-3">
                    <p className="text-xs text-[#4a4031]">
                        Métrica de rendimiento operativo generado por hora, día y semana en todas tus instalaciones.
                    </p>

                    <div className="overflow-x-auto border border-[#cbc4b0] rounded-sm">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr>
                                    <th className="crimson-th p-1.5 text-left">Recurso</th>
                                    <th className="crimson-th p-1.5 text-right">Por Hora</th>
                                    <th className="crimson-th p-1.5 text-right">Por Día</th>
                                    <th className="crimson-th p-1.5 text-right">Por Semana</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#cbc4b0]">
                                {productionData.map((res, idx) => {
                                    const isAlt = idx % 2 === 1;
                                    return (
                                        <tr key={res.name} className={`${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'}`}>
                                            <td className="p-2 font-bold flex items-center gap-2 text-[#221c13]">
                                                <Image src={res.icon} alt={res.name} width={18} height={18} />
                                                <span>{res.name}</span>
                                            </td>
                                            <td className={`p-2 text-right font-mono font-bold ${res.color}`}>
                                                {formatProduction(res.porHora)}
                                            </td>
                                            <td className={`p-2 text-right font-mono font-bold ${res.color}`}>
                                                {formatProduction(res.porDia)}
                                            </td>
                                            <td className={`p-2 text-right font-mono font-bold ${res.color}`}>
                                                {formatProduction(res.porSemana)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
