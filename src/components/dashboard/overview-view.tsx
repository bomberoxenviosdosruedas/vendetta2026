import { getSessionUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MaterialIcon from "@/components/ui/material-icon";
import { QueueStatusCard } from "./queue-status-card";
import { ActivityHistoryCard } from "./activity-history";
import { CityNewsCard } from "./city-news-ticker";
import { ResourceBar } from "./resource-bar";
import { getRoomConfigurations, getUserActivityHistory } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { ErrorBoundary, DashboardSectionErrorFallback } from "./error-boundary";

function ActionIcons({ unreadMessages }: { unreadMessages: number }) {
  const actions = [
    { href: "/messages?categoria=SISTEMA", iconName: "notifications", notification: 0, label: "Notificaciones" },
    { href: "/messages", iconName: "mail", notification: unreadMessages, label: "Mensajes" },
    { href: "/settings", iconName: "settings", notification: 0, label: "Opciones" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {actions.map((action, index) => (
        <TooltipProvider key={index} delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                className="btn-tactical h-11 w-11 min-h-[44px] min-w-[44px] p-0 relative"
              >
                <Link href={action.href} className="flex items-center justify-center">
                  <MaterialIcon name={action.iconName} size={18} />
                  <span className="sr-only">{action.label}</span>
                  {action.notification > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ff0000] text-white text-[9px] font-bold px-1 rounded-sm font-['Space_Mono'] animate-pulse">
                      {action.notification}
                    </span>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#0d0d0d] border-[#333333] text-[#dfdbc9] text-xs">
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

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
  const [allRoomConfigs, activities] = await Promise.all([
    getRoomConfigurations(),
    getUserActivityHistory(user.id)
  ]);
  const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre }));
  const unreadMessages = user._count?.receivedMessages || 0;

  const puntosTotales = (puntuacion?.puntosHabitaciones || 0) +
                        (puntuacion?.puntosTropas || 0) +
                        (puntuacion?.puntosEntrenamientos || 0);

  const mainProperty = user.propiedades[0];

  return (
    <div className="flex-grow space-y-2 w-full">
      {/* Sticky Resource Bar */}
      <ResourceBar user={user} />

      {/* 1. CUARTEL GENERAL / COMMAND CABIN */}
      <section className="cell-darker p-2 border border-[#333333]">
        <div className="crimson-th text-white px-2 py-1 flex items-center justify-between font-['Space_Grotesk'] font-bold text-[11px] uppercase tracking-wider mb-2">
          <div className="flex items-center gap-1.5">
            <MaterialIcon name="military_tech" size={15} className="text-[#fff400]" />
            <span>CUARTEL GENERAL // VISIÓN DE OPERACIONES</span>
          </div>
          <Button asChild className="btn-tactical text-[#fff400] hover:text-white text-[10px] sm:text-xs px-2 py-1 uppercase tracking-wider min-h-[44px] h-auto">
            <Link href="/map" className="flex items-center gap-1">
              <MaterialIcon name="public" size={12} />
              <span className="hidden sm:inline">VISIÓN GLOBAL DEL IMPERIO</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Jugador & Rango */}
          <div className="cell-dark p-2 flex items-center gap-2.5">
            <div className="relative w-12 h-12 shrink-0 border border-[#444444] bg-black overflow-hidden shadow-inner">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={user.avatarUrl || ''} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-black text-[#fff400] font-['Space_Grotesk'] text-lg font-bold rounded-none">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ff00] border border-black" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] text-[#888888] font-['Space_Mono'] uppercase">
                {user.title || "SIN RANGO"}
              </div>
              <div className="text-[14px] font-bold text-[#fff400] truncate font-['Space_Grotesk']">
                {user.name}
              </div>
              <div className="text-[10px] text-[#00ff00] font-['Space_Mono'] truncate">
                ID: #{user.id.slice(0, 6)} • ACTIVO
              </div>
            </div>
          </div>

          {/* Base Matriz */}
          <div className="cell-dark p-2 flex items-center gap-2.5">
            <div className="relative w-12 h-12 shrink-0 border border-[#444444] bg-black overflow-hidden shadow-inner">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3NA-NDL9KcSmY0sNt8GJ_SpKcPFCC2ARvkyhs0dCEn8wzdqP2Koba6gTHFnxsdXg-6Jp3m8C7szE6-5A45UXMcmqIZv9sgBOMXg1uxPN4KMkkRIcDu450di2uIt4umbq41RTokQgT53G07BYn3XzfG2aCnlgHg0zjrCaR_u4vLOnypYs0XaYNfkqatwjrrmazJG3B6Y4hldnYltODccQO6GkivB1mZ5GZJCSIdYEhN2-Jv5O0F9rGmyKSGPmcYgtR2zw"
                alt="Base Matriz"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] text-[#888888] font-['Space_Mono'] uppercase">
                BASE MATRIZ
              </div>
              <div className="text-[14px] font-bold text-white truncate font-['Space_Grotesk']">
                {mainProperty?.nombre || "SIN PROPIEDAD"}
              </div>
              <div className="text-[10px] text-[#fabd00] font-['Space_Mono']">
                COORD: {mainProperty ? `${mainProperty.ciudad}:${mainProperty.barrio}:${mainProperty.edificio}` : "-:-:-"}
              </div>
            </div>
          </div>

          {/* Familia Sindicato */}
          <div className="cell-dark p-2 flex items-center justify-between gap-2.5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-12 h-12 shrink-0 border border-[#444444] bg-[#0c1424] flex items-center justify-center text-[#fabd00]">
                <MaterialIcon name="shield" size={26} />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] text-[#888888] font-['Space_Mono'] uppercase">
                  FAMILIA SINDICATO
                </div>
                <div className="text-[14px] font-bold text-white truncate font-['Space_Grotesk']">
                  {familyMember ? familyMember.family.name : "SIN FAMILIA"}
                </div>
                <div className="text-[10px] text-[#ff3f3f] font-['Space_Mono'] font-bold">
                  {familyMember ? `[${familyMember.family.tag}] • ${familyMember.role}` : "ÚNETE A UNA FAMILIA"}
                </div>
              </div>
            </div>
            <ActionIcons unreadMessages={unreadMessages} />
          </div>
        </div>

        {/* Accesos rápidos tácticos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
          <Link href="/messages" className="btn-tactical p-2 flex items-center justify-between min-h-[44px]">
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="mail" size={16} className="text-[#fabd00]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">MENSAJES</span>
            </div>
            {unreadMessages > 0 && (
              <span className="bg-[#ff0000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-['Space_Mono'] animate-pulse">
                {unreadMessages}
              </span>
            )}
          </Link>
          <Link href="/messages?categoria=INFORMES" className="btn-tactical p-2 flex items-center justify-between min-h-[44px]">
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="description" size={16} className="text-[#dfdbc9]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">INFORMES</span>
            </div>
            <span className="bg-[#888888] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-['Space_Mono']">
              LOG
            </span>
          </Link>
          <Link href="/missions" className="btn-tactical p-2 flex items-center justify-between min-h-[44px]">
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="sync_alt" size={16} className="text-[#00ff00]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">FLOTAS</span>
            </div>
            {user.misiones.length > 0 && (
              <span className="bg-[#003800] border border-[#00c000] text-[#00ff00] text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-['Space_Mono']">
                {user.misiones.length}
              </span>
            )}
          </Link>
          <Link href="/simulator" className="btn-tactical p-2 flex items-center justify-between min-h-[44px]">
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="swords" size={16} className="text-[#ff3f3f]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">COMBATES</span>
            </div>
            <span className="bg-[#4d0000] border border-[#ff3f3f] text-[#ffdad4] text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-['Space_Mono']">
              SIM
            </span>
          </Link>
        </div>
      </section>

      {/* City News Ticker */}
      <ErrorBoundary fallback={<DashboardSectionErrorFallback title="Teletipo de la Ciudad" />}>
        <CityNewsCard />
      </ErrorBoundary>

      {/* Live Operational Queues */}
      <ErrorBoundary fallback={<DashboardSectionErrorFallback title="Colas Operativas" />}>
        <QueueStatusCard user={user} allRooms={simpleRoomConfigs} />
      </ErrorBoundary>

      {/* Recent Activity Ledger */}
      <ErrorBoundary fallback={<DashboardSectionErrorFallback title="Historial de Actividad" />}>
        <ActivityHistoryCard activities={activities} />
      </ErrorBoundary>

      {/* Estadísticas de Puntuación */}
      <section className="cell-darker p-2 border border-[#333333]">
        <div className="crimson-th text-white px-2 py-0.5 flex justify-between items-center text-[10px] font-['Space_Grotesk'] font-bold uppercase mb-1.5">
          <span className="flex items-center gap-1">
            <MaterialIcon name="leaderboard" size={13} className="text-[#fff400]" />
            ESTADÍSTICAS & LEALTAD
          </span>
          <span className="text-[#fabd00] font-['Space_Mono']">ACTUALIZADO</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 font-['Space_Mono'] text-[10px]">
          <div className="flex justify-between items-center cell-dark px-2 py-1.5">
            <span className="text-[#888888]">HABITACIONES:</span>
            <span className="text-white font-bold tabular-nums">{formatPoints(puntuacion?.puntosHabitaciones)}</span>
          </div>
          <div className="flex justify-between items-center cell-dark px-2 py-1.5">
            <span className="text-[#888888]">TROPAS:</span>
            <span className="text-[#ff3f3f] font-bold tabular-nums">{formatPoints(puntuacion?.puntosTropas)}</span>
          </div>
          <div className="flex justify-between items-center cell-dark px-2 py-1.5">
            <span className="text-[#888888]">ENTRENAMIENTO:</span>
            <span className="text-white font-bold tabular-nums">{formatPoints(puntuacion?.puntosEntrenamientos)}</span>
          </div>
          <div className="flex justify-between items-center bg-[#1f1616] border border-[#6C0000] px-2 py-1.5">
            <span className="text-[#fabd00] font-bold font-['Space_Grotesk'] uppercase">TOTAL:</span>
            <span className="text-[#fff400] font-bold text-[12px] tabular-nums">{formatPoints(puntosTotales)} pts</span>
          </div>
        </div>
      </section>
    </div>
  );
}
