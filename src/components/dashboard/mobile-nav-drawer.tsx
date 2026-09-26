'use client';

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import MaterialIcon from "@/components/ui/material-icon";
import type { UserWithProgress } from "@/lib/data";
import { useProperty } from "@/contexts/property-context";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  badge?: string | number;
  badgeClass?: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

interface MobileNavDrawerProps {
  user: UserWithProgress | null;
  open: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ user, open, onClose }: MobileNavDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { properties, selectedProperty, setSelectedPropertyById } = useProperty();

  // Bloquear scroll del body mientras el drawer estÃƒÂ¡ abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/");
    router.refresh();
  };

  const unreadMessages = user?._count?.receivedMessages || 0;
  const propertyCount = user?.propiedades.length ?? 0;
  const roomsBuilt = user?.propiedades.reduce((sum, p) => sum + p.habitaciones.length, 0) ?? 0;
  const roomsTotal = propertyCount * 5;
  const activeRecruitments = user?.propiedades.filter(p => p.colaReclutamiento).length ?? 0;
  const activeMissions = user?.misiones.length ?? 0;

  const groups: NavGroup[] = [
    {
      id: "operaciones",
      label: "Operaciones",
      items: [
        { href: "/overview", label: "VisiÃƒÂ³n General" },
        { href: "/rooms", label: "Habitaciones", badge: `${roomsBuilt}/${roomsTotal}` },
        { href: "/recruitment", label: "Reclutamiento", badge: `${activeRecruitments}/${propertyCount}` },
        { href: "/security", label: "Seguridad" },
        { href: "/training", label: "Entrenamiento" },
        { href: "/search", label: "Buscar Coordenadas" },
      ],
    },
    {
      id: "imperio",
      label: "Imperio & Alianzas",
      items: [
        { href: "/technologies", label: "TecnologÃƒÂ­as" },
        { href: "/family", label: "Familia" },
        { href: "/resources", label: "Recursos & Finanzas" },
        { href: "/map", label: "Mapa del Distrito" },
        {
          href: "/missions",
          label: "Misiones Activas",
          badge: activeMissions,
          badgeClass: "bg-[#0c7017] text-[#5fe06e] border border-[#5fe06e]",
        },
        { href: "/simulator", label: "Simulador de Combate" },
      ],
    },
    {
      id: "comunicaciones",
      label: "Comunicaciones & Ajustes",
      items: [
        {
          href: "/messages",
          label: "Mensajes",
          badge: unreadMessages,
          badgeClass: "bg-[#6d1414] text-white border border-[#a02020]",
        },
        { href: "/statistics", label: "EstadÃƒÂ­sticas" },
        { href: "/rankings", label: "Clasificaciones" },
        { href: "/settings", label: "Opciones" },
      ],
    },
  ];

  const buildHref = (item: NavItem) => {
    const params = new URLSearchParams(searchParams);
    if (selectedProperty?.id) {
      params.set("propertyId", selectedProperty.id);
    } else {
      params.delete("propertyId");
    }
    if (item.href === "/rooms" && selectedProperty) {
      return `/rooms/${selectedProperty.ciudad}:${selectedProperty.barrio}:${selectedProperty.edificio}?${params.toString()}`;
    }
    return `${item.href}?${params.toString()}`;
  };

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const currentIndex = properties.findIndex(p => p.id === selectedProperty?.id);
  const prevProperty = properties[(currentIndex - 1 + properties.length) % properties.length];
  const nextProperty = properties[(currentIndex + 1) % properties.length];

  const cycleProperty = (direction: 1 | -1) => {
    const target = direction === 1 ? nextProperty : prevProperty;
    if (target) setSelectedPropertyById(target.id);
  };

  const coords = selectedProperty
    ? `${selectedProperty.ciudad}:${selectedProperty.barrio}:${selectedProperty.edificio}`
    : "-:-:-";

  return (
    <>
      {/* Overlay para cerrar el menÃƒÂº */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/75 backdrop-blur-[1px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer off-canvas */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[275px] bg-[#dfdbc9] border-r-2 border-[#54432a] shadow-2xl overflow-y-auto flex flex-col justify-between transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="MenÃƒÂº principal"
      >
        <div>
          {/* Cabecera del Drawer */}
          <div className="v-header-c flex items-center justify-between !py-2 !px-2.5">
            <div className="flex items-center gap-2">
              <MaterialIcon name="gavel" size={14} className="text-[#e2ca92]" />
              <span className="text-[#e2ca92] font-bold text-xs tracking-wider">MENÃƒÅ¡ PRINCIPAL</span>
            </div>
            <button
              type="button"
              className="retro-btn px-2 py-0.5 text-black font-bold flex items-center justify-center"
              onClick={onClose}
              aria-label="Cerrar menÃƒÂº"
            >
              <MaterialIcon name="close" size={14} />
            </button>
          </div>

          {/* Selector de Base MÃƒÂ³vil */}
          <div className="p-2 bg-[#d2cca9] border-b border-[#a89f88]">
            <div className="text-[10px] text-[#5c523f] uppercase font-bold text-center mb-1">
              Base Actual Seleccionada:
            </div>
            <div className="flex items-center justify-between bg-[#f1ebda] border border-[#7d725b] px-2 py-1 shadow-inner gap-1">
              {properties.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="retro-btn px-2 py-0.5 text-[10px] flex items-center justify-center"
                    onClick={() => cycleProperty(-1)}
                    aria-label="Base anterior"
                  >
                    <MaterialIcon name="expand_less" size={14} />
                  </button>
                  <span className="text-[#872000] font-bold text-[12px] font-mono text-center truncate flex-1">
                    {coords}
                  </span>
                  <button
                    type="button"
                    className="retro-btn px-2 py-0.5 text-[10px] flex items-center justify-center"
                    onClick={() => cycleProperty(1)}
                    aria-label="Base siguiente"
                  >
                    <MaterialIcon name="expand_more" size={14} />
                  </button>
                </>
              ) : (
                <span className="text-[#872000] font-bold text-[12px] font-mono text-center w-full">{coords}</span>
              )}
            </div>
          </div>

          {/* Enlaces del menÃƒÂº clÃƒÂ¡sico */}
          <nav className="p-2 space-y-[3px]">
            {groups.map(group => (
              <div key={group.id}>
                <div className="text-[9px] uppercase tracking-wider font-bold text-[#4a4031] px-1 pt-1 pb-0.5">
                  {group.label}
                </div>
                {group.items.map(item => {
                  const href = buildHref(item);
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate(href);
                      }}
                      className={cn(
                        "block py-1.5 px-2.5 retro-btn text-[11px] flex justify-between items-center gap-1",
                        isActive && "!bg-[#efeadd] !border-[#8b1a10] !text-[#8b0000]"
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge !== null && item.badge !== 0 ? (
                        item.badgeClass ? (
                          <span className={cn("text-[9px] px-1.5 font-bold font-mono shrink-0", item.badgeClass)}>
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-[#615135] text-[#ffe6a3] px-1 rounded font-mono shrink-0">
                            {item.badge}
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-[#70644e] shrink-0">Ã¢â€“Âº</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-1.5 text-center font-bold text-[11px] text-white bg-[#8b1a10] border border-[#4d0c07] shadow-sm rounded-sm mt-2"
            >
              Cerrar SesiÃƒÂ³n (Logout)
            </button>
          </nav>
        </div>

        {/* Footer del drawer */}
        <div className="p-2.5 text-center border-t border-[#9c927c] bg-[#cec7b2]">
          <div className="text-[10px] font-bold text-[#443725]">VENDETTA 2006 RETRO MOBILE</div>
          <div className="text-[9px] text-[#4a4031]">Servidor Latino v1.4</div>
        </div>
      </aside>
    </>
  );
}