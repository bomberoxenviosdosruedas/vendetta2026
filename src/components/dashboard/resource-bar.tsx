'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { UserWithProgress } from "@/lib/data";
import { useProperty } from "@/contexts/property-context";
import { calculateStorageCapacity, calcularProduccionTotalPorSegundo } from "@/lib/formulas/room-formulas";
import { cn } from "@/lib/utils";
import MaterialIcon from "@/components/ui/material-icon";
import { LiveClock } from "./live-clock";
import { logout } from "@/lib/auth";

const resourceIcons: { [key: string]: string } = {
  armas: 'swords',
  municion: 'bomb',
  alcohol: 'wine_bar',
  dolares: 'payments',
};

type ResourceKey = 'armas' | 'municion' | 'alcohol' | 'dolares';

/** Iconos svg de cada recurso (public/img/recursos/*.svg), usados en el panel de escritorio. */
const resourceIconFiles: Record<ResourceKey, string> = {
  armas: 'armas.svg',
  municion: 'municion.svg',
  alcohol: 'alcohol.svg',
  dolares: 'dolares.svg',
};

interface ResourceEntry {
  key: ResourceKey;
  name: string;
  nameShort: string;
  icon: string;
  iconFile: string;
  value: number;
  capacity: number;
  fill: string;
  prodH: number;
  prodD: number;
  prodS: number;
}

function formatNumber(num: number): string {
  return Math.floor(num).toLocaleString('de-DE');
}

function formatDurationFull(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function timeToFill(value: number, capacity: number, prodPerSecond: number): string {
  if (prodPerSecond <= 0) return '—';
  return formatDurationFull(Math.max(0, capacity - value) / prodPerSecond);
}

/**
 * Contador animado tipo odómetro: arranca desde 0 en el boot (900ms)
 * y hace count-up suave (500ms) en cada actualización del servidor.
 * Respeta prefers-reduced-motion.
 */
function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef<number>(0);
  const startedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const to = target;
    const from = startedRef.current ? prevRef.current : 0;
    startedRef.current = true;
    prevRef.current = to;

    if (reduceMotionRef.current || from === to) {
      setDisplay(to);
      return;
    }

    const duration = from === 0 ? 900 : 500;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.floor(from + (to - from) * ease(t)));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return display;
}

function getResourceStatus(res: ResourceEntry) {
  const percentage = res.capacity > 0 ? Math.min(100, (res.value / res.capacity) * 100) : 0;
  return {
    percentage,
    isFull: percentage >= 100,
    isLow: percentage < 15 && percentage < 100,
  };
}

/** Unidad de recurso del panel de escritorio: cabecera carmesí (icono svg + etiqueta), barra de relleno y valor animado. */
function DesktopResourceUnit({ res, booted, index }: { res: ResourceEntry; booted: boolean; index: number }) {
  const animated = useAnimatedNumber(res.value);
  const { percentage, isFull, isLow } = getResourceStatus(res);

  return (
    <div className="flex-1 min-w-0 flex flex-col border border-[#000]">
      {/* Cabecera carmesí clásica con icono del recurso */}
      <div className="vb-crimson-cell flex items-center justify-center gap-1.5 px-1.5 py-1 text-[12px] font-['Chivo'] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden">
        <Image src={`/img/recursos/${res.iconFile}`} alt={res.name} width={16} height={16} className="object-contain shrink-0" />
        <span className="truncate">{res.name}</span>
      </div>

      {/* Barra de relleno (clásica de 5px) */}
      <div className="vb-track h-[7px] border-x border-[#000]">
        <div
          className={cn("vb-fill h-full transition-[width] duration-700 ease-out", isFull && "vb-full-pulse")}
          style={{
            width: booted ? `${percentage}%` : '0%',
            backgroundColor: res.fill,
            transitionDelay: !booted ? `${index * 90}ms` : '0ms',
          }}
        />
      </div>

      {/* Valor animado */}
      <div
        className={cn(
          "vb-cell border border-t-0 border-[#000] text-[14px] !py-1.5 px-1.5 whitespace-nowrap text-center font-['JetBrains_Mono'] font-bold tabular-nums transition-colors",
          isFull ? "text-[#ff4545] vb-blink" : isLow && "text-[#ffb84d]"
        )}
        title={isFull ? 'Almacén lleno' : isLow ? 'Stock bajo' : undefined}
      >
        {res.key === 'dolares' ? `$${formatNumber(animated)}` : formatNumber(animated)}
      </div>
    </div>
  );
}

/** Unidad CAPO del panel de escritorio: nombre del jugador, chevron del expediente y salida. */
function DesktopCapoUnit({ name, open, onLogout }: { name: string; open: boolean; onLogout: () => void }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col border border-[#000]">
      <div className="vb-crimson-cell flex items-center justify-center gap-1 px-1.5 py-1 text-[12px] font-['Chivo'] font-bold uppercase tracking-wider whitespace-nowrap">
        <MaterialIcon name="person" size={13} className="align-middle" />
        CAPO
      </div>

      <div className="vb-track h-[7px] border-x border-[#000]" />

      <div className="vb-cell border border-t-0 border-[#000] text-[13px] !py-1.5 px-1.5 whitespace-nowrap text-center font-['JetBrains_Mono']">
        <span className="flex items-center justify-center gap-1 min-w-0">
          <span className="text-[#f1ebd8] font-bold truncate max-w-[90px] min-[420px]:max-w-[130px] lg:max-w-[200px]" title={name}>
            {name}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }}
            title="Cerrar Sesión"
            aria-label={`Cerrar sesión de ${name}`}
            className="ml-0.5 text-[#e53935] hover:text-white transition-colors shrink-0"
          >
            <MaterialIcon name="logout" size={16} />
          </button>
          <span className={cn("text-[#ffe569] transition-transform", open ? "rotate-180" : "")}>
            <MaterialIcon name="expand_more" size={14} />
          </span>
        </span>
      </div>
    </div>
  );
}

/** Tile móvil con contador animado y expediente expandible */
function MobileResourceTile({ res, index, booted, isOpen, onToggle }: {
  res: ResourceEntry;
  index: number;
  booted: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const animated = useAnimatedNumber(res.value);
  const { percentage, isFull, isLow } = getResourceStatus(res);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      aria-label={isOpen ? `Ocultar detalle de ${res.nameShort}` : `Ver detalle de ${res.nameShort}`}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className="border border-[#3a3020] bg-[#17130d] shadow-[inset_0_0_6px_rgba(0,0,0,0.7)] cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ffe569] transition-colors"
    >
      {/* Mini cabecera carmesí */}
      <div className="vb-crimson-cell flex items-center justify-between px-1.5 py-0.5 text-[10px] font-['Chivo'] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <MaterialIcon name={res.icon} size={11} />
          {res.nameShort}
        </span>
        <span className={cn("text-[#ffcccc]/90", isOpen && "text-[#ffe569]")}>
          <MaterialIcon name={isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={11} />
        </span>
      </div>

      {/* Barra */}
      <div className="vb-track h-[5px] border-x border-[#000]">
        <div
          className={cn("vb-fill h-full transition-[width] duration-700 ease-out", isFull && "vb-full-pulse")}
          style={{
            width: booted ? `${percentage}%` : '0%',
            backgroundColor: res.fill,
            transitionDelay: !booted ? `${index * 90}ms` : '0ms',
          }}
        />
      </div>

      {/* Valor */}
      <div className="flex items-center justify-between px-1.5 py-0.5 bg-[#17130d]">
        <span
          className={cn(
            "text-xs font-['JetBrains_Mono'] font-bold tabular-nums leading-none",
            isFull ? "text-[#ff4545] vb-blink" : isLow ? "text-[#ffb84d]" : "text-[#e8e2cf]"
          )}
          title={isFull ? 'Almacén lleno' : isLow ? 'Stock bajo' : undefined}
        >
          {res.key === 'dolares' ? `$${formatNumber(animated)}` : formatNumber(animated)}
        </span>
        <span className="text-[9px] text-[#8a7d63] font-['JetBrains_Mono']">
          {isFull ? '[LLENO]' : `${percentage.toFixed(0)}%`}
        </span>
      </div>

      {/* Expediente expandible */}
      <div className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <div className="px-1.5 py-1 border-t border-[#2c2418] bg-[#120e09] text-[9px] font-['JetBrains_Mono'] leading-relaxed">
            <div className="flex justify-between gap-1">
              <span className="text-[#8a7d63]">Capacidad</span>
              <span className="text-[#c9bea5]">({formatNumber(res.capacity)})</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-[#8a7d63]">Por hora</span>
              <span className="text-[#00c000] font-['Verdana'] font-bold">+{formatNumber(res.prodH)}/h</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-[#8a7d63]">Por día</span>
              <span className="text-[#00c000] font-['Verdana'] font-bold">+{formatNumber(res.prodD)}/d</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-[#8a7d63]">Hasta llenar</span>
              <span className={cn(isFull ? "text-[#ff4545]" : "text-[#ffe569]")}>
                {timeToFill(res.value, res.capacity, res.prodS)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResourceBarProps {
  user: UserWithProgress | null;
  variant: 'desktop' | 'mobile';
  onOpenMenu?: () => void;
}

export function ResourceBar({ user, variant, onOpenMenu }: ResourceBarProps) {
  const router = useRouter();
  const { selectedProperty } = useProperty();
  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState<ResourceKey | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setBooted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  if (!user || !selectedProperty) {
    return variant === 'desktop' ? (
      <header className="w-full h-16 min-h-16 shrink-0 flex items-center justify-center px-3 border-b-2 border-[#5a4b33] bg-[linear-gradient(180deg,#443c2c_0%,#2a2418_50%,#16120b_100%)]">
        <p className="text-[#a39a82] text-sm font-mono text-center">Selecciona una propiedad para ver tus recursos.</p>
      </header>
    ) : (
      <div className="bg-[#dfdbc9] border-b border-[#63553f] px-2 py-1.5 shadow-sm">
        <p className="text-[#6d6148] text-xs font-mono text-center">Selecciona una propiedad para ver tus recursos.</p>
      </div>
    );
  }

  const capacity = calculateStorageCapacity(selectedProperty);
  const production = calcularProduccionTotalPorSegundo(selectedProperty);

  const resources: ResourceEntry[] = [
    {
      key: 'armas',
      name: 'ARMAS',
      nameShort: 'Armas',
      icon: resourceIcons.armas,
      iconFile: resourceIconFiles.armas,
      value: Number(selectedProperty.armas),
      capacity: capacity.armas,
      fill: '#ff9800',
      prodS: production.armas,
      prodH: Math.floor(production.armas * 3600),
      prodD: Math.floor(production.armas * 86400),
    },
    {
      key: 'municion',
      name: 'MUNICIÓN',
      nameShort: 'Munición',
      icon: resourceIcons.municion,
      iconFile: resourceIconFiles.municion,
      value: Number(selectedProperty.municion),
      capacity: capacity.municion,
      fill: '#ff9800',
      prodS: production.municion,
      prodH: Math.floor(production.municion * 3600),
      prodD: Math.floor(production.municion * 86400),
    },
    {
      key: 'alcohol',
      name: 'ALCOHOL',
      nameShort: 'Alcohol',
      icon: resourceIcons.alcohol,
      iconFile: resourceIconFiles.alcohol,
      value: Number(selectedProperty.alcohol),
      capacity: capacity.alcohol,
      fill: '#e53935',
      prodS: production.alcohol,
      prodH: Math.floor(production.alcohol * 3600),
      prodD: Math.floor(production.alcohol * 86400),
    },
    {
      key: 'dolares',
      name: 'DÓLARES',
      nameShort: 'Dólares',
      icon: resourceIcons.dolares,
      iconFile: resourceIconFiles.dolares,
      value: Number(selectedProperty.dolares),
      capacity: capacity.dolares,
      fill: '#4caf50',
      prodS: production.dolares,
      prodH: Math.floor(production.dolares * 3600),
      prodD: Math.floor(production.dolares * 86400),
    },
  ];

  const coords = `${selectedProperty.ciudad}:${selectedProperty.barrio}:${selectedProperty.edificio}`;

  const toggle = () => setOpen(o => !o);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  /* ------------------------------------------------------------------ */
  /* VARIANTE MÓVIL                                                       */
  /* ------------------------------------------------------------------ */
  if (variant === 'mobile') {
    return (
      <header className="sticky top-0 z-30 shadow-md">
        {/* Compact Identity Bar */}
        <div className="bg-[#1b150d] border-b border-[#4d3c26] px-2.5 py-1.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenMenu}
            className="retro-btn px-2.5 py-1.5 text-xs flex items-center gap-1 font-bold"
          >
            <MaterialIcon name="menu" size={15} />
            Menú
          </button>
          <div className="flex items-center justify-center flex-1 px-2">
            <span className="text-[#e8dec8] font-['Chivo'] font-bold text-[13px] tracking-wider uppercase">
              Vendetta <span className="text-[#ffe569]">2006</span>
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#2a2215] border border-[#524128] rounded text-[11px] min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00ff00] animate-pulse shrink-0" />
            <span className="text-[#e8dec8] font-bold font-['JetBrains_Mono'] truncate max-w-[84px] min-[420px]:max-w-[120px]" title={user.name}>
              {user.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar Sesión"
              aria-label={`Cerrar sesión de ${user.name}`}
              className="ml-0.5 text-[#e53935] hover:text-white transition-colors"
            >
              <MaterialIcon name="logout" size={14} />
            </button>
          </div>
        </div>

        {/* Realtime Server Status Strip */}
        <div className="flex items-center justify-between bg-[#2d2417] text-[#c9bea5] px-2.5 py-0.5 text-[10px] border-b border-[#4a3a22]">
          <div className="flex items-center gap-1">
            <span className="text-[#96866b] flex items-center gap-0.5">
              <MaterialIcon name="schedule" size={12} /> Servidor:
            </span>
            <LiveClock />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#dfcca0] font-['JetBrains_Mono'] font-bold">{coords}</span>
            <Link href="/resources" className="text-[#ffd777] underline hover:text-white">
              Producción
            </Link>
          </div>
        </div>

        {/* Mobile Resources: 2x2 Instrument Tiles */}
        <div className="bg-[#0c0a06] border-b border-[#3a3020] px-2 py-1.5 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5">
            {resources.map((res, i) => (
              <MobileResourceTile
                key={res.key}
                res={res}
                index={i}
                booted={booted}
                isOpen={openKey === res.key}
                onToggle={() => setOpenKey(openKey === res.key ? null : res.key)}
              />
            ))}
          </div>
        </div>
      </header>
    );
  }

  /* ------------------------------------------------------------------ */
  /* VARIANTE ESCRITORIO (estructura del ejemplo: sticky + flex + chips)  */
  /* ------------------------------------------------------------------ */
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#5a4b33] shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-[linear-gradient(180deg,#443c2c_0%,#2a2418_50%,#16120b_100%)]">
      <div className="flex h-16 items-center justify-between gap-3 xl:gap-4 px-4 xl:px-6">
        {/* Logo */}
        <Link href="/overview" className="flex items-center gap-2.5 shrink-0">
          <MaterialIcon name="gavel" size={28} className="text-[#f1ebd8]" />
          <div className="hidden md:flex flex-col leading-none">
            <span className="text-[18px] font-bold text-[#f1ebd8] tracking-wider uppercase font-['Chivo'] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Vendetta <span className="text-[#ffe569]">2006</span>
            </span>
            <span className="text-[11px] text-[#a39a82]">MMORPG Mafia Clásico</span>
          </div>
        </Link>

        {/* Panel de instrumentos: unidades por recurso + CAPO (clic: expediente) */}
        <div className="relative flex-1 min-w-0 max-w-6xl">
          <div
            role="button"
            tabIndex={0}
            aria-expanded={open}
            aria-controls="resource-dossier"
            aria-label={open ? 'Ocultar detalle de producción' : 'Ver detalle de producción (capacidad, producción y tiempo hasta llenar)'}
            onClick={toggle}
            onKeyDown={onKeyDown}
            className="flex h-full items-center gap-[1px] cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ffe569]"
            title="Clic para ver el detalle de producción"
          >
            {resources.map((res, i) => (
              <DesktopResourceUnit key={res.key} res={res} booted={booted} index={i} />
            ))}
            <DesktopCapoUnit name={user.name} open={open} onLogout={handleLogout} />
          </div>

          {/* Expediente de producción (toggle estilo Vendetta 2X) */}
          <div
            id="resource-dossier"
            aria-hidden={!open}
            className={cn(
              "absolute left-0 right-0 top-full z-50 grid transition-[grid-template-rows] duration-300 ease-out",
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <table className="w-full border-collapse border-spacing-0 border-b-2 border-[#5a4b33] shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                <tbody>
                  {[
                    {
                      label: 'Capacidad',
                      render: (res: ResourceEntry) => <span className="text-[#9a8d74]">({formatNumber(res.capacity)})</span>,
                    },
                    {
                      label: 'Producción',
                      render: (res: ResourceEntry) => <span className="text-[#00c000] font-['Verdana'] font-bold">+{formatNumber(res.prodH)}/h</span>,
                    },
                    {
                      label: 'Por día',
                      render: (res: ResourceEntry) => <span className="text-[#00c000] font-['Verdana'] font-bold">+{formatNumber(res.prodD)}/d</span>,
                    },
                    {
                      label: 'Hasta llenar',
                      render: (res: ResourceEntry) => {
                        const { isFull } = getResourceStatus(res);
                        const ttl = timeToFill(res.value, res.capacity, res.prodS);
                        return <span className={cn("font-['JetBrains_Mono'] font-bold", isFull ? "text-[#ff4545]" : ttl === '—' ? "text-[#8a7d63]" : "text-[#ffe569]")}>{ttl}</span>;
                      },
                    },
                  ].map((row, rowIdx) => (
                    <tr key={row.label}>
                      {resources.map((res) => (
                        <td
                          key={res.key}
                          className={cn(
                            "vb-cell border border-[#000] text-[12px] !py-1.5 px-1.5 whitespace-nowrap text-center font-['JetBrains_Mono']",
                            rowIdx % 2 === 1 && "bg-[linear-gradient(180deg,#16120b_0%,#0f0c07_100%)]"
                          )}
                          data-label={row.label}
                        >
                          {row.render(res)}
                        </td>
                      ))}
                      {rowIdx === 0 && (
                        <td className="vb-cell border border-[#000] text-[12px] px-3 align-middle text-left" rowSpan={4}>
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="text-[10px] text-[#8a7d63] font-['JetBrains_Mono'] uppercase tracking-wider">Coordenadas</div>
                                <div className="text-[#dfcca0] font-['JetBrains_Mono'] font-bold">{coords}</div>
                              </div>
                              <button
                                type="button"
                                onClick={handleLogout}
                                title="Cerrar Sesión"
                                aria-label={`Cerrar sesión de ${user.name}`}
                                className="text-[#e53935] hover:text-white transition-colors"
                              >
                                <MaterialIcon name="logout" size={16} />
                              </button>
                            </div>
                            <div className="text-[10px] text-[#8a7d63] font-['JetBrains_Mono'] uppercase tracking-wider">Hora servidor</div>
                            <LiveClock />
                            <div className="mt-1 flex items-center justify-between border-t border-[#000] pt-1">
                              <span className="text-[#c9bea5] font-['Chivo'] font-bold uppercase tracking-wider text-[12px]">{user.name}</span>
                              <span className="text-[10px] text-[#ffe569]/80 font-['JetBrains_Mono'] uppercase tracking-wider">
                                <MaterialIcon name="expand_less" size={11} className="align-middle" /> Ocultar
                              </span>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chip con reloj del servidor (solo escritorio) */}
        <div className="hidden lg:flex items-center gap-2 bg-[#241d11] border border-[#4a3822] px-3 py-1.5 rounded-[3px] shadow-[inset_0_0_4px_rgba(0,0,0,0.6)] shrink-0" title="Hora del servidor">
          <MaterialIcon name="schedule" size={16} className="text-[#ffe569]" />
          <LiveClock />
        </div>
      </div>
    </header>
  );
}