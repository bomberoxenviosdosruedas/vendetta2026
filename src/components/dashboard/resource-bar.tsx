'use client';

import Link from "next/link";
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

function formatNumber(num: number | undefined): string {
  if (typeof num !== 'number') return '0';
  return Math.floor(num).toLocaleString('de-DE');
}

interface ResourceBarProps {
  user: UserWithProgress | null;
  variant: 'desktop' | 'mobile';
  onOpenMenu?: () => void;
}

export function ResourceBar({ user, variant, onOpenMenu }: ResourceBarProps) {
  const router = useRouter();
  const { selectedProperty } = useProperty();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  if (!user || !selectedProperty) {
    return variant === 'desktop' ? (
      <header className="w-full h-12 min-h-12 shrink-0 flex items-center justify-center px-3 border-b-2 border-[#5a4b33] bg-[linear-gradient(180deg,#443c2c_0%,#2a2418_50%,#16120b_100%)]">
        <p className="text-[#a39a82] text-xs font-mono text-center">Selecciona una propiedad para ver tus recursos.</p>
      </header>
    ) : (
      <div className="bg-[#dfdbc9] border-b border-[#63553f] px-2 py-1.5 shadow-sm">
        <p className="text-[#6d6148] text-xs font-mono text-center">Selecciona una propiedad para ver tus recursos.</p>
      </div>
    );
  }

  const capacity = calculateStorageCapacity(selectedProperty);
  const production = calcularProduccionTotalPorSegundo(selectedProperty);
  const prodPerHour = {
    armas: Math.floor(production.armas * 3600),
    municion: Math.floor(production.municion * 3600),
    alcohol: Math.floor(production.alcohol * 3600),
    dolares: Math.floor(production.dolares * 3600),
  };

  const resources = [
    {
      key: 'armas',
      name: 'ARMAS',
      nameShort: 'Armas',
      value: selectedProperty.armas,
      icon: resourceIcons.armas,
      capacity: capacity.armas,
      fillDesktop: '#ff9800',
      fillMobile: '#ee7000',
      valueClass: 'text-[#221c13]',
      valueClassFull: 'text-[#8f1900]',
      prod: `+${formatNumber(prodPerHour.armas)}/h`,
    },
    {
      key: 'municion',
      name: 'MUNICIÓN',
      nameShort: 'Munición',
      value: selectedProperty.municion,
      icon: resourceIcons.municion,
      capacity: capacity.municion,
      fillDesktop: '#ff9800',
      fillMobile: '#ee7000',
      valueClass: 'text-[#221c13]',
      valueClassFull: 'text-[#8f1900]',
      prod: `+${formatNumber(prodPerHour.municion)}/h`,
    },
    {
      key: 'alcohol',
      name: 'ALCOHOL',
      nameShort: 'Alcohol',
      value: selectedProperty.alcohol,
      icon: resourceIcons.alcohol,
      capacity: capacity.alcohol,
      fillDesktop: '#e53935',
      fillMobile: '#ff0000',
      valueClass: 'text-[#c00000]',
      valueClassFull: 'text-[#ff0000]',
      prod: `+${formatNumber(prodPerHour.alcohol)}/h`,
    },
    {
      key: 'dolares',
      name: 'DÓLARES',
      nameShort: 'Dólares',
      value: selectedProperty.dolares,
      icon: resourceIcons.dolares,
      capacity: capacity.dolares,
      fillDesktop: '#4caf50',
      fillMobile: '#00bb22',
      valueClass: 'text-[#0c6b16]',
      valueClassFull: 'text-[#0a6614]',
      prod: `+${formatNumber(prodPerHour.dolares)}/h`,
    },
  ];

  const coords = `${selectedProperty.ciudad}:${selectedProperty.barrio}:${selectedProperty.edificio}`;

  if (variant === 'mobile') {
    return (
      <header className="sticky top-0 z-30 shadow-md">
        {/* Compact Identity Bar */}
        <div className="bg-[#1b150d] border-b border-[#4d3c26] px-2.5 py-1.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenMenu}
            className="retro-btn px-2.5 py-1.5 text-[11px] flex items-center gap-1 font-bold"
          >
            <MaterialIcon name="menu" size={15} />
            Menú
          </button>
          <div className="flex items-center justify-center flex-1 px-2">
            <span className="text-[#e8dec8] font-['Chivo'] font-bold text-[12px] tracking-wider uppercase">
              Vendetta <span className="text-[#ffe569]">2006</span>
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#2a2215] border border-[#524128] rounded text-[10px]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00ff00] animate-pulse" />
            <span className="text-[#e8dec8] font-bold font-['JetBrains_Mono']">ONLINE</span>
          </div>
        </div>

        {/* Realtime Server Status Strip */}
        <div className="flex items-center justify-between bg-[#2d2417] text-[#c9bea5] px-2.5 py-0.5 text-[9px] border-b border-[#4a3a22]">
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

        {/* Mobile Resources: 2x2 Parchment Grid */}
        <div className="bg-[#dfdbc9] border-b border-[#63553f] px-2 py-1.5 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5">
            {resources.map((res) => {
              const percentage = res.capacity > 0 ? Math.min(100, (res.value / res.capacity) * 100) : 0;
              const isFull = percentage >= 100;

              return (
                <div
                  key={res.key}
                  className="bg-[#f1ebda] border border-[#a89e87] rounded-sm p-1 shadow-inner"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#443825] mb-0.5">
                    <span className="flex items-center gap-1">
                      <MaterialIcon name={res.icon} size={13} />
                      {res.nameShort}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-['JetBrains_Mono']",
                        isFull ? "text-[#ff0000] font-bold animate-pulse" : "text-[#695d48]"
                      )}
                    >
                      {isFull ? '[LLENO]' : `${percentage.toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#231e16] rounded-sm overflow-hidden mb-1 border border-[#645945]">
                    <div className="h-full" style={{ width: `${percentage}%`, backgroundColor: isFull ? '#ff0000' : res.fillMobile }} />
                  </div>
                  <div
                    className={cn(
                      "text-right text-[11px] font-bold font-['JetBrains_Mono'] leading-none",
                      isFull ? res.valueClassFull : res.valueClass
                    )}
                  >
                    {res.key === 'dolares' ? `$${formatNumber(res.value)}` : formatNumber(res.value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full h-12 min-h-12 shrink-0 z-50 flex items-center justify-between gap-3 px-3 xl:px-4 border-b-2 border-[#5a4b33] shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-[linear-gradient(180deg,#443c2c_0%,#2a2418_50%,#16120b_100%)]">
      {/* Logo */}
      <Link href="/overview" className="flex items-center gap-2 shrink-0">
        <MaterialIcon name="gavel" size={22} className="text-[#f1ebd8]" />
        <div className="hidden md:flex flex-col leading-none">
          <span className="text-[13px] font-bold text-[#f1ebd8] tracking-wider uppercase font-['Chivo'] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Vendetta <span className="text-[#ffe569]">2006</span>
          </span>
          <span className="text-[9px] text-[#a39a82]">MMORPG Mafia Clásico</span>
        </div>
      </Link>

      {/* Live Resource Table */}
      <div className="flex-1 max-w-4xl mx-auto px-1 min-w-0">
        <table className="w-full border-collapse border-spacing-0">
          <tbody>
            <tr>
              {resources.map((res) => (
                <td
                  key={res.key}
                  className="bronze-th text-center text-[10px] font-['Chivo'] font-bold uppercase tracking-wider !py-0.5 px-1 whitespace-nowrap w-[20%]"
                >
                  {res.name}
                </td>
              ))}
              <td className="bronze-th text-center text-[9px] font-['JetBrains_Mono'] font-bold !py-0.5 px-1 whitespace-nowrap hidden sm:table-cell w-[20%]">
                HORA (SERVIDOR)
              </td>
            </tr>
            <tr>
              {resources.map((res) => {
                const percentage = res.capacity > 0 ? Math.min(100, (res.value / res.capacity) * 100) : 0;
                return (
                  <td key={res.key} className="!p-0 h-[3px] bg-[#2b2b2b]">
                    <div
                      className="h-[3px]"
                      style={{ width: `${percentage}%`, backgroundColor: res.fillDesktop }}
                    />
                  </td>
                );
              })}
              <td className="!p-0 h-[3px] bg-[#2b2b2b] hidden sm:table-cell" />
            </tr>
            <tr>
              {resources.map((res) => {
                const percentage = res.capacity > 0 ? Math.min(100, (res.value / res.capacity) * 100) : 0;
                const isFull = percentage >= 100;
                return (
                  <td
                    key={res.key}
                    className={cn(
                      "bg-[#dfdbc9] border border-[#000000] text-[9px] !py-0.5 px-1.5 whitespace-nowrap text-center font-['JetBrains_Mono'] font-bold",
                      isFull ? "text-[#c00000]" : res.valueClass
                    )}
                  >
                    {res.key === 'dolares' ? `$${formatNumber(res.value)}` : formatNumber(res.value)}
                    <MaterialIcon name={res.icon} size={12} className="ml-0.5 align-middle" />
                  </td>
                );
              })}
              <td className="bg-[#dfdbc9] border border-[#000000] text-[9px] !py-0.5 px-2 hidden sm:table-cell text-center">
                <LiveClock />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status & Quick Access */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href="/resources"
          className="res-chip hidden lg:flex items-center gap-1 hover:border-[#ffe569] transition-colors"
          title="Detalles de producción y capacidad de almacenes"
        >
          <MaterialIcon name="expand_more" size={12} />
          Producción
        </Link>
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-[#1a160f] border border-[#3e3523] rounded text-[10px] text-[#c9c3b2]">
          <span className="w-2 h-2 rounded-full bg-[#4caf50] animate-pulse" />
          <span>En Línea</span>
        </div>
        <div className="hidden lg:flex items-center gap-1 px-1.5 py-1 bg-[#1a160f] border border-[#3e3523] rounded text-[10px]">
          <span className="w-2 h-2 rounded-full bg-[#00ff00] animate-pulse" />
          <span className="text-[#00ff00] font-['JetBrains_Mono'] font-bold">x2 TICK</span>
        </div>
        <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 border border-[#3e3523]">
          <span className="text-[#a39a82] text-[9px] hidden sm:inline font-['JetBrains_Mono']">CAPO:</span>
          <span className="text-[#f1ebd8] font-bold text-[10px] font-['Chivo'] truncate max-w-[60px] sm:max-w-[90px]">
            {user.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="ml-0.5 text-[#e53935] hover:text-white"
          >
            <MaterialIcon name="logout" size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}