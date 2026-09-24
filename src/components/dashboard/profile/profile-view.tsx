'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileData } from "@/lib/data";
import MaterialIcon from "@/components/ui/material-icon";
import { useRouter } from "next/navigation";

interface ProfileViewProps {
    user: UserProfileData;
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function ProfileView({ user }: ProfileViewProps) {
    const router = useRouter();

    const handleSendMission = (ciudad: number, barrio: number, edificio: number) => {
        const params = new URLSearchParams();
        params.set('ciudad', ciudad.toString());
        params.set('barrio', barrio.toString());
        params.set('edificio', edificio.toString());
        router.push(`/missions?${params.toString()}`);
    }

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        PERFIL // {user.name}
                    </span>
                </div>

                <div className="p-3 bg-[#f1ebda] flex flex-col sm:flex-row items-center gap-4 border-b border-[#cbc4b0]">
                    <div className="avatar-box shrink-0">
                        <Avatar className="h-12 w-12 border border-[#5a4f3d] rounded-sm bg-[#181410] mb-1">
                            <AvatarImage src={user.avatarUrl || ''} alt={user.name} className="object-cover" />
                            <AvatarFallback className="bg-[#181410] text-[#ffe569] font-['Chivo'] font-bold">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <strong className="text-xs text-[#ece6d5] truncate w-full px-1">{user.name}</strong>
                        <span className="text-[9px] text-[#a49a83] mt-0.5">{user.title || 'Capo'}</span>
                    </div>

                    <div className="min-w-0 flex-1 text-center sm:text-left space-y-1">
                        <h2 className="text-base font-bold font-['Chivo'] text-[#801e00] uppercase">{user.name}</h2>
                        <p className="text-xs font-['JetBrains_Mono'] text-[#554a37]">
                            Título: <strong className="text-[#111]">{user.title || 'Capo'}</strong>
                        </p>
                        <p className="text-[11px] font-['JetBrains_Mono'] text-[#695d48]">
                            Miembro desde: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                        </p>
                    </div>
                </div>

                <div className="p-3 bg-[#dfdbc9] grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="v-outer-frame p-3 bg-[#f1ebda] space-y-2">
                        <div className="v-header-c -mx-3 -mt-3 mb-2">Puntuación</div>
                        <div className="space-y-1.5 text-xs font-['JetBrains_Mono']">
                            <div className="flex justify-between py-1 border-b border-[#cbc4b0]">
                                <span className="text-[#554a37] font-bold">PUNTOS TOTALES:</span>
                                <strong className="text-[#801e00]">{formatPoints(user.puntuacion?.puntosTotales)}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#cbc4b0]">
                                <span className="text-[#554a37] font-bold">PUNTOS EDIFICIOS:</span>
                                <span className="text-[#111]">{formatPoints(user.puntuacion?.puntosHabitaciones)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#cbc4b0]">
                                <span className="text-[#554a37] font-bold">PUNTOS TROPAS:</span>
                                <span className="text-[#111]">{formatPoints(user.puntuacion?.puntosTropas)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-[#554a37] font-bold">PUNTOS ENTRENAMIENTO:</span>
                                <span className="text-[#111]">{formatPoints(user.puntuacion?.puntosEntrenamientos)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="v-outer-frame p-3 bg-[#f1ebda]">
                        <div className="v-header-c -mx-3 -mt-3 mb-2">Propiedades ({user.propiedades.length})</div>
                        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                            {user.propiedades.map(prop => (
                                <div key={prop.id} className="p-2 bg-[#e5dfcb] border border-[#cbc4b0] rounded-sm flex justify-between items-center text-xs font-['JetBrains_Mono']">
                                    <div>
                                        <p className="font-bold text-[#801e00]">{prop.nombre}</p>
                                        <span className="text-[#174872] underline font-bold">[{prop.ciudad}:{prop.barrio}:{prop.edificio}]</span>
                                    </div>
                                    <button onClick={() => handleSendMission(prop.ciudad, prop.barrio, prop.edificio)} className="retro-btn px-2 py-1 text-xs font-bold min-h-[44px]">
                                        MISIÓN
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
