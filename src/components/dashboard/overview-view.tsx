import { getSessionUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MaterialIcon from "@/components/ui/material-icon";
import { QueueStatusCard } from "./queue-status-card";
import { BaseTroopsSection } from "./base-troops-section";
import { getRoomConfigurations, type FullPropiedad } from "@/lib/data";
import { ErrorBoundary, DashboardSectionErrorFallback } from "./error-boundary";
import Link from "next/link";
import { resolveConfigImageUrl } from "@/lib/config-images";

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
  const roomsBuilt = user.propiedades.reduce((sum: number, p: FullPropiedad) => sum + p.habitaciones.length, 0);
  const roomsTotal = user.propiedades.length * 5;
  const mainCoords = mainProperty
    ? `${mainProperty.ciudad}:${mainProperty.barrio}:${mainProperty.edificio}`
    : "-:-:-";

  // Get image for base - use first room's image or fallback
  const baseImageUrl = mainProperty?.habitaciones[0]?.configuracion?.urlImagen
    ? resolveConfigImageUrl(mainProperty.habitaciones[0].configuracion.urlImagen)
    : '';

  const familyName = familyMember ? familyMember.family.name : "SIN FAMILIA";
  const familySub = familyMember
    ? `[${familyMember.family.tag}] · ${familyMember.role}`
    : "ÚNETE A UNA FAMILIA";

  const familyImageUrl = familyMember?.family?.avatarUrl || '';

  return (
    <div className="w-full space-y-2.5">
      {/* 1. VISIÓN GENERAL DEL IMPERIO */}
      <section className="v-outer-frame">
        <div className="v-header-c flex items-center justify-between px-3 py-2.5">
          <span className="font-bold text-[14px] tracking-wide">VISIÓN GENERAL DEL IMPERIO</span>
          <Link href="/map" className="text-[#ffe569] text-xs underline hover:text-white flex items-center gap-1">
            <MaterialIcon name="visibility" size={14} />
            [Todo el Imperio]
          </Link>
        </div>

        {/* Desktop: avatar-box + columna de accesos */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_96px] divide-x divide-[#c4bdab] border-b border-[#a89e87] bg-[#f1ebda]">
          {/* Jugador */}
          <div className="p-2.5">
            <div className="text-[10px] text-[#695d48] font-bold uppercase text-center mb-1.5">Jugador</div>
            {user.avatarUrl ? (
              <div className="avatar-box">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="avatar-box__image"
                />
                <div className="avatar-box__overlay">
                  <strong className="avatar-box__name truncate w-full">{user.name}</strong>
                  <span className="avatar-box__subtitle truncate w-full">{user.title || "Capo"}</span>
                </div>
              </div>
            ) : (
              <div className="avatar-box avatar-box--fallback">
                <Avatar className="w-12 h-12 rounded-sm border border-[#5e5138] bg-[#181410] avatar-box__icon mb-1.5">
                  <AvatarImage src={user.avatarUrl || ''} alt={user.name} className="object-cover" />
                  <AvatarFallback className="bg-[#181410] text-[#ffe569] font-['Chivo'] font-bold rounded-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <strong className="text-sm text-[#ece6d5] truncate w-full px-1">{user.name}</strong>
                <span className="text-[10px] text-[#a49a83] mt-1 truncate w-full px-1">{user.title || "Capo"}</span>
              </div>
            )}
          </div>

          {/* Base */}
          <div className="p-2.5">
            <div className="text-[10px] text-[#695d48] font-bold uppercase text-center mb-1.5">Base Actual</div>
            {baseImageUrl ? (
              <div className="avatar-box">
                <img
                  src={baseImageUrl}
                  alt={mainProperty?.nombre || "Base"}
                  className="avatar-box__image"
                />
                <div className="avatar-box__overlay">
                  <strong className="avatar-box__name truncate w-full">{mainProperty?.nombre || "SIN PROPIEDAD"}</strong>
                  <span className="avatar-box__subtitle font-['JetBrains_Mono'] truncate w-full">{mainCoords}</span>
                </div>
              </div>
            ) : (
              <div className="avatar-box avatar-box--fallback">
                <MaterialIcon name="home" size={30} className="avatar-box__icon text-[#e2cca2] mb-1.5" />
                <strong className="text-sm text-[#ece6d5] truncate w-full px-1">{mainProperty?.nombre || "SIN PROPIEDAD"}</strong>
                <span className="text-[10px] text-[#a49a83] mt-1 font-['JetBrains_Mono']">{mainCoords}</span>
              </div>
            )}
          </div>

          {/* Familia */}
          <div className="p-2.5">
            <div className="text-[10px] text-[#695d48] font-bold uppercase text-center mb-1.5">Familia</div>
            {familyImageUrl ? (
              <div className="avatar-box">
                <img
                  src={familyImageUrl}
                  alt={familyName}
                  className="avatar-box__image"
                />
                <div className="avatar-box__overlay">
                  <strong className="avatar-box__name truncate w-full">{familyName}</strong>
                  <span className="avatar-box__subtitle truncate w-full">{familySub}</span>
                </div>
              </div>
            ) : (
              <div className="avatar-box avatar-box--fallback">
                <MaterialIcon name="shield" size={30} className="avatar-box__icon text-[#e2cca2] mb-1.5" />
                <strong className="text-sm text-[#ece6d5] truncate w-full px-1">{familyName}</strong>
                <span className="text-[10px] text-[#a49a83] mt-1 truncate w-full px-1">{familySub}</span>
              </div>
            )}
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
            <div className="p-1.5">
              <div className="text-[9px] font-bold text-[#72644e] uppercase mb-1 text-center">Jugador</div>
              {user.avatarUrl ? (
                <div className="avatar-box h-28 max-w-full mx-auto">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="avatar-box__image"
                  />
                  <div className="avatar-box__overlay">
                    <strong className="avatar-box__name truncate w-full text-center">{user.name}</strong>
                    <span className="avatar-box__subtitle truncate w-full text-center">{user.title || "Capo"}</span>
                  </div>
                </div>
              ) : (
                <div className="avatar-box avatar-box--fallback h-28 max-w-full mx-auto">
                  <Avatar className="w-9 h-9 rounded-sm border border-[#5e5138] bg-[#181410] avatar-box__icon mb-1">
                    <AvatarImage src={user.avatarUrl || ''} alt={user.name} className="object-cover" />
                    <AvatarFallback className="bg-[#181410] text-[#ffe569] font-['Chivo'] font-bold rounded-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <strong className="text-xs text-[#ece6d5] truncate w-full">{user.name}</strong>
                  <span className="text-[8px] text-[#a49a83] truncate w-full">{user.title || "Capo"}</span>
                </div>
              )}
            </div>
            <div className="p-1.5">
              <div className="text-[9px] font-bold text-[#72644e] uppercase mb-1 text-center">Base Actual</div>
              {baseImageUrl ? (
                <div className="avatar-box h-28 max-w-full mx-auto">
                  <img
                    src={baseImageUrl}
                    alt={mainProperty?.nombre || "Base"}
                    className="avatar-box__image"
                  />
                  <div className="avatar-box__overlay">
                    <strong className="avatar-box__name truncate w-full text-center">{mainProperty?.nombre || "SIN PROPIEDAD"}</strong>
                    <span className="avatar-box__subtitle font-['JetBrains_Mono'] truncate w-full text-center">{mainCoords}</span>
                  </div>
                </div>
              ) : (
                <div className="avatar-box avatar-box--fallback h-28 max-w-full mx-auto">
                  <MaterialIcon name="home" size={24} className="avatar-box__icon text-[#e2cca2] mb-1" />
                  <strong className="text-xs text-[#ece6d5] truncate w-full">{mainProperty?.nombre || "SIN PROPIEDAD"}</strong>
                  <span className="text-[8px] text-[#a49a83] font-['JetBrains_Mono']">{mainCoords}</span>
                </div>
              )}
            </div>
            <div className="p-1.5">
              <div className="text-[9px] font-bold text-[#72644e] uppercase mb-1 text-center">Familia</div>
              {familyImageUrl ? (
                <div className="avatar-box h-28 max-w-full mx-auto">
                  <img
                    src={familyImageUrl}
                    alt={familyName}
                    className="avatar-box__image"
                  />
                  <div className="avatar-box__overlay">
                    <strong className="avatar-box__name truncate w-full text-center">{familyName}</strong>
                    <span className="avatar-box__subtitle truncate w-full text-center">{familyMember ? familyMember.family.tag : "SIN TAG"}</span>
                  </div>
                </div>
              ) : (
                <div className="avatar-box avatar-box--fallback h-28 max-w-full mx-auto">
                  <MaterialIcon name="shield" size={24} className="avatar-box__icon text-[#e2cca2] mb-1" />
                  <strong className="text-xs text-[#ece6d5] truncate w-full">{familyName}</strong>
                  <span className="text-[8px] text-[#a49a83] truncate w-full">{familyMember ? familyMember.family.tag : "SIN TAG"}</span>
                </div>
              )}
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
              <span className="text-[10px] font-bold text-[#5fe06e] font-mono">{user.misiones.length}</span>
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
        <div className="v-header-c flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <MaterialIcon name="leaderboard" size={15} className="text-[#e2ca92]" />
            <span className="font-bold text-[14px] tracking-wide">PUNTOS DEL JUGADOR</span>
          </div>
          <span className="text-xs text-[#e0cfab]">Clasificación Global</span>
        </div>

        {/* Desktop: tabla clásica 6 columnas */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[11px] font-bold uppercase px-2.5 py-1.5">
                  Puntos (Entrenamiento)
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[11px] font-bold uppercase px-2.5 py-1.5">
                  Puntos (Edificios)
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[11px] font-bold uppercase px-2.5 py-1.5">
                  Puntos (Tropas)
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[11px] font-bold uppercase px-2.5 py-1.5">
                  Total
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[11px] font-bold uppercase px-2.5 py-1.5">
                  Edificios
                </th>
                <th className="bg-[#dfdbc9] border border-black text-[#201a11] text-[11px] font-bold uppercase px-2.5 py-1.5">
                  Lealtad
                </th>
              </tr>
              <tr>
                <td className="bg-[#f1ebda] border border-black font-['JetBrains_Mono'] text-[13px] text-center py-2 text-[#221c13]">
                  {formatPoints(puntuacion?.puntosEntrenamientos)}
                </td>
                <td className="bg-[#e9e3d2] border border-black font-['JetBrains_Mono'] text-[13px] text-center py-2 text-[#221c13]">
                  {formatPoints(puntuacion?.puntosHabitaciones)}
                </td>
                <td className="bg-[#f1ebda] border border-black font-['JetBrains_Mono'] text-[13px] text-center py-2 text-[#221c13]">
                  {formatPoints(puntuacion?.puntosTropas)}
                </td>
                <td className="bg-[#ffe569] border border-black font-['JetBrains_Mono'] text-[13px] text-center py-2 font-bold text-[#1a150f]">
                  {formatPoints(puntosTotales)}
                </td>
                <td className="bg-[#e9e3d2] border border-black font-['JetBrains_Mono'] text-[13px] text-center py-2 text-[#221c13]">
                  {roomsBuilt} / {roomsTotal}
                </td>
                <td className="bg-[#f1ebda] border border-black font-['JetBrains_Mono'] text-[13px] text-center py-2 text-[#221c13]">
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