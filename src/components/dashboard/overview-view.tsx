import { getSessionUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MaterialIcon from "@/components/ui/material-icon";
import { QueueStatusCard } from "./queue-status-card";
import { BaseTroopsSection } from "./base-troops-section";
import { getRoomConfigurations } from "@/lib/data";
import { ErrorBoundary, DashboardSectionErrorFallback } from "./error-boundary";
import Link from "next/link";

function formatPoints(points: number | null | undefined): string {
  if (points === null || points === undefined) return "0";
  return Math.floor(points).toLocaleString('de-DE');
}

export async function OverviewView() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="p-8 text-center text-[#a0a0a0] font-mono">
        Usuario no encontrado o sesión expirada.
      </div>
    );
  }

  const { puntuacion, familyMember } = user;
  const allRoomConfigs = await getRoomConfigurations();
  const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre }));
  const unreadMessages = user._count?.receivedMessages || 0;

  const puntosTotales =
    (puntuacion?.puntosHabitaciones || 0) +
    (puntuacion?.puntosTropas || 0) +
    (puntuacion?.puntosEntrenamientos || 0);

  const mainProperty = user.propiedades[0];
  const roomsBuilt = user.propiedades.reduce((sum, p) => sum + p.habitaciones.length, 0);
  const roomsTotal = user.propiedades.length * 5;
  const mainCoords = mainProperty
    ? `${mainProperty.ciudad}:${mainProperty.barrio}:${mainProperty.edificio}`
    : "-:-:-";

  const familyName = familyMember ? familyMember.family.name : "SIN FAMILIA";
  const familySub = familyMember
    ? `[${familyMember.family.tag}] · ${familyMember.role}`
    : "ÚNETE A UNA FAMILIA";

  return (
    <div className="w-full space-y-2.5">
      {/* 1. VISIÓN GENERAL DEL IMPERIO */}
      <section className="v-outer-frame">
        <div className="v-header-c flex items-center justify-between px-2.5 py-2">
          <span className="font-bold text-[11px] tracking-wide">VISIÓN GENERAL DEL IMPERIO</span>
          <Link href="/map" className="text-[#ffe569] text-[10px] underline hover:text-white flex items-center gap-1">
            <MaterialIcon name="visibility" size={12} />
            [Todo el Imperio]
          </Link>
        </div>

        {/* Desktop: avatar-box + columna de accesos */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_86px] divide-x divide-[#c4bdab] border-b border-[#a89e87] bg-[#f1ebda]">
          {/* Jugador */}
          <div className="p-2">
            <div className="text-[9px] text-[#695d48] font-bold uppercase text-center mb-1">Jugador</div>
            <div className="avatar-box">
              <Avatar className="w-10 h-10 rounded-sm border border-[#5e5138] bg-[#181410] mb-1">
                <AvatarImage src={user.avatarUrl || ''} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-[#181410] text-[#ffe569] font-['Chivo'] font-bold rounded-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <strong className="text-xs text-[#ece6d5] truncate w-full px-1">{user.name}</strong>
              <span className="text-[9px] text-[#a49a83] mt-0.5 truncate w-full px-1">
                {user.title || "Capo"}
              </span>
            </div>
          </div>

          {/* Base */}
          <div className="p-2">
            <div className="text-[9px] text-[#695d48] font-bold uppercase text-center mb-1">Base Actual</div>
            <div className="avatar-box">
              <MaterialIcon name="home" size={26} className="text-[#e2cca2] mb-1" />
              <strong className="text-xs text-[#ece6d5] truncate w-full px-1">
                {mainProperty?.nombre || "SIN PROPIEDAD"}
              </strong>
              <span className="text-[9px] text-[#a49a83] mt-0.5 font-['JetBrains_Mono']">{mainCoords}</span>
            </div>
          </div>

          {/* Familia */}
          <div className="p-2">
            <div className="text-[9px] text-[#695d48] font-bold uppercase text-center mb-1">Familia</div>
            <div className="avatar-box">
              <MaterialIcon name="shield" size={26} className="text-[#e2cca2] mb-1" />
              <strong className="text-xs text-[#ece6d5] truncate w-full px-1">{familyName}</strong>
              <span className="text-[9px] text-[#a49a83] mt-0.5 truncate w-full px-1">{familySub}</span>
            </div>
          </div>

          {/* Columna de botones de mensajes */}
          <div className="p-1.5 bg-[#1a1712] flex flex-col justify-center gap-1">
            <Link href="/messages" className="msg-btn" title="Mensajes sin leer">
              <MaterialIcon name="mail" size={13} />
              <b>{unreadMessages}</b>
            </Link>
            <Link href="/messages?categoria=INFORMES" className="msg-btn" title="Informes de espionaje">
              <MaterialIcon name="description" size={13} />
              <b>LOG</b>
            </Link>
            <Link href="/missions" className="msg-btn" title="Movimientos">
              <MaterialIcon name="sync_alt" size={13} />
              <b>{user.misiones.length}</b>
            </Link>
            <Link href="/simulator" className="msg-btn" title="Combates">
              <MaterialIcon name="swords" size={13} />
              <b>SIM</b>
            </Link>
          </div>
        </div>

        {/* Mobile: bloque 3 columnas compacto + accesos rápidos */}
        <div className="md:hidden">
          <div className="grid grid-cols-3 divide-x divide-[#c4bdab] border-b border-[#a89e87] bg-[#f1ebda]">
            <div className="p-2 text-center flex flex-col items-center justify-between">
              <div className="text-[10px] font-bold text-[#72644e] uppercase mb-0.5">Jugador</div>
              <div className="w-10 h-10 rounded border border-[#695d47] bg-[#ded8c4] flex items-center justify-center shadow-inner my-1 overflow-hidden">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={user.avatarUrl || ''} alt={user.name} className="object-cover" />
                  <AvatarFallback className="bg-[#ded8c4] text-[#801e00] font-['Chivo'] font-bold text-sm rounded-none">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-[12px] font-bold text-[#801e00] leading-tight truncate w-full">{user.name}</div>
              <span className="text-[9px] text-[#4b4334] font-semibold">{user.title || "Capo"}</span>
            </div>
            <div className="p-2 text-center flex flex-col items-center justify-between">
              <div className="text-[10px] font-bold text-[#72644e] uppercase mb-0.5">Base Actual</div>
              <div className="w-10 h-10 rounded border border-[#695d47] bg-[#ded8c4] flex items-center justify-center shadow-inner my-1">
                <MaterialIcon name="home" size={20} className="text-[#4b4334]" />
              </div>
              <div className="text-[12px] font-bold text-[#1e1911] leading-tight truncate w-full">
                {mainProperty?.nombre || "SIN PROPIEDAD"}
              </div>
              <span className="text-[10px] text-[#912d00] font-['JetBrains_Mono'] font-bold">{mainCoords}</span>
            </div>
            <div className="p-2 text-center flex flex-col items-center justify-between">
              <div className="text-[10px] font-bold text-[#72644e] uppercase mb-0.5">Familia</div>
              <div className="w-10 h-10 rounded border border-[#695d47] bg-[#ded8c4] flex items-center justify-center shadow-inner my-1">
                <MaterialIcon name="shield" size={20} className="text-[#4b4334]" />
              </div>
              <div className="text-[11px] font-bold text-[#144766] leading-tight truncate w-full">{familyName}</div>
              <span className="text-[9px] bg-[#d5cfbe] border border-[#a29881] text-[#701e00] font-bold px-1 rounded mt-0.5">
                {familyMember ? familyMember.family.tag : "SIN TAG"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 p-1.5 bg-[#dfdbc9]">
            <Link href="/messages" className="quick-action-badge py-1.5 px-1 rounded flex flex-col items-center justify-center text-center shadow-sm">
              <MaterialIcon name="mail" size={14} className="text-[#e0d6c1]" />
              <div className="text-[9px] text-[#e0d6c1] font-bold">Mensajes</div>
              <span className="text-[10px] font-bold text-[#ffe569] font-mono">{unreadMessages}</span>
            </Link>
            <Link href="/messages?categoria=INFORMES" className="quick-action-badge py-1.5 px-1 rounded flex flex-col items-center justify-center text-center shadow-sm">
              <MaterialIcon name="description" size={14} className="text-[#e0d6c1]" />
              <div className="text-[9px] text-[#e0d6c1] font-bold">Informes</div>
              <span className="text-[10px] font-bold text-[#ffb68c] font-mono">LOG</span>
            </Link>
            <Link href="/missions" className="quick-action-badge py-1.5 px-1 rounded flex flex-col items-center justify-center text-center shadow-sm">
              <MaterialIcon name="sync_alt" size={14} className="text-[#e0d6c1]" />
              <div className="text-[9px] text-[#e0d6c1] font-bold">Misiones</div>
              <span className="text-[10px] font-bold text-[#44dd55] font-mono">{user.misiones.length}</span>
            </Link>
            <Link href="/simulator" className="quick-action-badge py-1.5 px-1 rounded flex flex-col items-center justify-center text-center shadow-sm">
              <MaterialIcon name="swords" size={14} className="text-[#e0d6c1]" />
              <div className="text-[9px] text-[#e0d6c1] font-bold">Combates</div>
              <span className="text-[10px] font-bold text-[#ff5959] font-mono">SIM</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2-4. MISIONES / CONSTRUCCIÓN / RECLUTAMIENTO / ENTRENAMIENTO */}
      <ErrorBoundary fallback={<DashboardSectionErrorFallback title="Colas Operativas" />}>
        <QueueStatusCard user={user} allRooms={simpleRoomConfigs} />
      </ErrorBoundary>

      {/* 5. TROPAS DISPONIBLES EN LA BASE */}
      <ErrorBoundary fallback={<DashboardSectionErrorFallback title="Tropas Disponibles" />}>
        <BaseTroopsSection />
      </ErrorBoundary>

      {/* 6. PUNTOS DEL JUGADOR */}
      <section className="v-outer-frame">
        <div className="v-header-c flex items-center justify-between px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <MaterialIcon name="leaderboard" size={13} className="text-[#e2ca92]" />
            <span className="font-bold text-[11px] tracking-wide">PUNTOS DEL JUGADOR</span>
          </div>
          <span className="text-[10px] text-[#e0cfab]">Clasificación Global</span>
        </div>

        {/* Desktop: tabla clásica 6 columnas */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[10px] font-bold uppercase px-2 py-1">
                  Puntos (Entrenamiento)
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[10px] font-bold uppercase px-2 py-1">
                  Puntos (Edificios)
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[10px] font-bold uppercase px-2 py-1">
                  Puntos (Tropas)
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[10px] font-bold uppercase px-2 py-1">
                  Total
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[10px] font-bold uppercase px-2 py-1">
                  Edificios
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[10px] font-bold uppercase px-2 py-1">
                  Lealtad
                </th>
              </tr>
              <tr>
                <td className="bg-[#f1ebda] border border-black font-['JetBrains_Mono'] text-[11px] text-center py-1.5">
                  {formatPoints(puntuacion?.puntosEntrenamientos)}
                </td>
                <td className="bg-[#e9e3d2] border border-black font-['JetBrains_Mono'] text-[11px] text-center py-1.5">
                  {formatPoints(puntuacion?.puntosHabitaciones)}
                </td>
                <td className="bg-[#f1ebda] border border-black font-['JetBrains_Mono'] text-[11px] text-center py-1.5">
                  {formatPoints(puntuacion?.puntosTropas)}
                </td>
                <td className="bg-[#ffe569] border border-black font-['JetBrains_Mono'] text-[11px] text-center py-1.5 font-bold text-stone-900">
                  {formatPoints(puntosTotales)}
                </td>
                <td className="bg-[#e9e3d2] border border-black font-['JetBrains_Mono'] text-[11px] text-center py-1.5">
                  {roomsBuilt} / {roomsTotal}
                </td>
                <td className="bg-[#f1ebda] border border-black font-['JetBrains_Mono'] text-[11px] text-center py-1.5">
                  [--]
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile: tarjetas 3 columnas + pie de familia */}
        <div className="md:hidden">
          <div className="grid grid-cols-3 divide-x divide-[#c4bdab] bg-[#f1ebda] text-center border-b border-[#a89e87]">
            <div className="p-2">
              <div className="text-[9px] text-[#695d48] font-bold uppercase mb-0.5">Total Puntos</div>
              <div className="text-[12px] font-mono font-bold text-[#14120f] bg-[#ffe569] border border-[#d2bc4a] py-0.5 px-1 rounded shadow-sm">
                {formatPoints(puntosTotales)}
              </div>
            </div>
            <div className="p-2">
              <div className="text-[9px] text-[#695d48] font-bold uppercase mb-0.5">Edificios</div>
              <div className="text-[12px] font-mono font-bold text-[#231e15] py-0.5">
                {roomsBuilt} / {roomsTotal}
              </div>
            </div>
            <div className="p-2">
              <div className="text-[9px] text-[#695d48] font-bold uppercase mb-0.5">Lealtad Base</div>
              <div className="text-[12px] font-mono font-bold text-[#0c7017] py-0.5">[--]</div>
            </div>
          </div>
          <div className="p-2 bg-[#e5dfcc] flex items-center justify-between text-[11px]">
            <div>
              <span className="text-[#554a37]">Familia Aliada: </span>
              <span className="font-bold text-[#7d2000]">{familyName}</span>
            </div>
            <span className="bg-[#1f4363] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              {familyMember ? `[${familyMember.family.tag}]` : "SIN TAG"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}