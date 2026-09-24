import type { UserForRanking } from "@/lib/data";
import Link from "next/link";

interface PlayerRankingsViewProps {
    users: UserForRanking[];
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function PlayerRankingsView({ users }: PlayerRankingsViewProps) {
    return (
        <section className="v-outer-frame w-full">
            <div className="crimson-th p-2 flex items-center justify-between">
                <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                    CLASIFICACIÓN GLOBAL DE JUGADORES
                </span>
            </div>

            <div className="overflow-x-auto bg-[#f1ebda]">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr>
                            <th className="crimson-th p-1.5 text-left w-10">#</th>
                            <th className="crimson-th p-1.5 text-left">Jugador</th>
                            <th className="crimson-th p-1.5 text-right">Entrenamiento</th>
                            <th className="crimson-th p-1.5 text-right">Edificios</th>
                            <th className="crimson-th p-1.5 text-right">Tropas</th>
                            <th className="crimson-th p-1.5 text-right">Puntos Totales</th>
                            <th className="crimson-th p-1.5 text-right">Bases</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cbc4b0]">
                        {users.map((user, index) => {
                            const isAlt = index % 2 === 1;
                            const isTop3 = index < 3;
                            return (
                                <tr key={user.id} className={`${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'} ${isTop3 ? (index === 0 ? 'glow-border-gold' : 'glow-border-crimson') : ''} hover:bg-[#efeadd]`}>
                                    <td className="p-2 font-mono text-[#554a37] font-bold">
                                        {index === 0 ? '👑 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                                    </td>
                                    <td className="p-2 font-bold">
                                        <Link href={`/profile/${user.id}`} className="text-[#174872] hover:text-[#8b0000] underline">
                                            {user.name}
                                        </Link>
                                    </td>
                                    <td className="p-2 text-right font-mono text-[#4a4031]">
                                        {formatPoints(user.puntuacion?.puntosEntrenamientos)}
                                    </td>
                                    <td className="p-2 text-right font-mono text-[#4a4031]">
                                        {formatPoints(user.puntuacion?.puntosHabitaciones)}
                                    </td>
                                    <td className="p-2 text-right font-mono text-[#4a4031]">
                                        {formatPoints(user.puntuacion?.puntosTropas)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-[#801e00]">
                                        {formatPoints(user.puntuacion?.puntosTotales)}
                                    </td>
                                    <td className="p-2 text-right font-mono text-[#111]">
                                        {user._count.propiedades}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
