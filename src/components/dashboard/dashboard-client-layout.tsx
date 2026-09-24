'use client';

import { useState } from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ResourceBar } from "@/components/dashboard/resource-bar";
import { MobileNavDrawer } from "@/components/dashboard/mobile-nav-drawer";
import MaterialIcon from "@/components/ui/material-icon";
import type { UserWithProgress, FullPropiedad } from "@/lib/data";
import { useProperty } from "@/contexts/property-context";

interface PropertySelectorHeaderProps {
  properties: FullPropiedad[];
  selectedProperty: FullPropiedad | null;
  onSelectProperty: (id: string) => void;
}

function PropertySelectorHeader({ properties, selectedProperty, onSelectProperty }: PropertySelectorHeaderProps) {
  if (!selectedProperty) return null;

  const currentIndex = properties.findIndex(p => p.id === selectedProperty.id);
  const hasMultiple = properties.length > 1;

  const cycle = (direction: 1 | -1) => {
    const target = properties[(currentIndex + direction + properties.length) % properties.length];
    if (target) onSelectProperty(target.id);
  };

  return (
    <div className="mb-2 px-1 py-1.5 bg-[#c5c0ad] border border-[#5a4f3d] shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]">
      <div className="text-center text-[8px] font-bold text-[#554b3c] tracking-[0.2em] uppercase mb-1">
        Base Actual
      </div>
      {hasMultiple && (
        <div className="flex justify-center mb-1">
          <button
            type="button"
            className="nav-btn flex items-center justify-center"
            onClick={() => cycle(-1)}
            title="Anterior"
            aria-label="Base anterior"
          >
            <MaterialIcon name="expand_less" size={16} />
          </button>
        </div>
      )}
      <select
        className="nav-select"
        value={selectedProperty.id}
        onChange={(e) => onSelectProperty(e.target.value)}
        aria-label="Seleccionar base"
      >
        {properties.map(p => (
          <option key={p.id} value={p.id}>
            {p.nombre} ({p.ciudad}:{p.barrio}:{p.edificio})
          </option>
        ))}
      </select>
      {hasMultiple && (
        <div className="flex justify-center mt-1">
          <button
            type="button"
            className="nav-btn flex items-center justify-center"
            onClick={() => cycle(1)}
            title="Siguiente"
            aria-label="Base siguiente"
          >
            <MaterialIcon name="expand_more" size={16} />
          </button>
        </div>
      )}
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
  const { selectedProperty, setSelectedPropertyById } = useProperty();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#080808] text-[#dfdbc9] text-[12px] antialiased lg:h-[100dvh] lg:overflow-hidden">
      {/* Barra de Recursos Desktop (docked, estática) */}
      <div className="hidden md:block shrink-0">
        <ResourceBar user={user} variant="desktop" />
      </div>

      {/* Cabecera Recursos Móvil (sticky) */}
      <div className="md:hidden">
        <ResourceBar user={user} variant="mobile" onOpenMenu={() => setMenuOpen(true)} />
      </div>

      {/* Viewport: sidebar docked + lienzo central scrollable */}
      <div className="flex flex-1 min-h-0">
        {/* Menú de Navegación docked a la izquierda */}
        <aside className="hidden lg:flex w-[215px] shrink-0 flex-col bg-[#050505] border-r-2 border-[#332d20] overflow-y-auto p-2 shadow-[2px_0_10px_rgba(0,0,0,0.8)]">
          <PropertySelectorHeader
            properties={user?.propiedades || []}
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedPropertyById}
          />
          <SidebarNav user={user} />
          <div className="mt-auto pt-3 border-t border-[#332d20] flex flex-col items-center text-center">
            <span className="text-[9px] text-[#786c52] font-semibold tracking-widest uppercase">Vendetta 2006</span>
            <span className="text-[8px] text-[#554d3a] mt-0.5">Servidor Latino v1.4</span>
          </div>
        </aside>

        {/* Área central de juego */}
        <main className="flex-1 min-w-0 bg-[radial-gradient(circle_at_50%_10%,#161410_0%,#080808_80%)] lg:overflow-y-auto">
          <div className="w-full max-w-[440px] md:max-w-[900px] mx-auto px-2 md:px-6 py-3 md:py-4 space-y-2.5">
            {children}
          </div>
        </main>
      </div>

      {/* Drawer de navegación móvil */}
      <MobileNavDrawer user={user} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}