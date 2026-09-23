"use client";

import Link from "next/link";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Button } from "@/components/ui/button";
import MaterialIcon from "@/components/ui/material-icon";
import type { UserWithProgress, FullPropiedad } from "@/lib/data";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useProperty } from "@/contexts/property-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LiveClock } from "@/components/dashboard/live-clock";

interface PropertySelectorHeaderProps {
  properties: FullPropiedad[];
  selectedProperty: FullPropiedad | null;
  onSelectProperty: (id: string) => void;
}

function PropertySelectorHeader({ properties, selectedProperty, onSelectProperty }: PropertySelectorHeaderProps) {
  if (!selectedProperty) return null;

  return (
    <div className="cell-dark p-1 text-center w-full mb-2">
      <div className="text-[9px] text-[#888888] font-['Space_Mono'] uppercase tracking-widest">
        COORDENADAS
      </div>
      <div className="flex items-center justify-between mt-0.5 gap-1">
        {properties.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="btn-tactical w-full px-1 py-0.5 font-['Space_Mono'] text-[11px] font-bold text-[#fff400] flex items-center justify-between min-h-[36px]"
              >
                <span>{selectedProperty.ciudad}:{selectedProperty.barrio}:{selectedProperty.edificio}</span>
                <MaterialIcon name="arrow_drop_down" size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#0d0d0d] border-[#333333] text-[#dfdbc9]" align="start">
              <div className="px-2 py-1 text-[9px] font-mono text-[#888888] uppercase tracking-wider border-b border-[#222222]">
                TUS PROPIEDADES
              </div>
              {properties.map((prop) => (
                <DropdownMenuItem
                  key={prop.id}
                  onSelect={() => onSelectProperty(prop.id)}
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 text-[11px] cursor-pointer hover:bg-[#1f1f1f]",
                    selectedProperty.id === prop.id && "bg-[#6C0000] text-white font-bold"
                  )}
                >
                  <span className="truncate">{prop.nombre}</span>
                  <span className="font-mono text-[#fff400]">
                    [{prop.ciudad}:{prop.barrio}:{prop.edificio}]
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="font-['Space_Mono'] text-[11px] font-bold text-[#fff400] w-full py-0.5">
            {selectedProperty.ciudad}:{selectedProperty.barrio}:{selectedProperty.edificio}
          </div>
        )}
      </div>
      <div className="text-[10px] text-[#dfdbc9] mt-0.5 truncate font-['Space_Grotesk']">
        [{selectedProperty.nombre}]
      </div>
    </div>
  );
}

export function DashboardClientLayout({
  user,
  children,
}: {
  user: UserWithProgress | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { selectedProperty, setSelectedPropertyById } = useProperty();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-[100dvh] flex justify-center bg-[#080808] text-[#dfdbc9] text-[12px] antialiased">
      {/* Side Rail Left (53px) */}
      <aside className="hidden lg:block w-[53px] shrink-0 bg-[#000000] border-r border-[#222222] relative overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black/40" />
      </aside>

      {/* Main Game Column (Max 910px) */}
      <div className="w-full max-w-[910px] bg-[#111111] border-x border-[#333333] flex flex-col shadow-2xl min-h-[100dvh]">
        {/* Tactical Header */}
        <header className="w-full h-11 border-b border-[#333333] flex items-center justify-between px-3 shrink-0 relative bg-[#0d0d0d] text-white">
          <div className="flex items-center gap-2">
            <Link href="/overview" className="flex items-center gap-1.5">
              <span className="font-['Space_Grotesk'] font-bold text-[16px] sm:text-[18px] tracking-wider text-[#ffdad4]">
                VENDETTA <span className="text-[#ff3f3f]">2X</span>
              </span>
            </Link>
            <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-['Space_Mono'] bg-black/70 text-[#fabd00] border border-[#ffc107]/40 uppercase tracking-widest">
              SYNDICATE WARS
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-['Space_Mono']">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00ff00] animate-pulse" />
              <span className="text-[#00ff00] font-bold">x2 TICK</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[#a0a0a0]">RELOJ:</span>
              <LiveClock />
            </div>
            <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 border border-[#333333]">
              <span className="text-[#a0a0a0] hidden sm:inline">CAPO:</span>
              <span className="text-[#dfdbc9] font-bold truncate max-w-[80px] sm:max-w-none">
                {user?.name || "Bomberox"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 text-[#ff3f3f] hover:text-white"
                title="Cerrar Sesión"
              >
                <MaterialIcon name="logout" size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Game Body Frame */}
        <div className="flex flex-1 flex-col sm:flex-row relative min-h-0">
          {/* Command Left Nav (165px) */}
          <aside className="w-full sm:w-[165px] shrink-0 bg-[#0d0d0d] border-r border-[#333333] p-1.5 flex flex-col gap-1.5">
            <PropertySelectorHeader
              properties={user?.propiedades || []}
              selectedProperty={selectedProperty}
              onSelectProperty={setSelectedPropertyById}
            />
            <SidebarNav user={user} />
          </aside>

          {/* Main View Area */}
          <main className="flex-1 bg-[#111111] p-1.5 sm:p-2 flex flex-col gap-2 overflow-x-hidden min-w-0">
            {children}
          </main>
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-[#333333] bg-[#0a0a0a] px-3 py-1.5 text-[10px] font-['Space_Mono'] text-[#777777] flex items-center justify-between">
          <span className="text-[#dfdbc9]">Vendetta2X Engine © 2004-2026 Syndicate Network</span>
          <span className="text-[#00ff00]">Servidor Activo • Ping: 18ms</span>
        </footer>
      </div>

      {/* Side Rail Right (53px) */}
      <aside className="hidden lg:block w-[53px] shrink-0 bg-[#000000] border-l border-[#222222] relative overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black/40" />
      </aside>
    </div>
  );
}
