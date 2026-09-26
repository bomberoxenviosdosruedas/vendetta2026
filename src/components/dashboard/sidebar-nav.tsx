"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import MaterialIcon from "@/components/ui/material-icon";
import type { UserWithProgress } from "@/lib/data";
import { useProperty } from "@/contexts/property-context";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  iconName: string;
  badge?: number | string;
  badgeClass?: string;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

interface SidebarNavProps {
  user: UserWithProgress | null;
  /** Selector de base actual; se renderiza entre las secciones Principal y TÃ¡ctico & Familia. */
  propertySelector?: React.ReactNode;
}

const navSections: NavSection[] = [
  {
    id: "principal",
    label: "PRINCIPAL",
    items: [
      { href: "/overview", label: "VisiÃ³n General", iconName: "home" },
      { href: "/rooms", label: "Habitaciones", iconName: "meeting_room" },
      { href: "/recruitment", label: "Reclutamiento", iconName: "groups" },
      { href: "/security", label: "Seguridad", iconName: "shield" },
      { href: "/training", label: "Entrenamiento", iconName: "fitness_center" },
      { href: "/search", label: "Buscar", iconName: "search" },
    ],
  },
  {
    id: "tactico",
    label: "TÃCTICO & FAMILIA",
    items: [
      { href: "/technologies", label: "TecnologÃ­as", iconName: "psychology" },
      { href: "/family", label: "Familia", iconName: "shield" },
      { href: "/resources", label: "Recursos", iconName: "inventory_2" },
      { href: "/map", label: "Mapa", iconName: "public" },
      { href: "/missions", label: "Misiones", iconName: "radar" },
      { href: "/simulator", label: "Simulador", iconName: "calculate" },
      { href: "/messages", label: "Mensajes", iconName: "mail" },
      { href: "/statistics", label: "EstadÃ­sticas", iconName: "analytics" },
      { href: "/rankings", label: "Clasificaciones", iconName: "leaderboard" },
    ],
  },
  {
    id: "comunidad",
    label: "COMUNIDAD",
    items: [
      { href: "/settings", label: "Opciones", iconName: "settings" },
    ],
  },
];

export function SidebarNav({ user, propertySelector }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedProperty } = useProperty();
  const router = useRouter();

  const unreadMessages = user?._count?.receivedMessages || 0;
  const propertyCount = user?.propiedades.length ?? 0;
  const roomsBuilt = user?.propiedades.reduce((sum, p) => sum + p.habitaciones.length, 0) ?? 0;
  const roomsTotal = propertyCount * 5;
  const activeRecruitments = user?.propiedades.filter(p => p.colaReclutamiento).length ?? 0;
  const activeMissions = user?.misiones.length ?? 0;

  const handleNavigate = (href: string) => {
    router.push(href);
  };

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

  const resolveBadge = (item: NavItem): NavItem["badge"] => {
    switch (item.href) {
      case "/rooms":
        return `${roomsBuilt}/${roomsTotal}`;
      case "/recruitment":
        return `${activeRecruitments}/${propertyCount}`;
      case "/missions":
        return activeMissions;
      case "/messages":
        return unreadMessages;
      default:
        return item.badge;
    }
  };

  const resolveBadgeClass = (item: NavItem): string | undefined => {
    switch (item.href) {
      case "/missions":
        return "bg-[#003800] border border-[#5fe06e] text-[#5fe06e]";
      case "/messages":
        return "bg-[#a02020] text-white";
      default:
        return item.badgeClass;
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full text-[13px]">
      {navSections.map((section) => (
        <Fragment key={section.id}>
        <div className="w-full p-0">
          <div className="bronze-th text-white font-['Chivo'] text-[12px] font-bold uppercase px-2.5 py-[6px] tracking-wider shadow-sm mb-[2px]">
            {section.label}
          </div>
          <div className="flex flex-col gap-[2px]">
            {section.items.map((item) => {
              const finalHref = buildHref(item);
              const isActive = pathname.startsWith(item.href);
              const badge = resolveBadge(item);
              const badgeClass = resolveBadgeClass(item);

              return (
                <Link
                  key={item.href}
                  href={finalHref}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate(finalHref);
                  }}
                  className={cn(
                    "w-full px-2.5 py-1 flex items-center justify-between gap-1 text-[13px] font-medium transition-colors min-h-[30px] border border-[#1a1712]",
                    isActive
                      ? "bg-[#ebe5d3] text-[#8b1a10] font-bold border-l-2 border-l-[#8b1a10]"
                      : "bg-[#dfdbc9] text-[#111111] hover:bg-[#efeadd] hover:text-[#8b0000]"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <MaterialIcon
                      name={item.iconName}
                      size={16}
                      className={isActive ? "text-[#8b1a10]" : "text-[#6b5c40]"}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {badge !== undefined && badge !== null && badge !== 0 && badge !== "" ? (
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-['JetBrains_Mono'] font-bold px-1.5",
                        badgeClass ?? "bg-[#d8d2bf] text-[#554b3c] border border-[#b3aa92]"
                      )}
                    >
                      {badge}
                    </span>
                  ) : isActive ? (
                    <span className="w-2 h-2 bg-[#a02020] shrink-0" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
        {section.id === "principal" && propertySelector}
        </Fragment>
      ))}
    </div>
  );
}