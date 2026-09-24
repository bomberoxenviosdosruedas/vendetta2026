import type { FullFamily } from "@/lib/data";

interface FamilyRankingsViewProps {
    families: FullFamily[];
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function FamilyRankingsView({ families }: FamilyRankingsViewProps) {
    if (!families || families.length === 0) {
        return (
            <div className="v-outer-frame p-6 text-center text-[#695d48] font-mono font-bold text-xs bg-[#f1ebda]">
                No hay familias en la clasificación.
            </div>
        );
    }

    return (
        <section className="v-outer-frame w-full">
            <div className="crimson-th p-2 flex items-center justify-between">
                <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                    CLASIFICACIÓN GLOBAL DE FAMILIAS
                </span>
            </div>

            <div className="overflow-x-auto bg-[#f1ebda]">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr>
                            <th className="crimson-th p-1.5 text-left w-10">#</th>
                            <th className="crimson-th p-1.5 text-left">Nombre</th>
                            <th className="crimson-th p-1.5 text-right">Puntos Totales</th>
                            <th className="crimson-th p-1.5 text-right">Miembros</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cbc4b0]">
                        {families.map((family, index) => {
                            const isAlt = index % 2 === 1;
                            return (
                                <tr key={family.id} className={`${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'}`}>
                                    <td className="p-2 font-mono text-[#554a37] font-bold">{index + 1}</td>
                                    <td className="p-2 font-bold text-[#801e00]">[{family.tag}] {family.name}</td>
                                    <td className="p-2 text-right font-mono font-bold text-[#111]">{formatPoints(0)}</td>
                                    <td className="p-2 text-right font-mono text-[#554a37]">{family.members.length}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
