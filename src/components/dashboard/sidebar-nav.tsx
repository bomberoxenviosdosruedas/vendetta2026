"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  SidebarMenu,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import MaterialIcon from "@/components/ui/material-icon";
import { PropertySelector } from "./property-selector";
import type { UserWithProgress } from "@/lib/data";
import { useProperty } from "@/contexts/property-context";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  iconName: string;
  badge?: number | string;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

interface SidebarNavProps {
  user: UserWithProgress | null;
}

const navSections: NavSection[] = [
  {
    id: "principal",
    label: "PRINCIPAL",
    items: [
      { href: "/overview", label: "Visión General", iconName: "home" },
      { href: "/rooms", label: "Habitaciones", iconName: "meeting_room" },
      { href: "/recruitment", label: "Reclutamiento", iconName: "groups" },
      { href: "/security", label: "Seguridad", iconName: "shield" },
      { href: "/training", label: "Entrenamiento", iconName: "fitness_center" },
      { href: "/search", label: "Buscar", iconName: "search" },
    ],
  },
  {
    id: "tactico",
    label: "TÁCTICO & FAMILIA",
    items: [
      { href: "/technologies", label: "Tecnologías", iconName: "psychology" },
      { href: "/family", label: "Familia", iconName: "shield" },
      { href: "/resources", label: "Recursos", iconName: "inventory_2" },
      { href: "/map", label: "Mapa", iconName: "public" },
      { href: "/missions", label: "Misiones", iconName: "radar" },
      { href: "/simulator", label: "Simulador", iconName: "calculate" },
      { href: "/farms", label: "Lista de Granjas", iconName: "list_alt" },
      { href: "/messages", label: "Mensajes", iconName: "mail", badge: 4 },
      { href: "/statistics", label: "Estadísticas", iconName: "analytics" },
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

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedProperty } = useProperty();
  const { setOpenMobile, isMobile } = useSidebar();
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
    if (isMobile) {
      setOpenMobile(false);
    }
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

  return (
    <div className="flex flex-col gap-1 w-full text-[11px]">
      {navSections.map((section) => (
        <SidebarGroup key={section.id} className="w-full p-0">
          <div className="crimson-th text-white font-['Space_Grotesk'] text-[10px] font-bold uppercase px-2 py-0.5 tracking-wider shadow-sm mb-0.5">
            {section.label}
          </div>
          <SidebarMenu className="gap-[2px]">
            {section.items.map((item) => {
              const finalHref = buildHref(item);
              const isActive = pathname.startsWith(item.href);

              return (
                <SidebarMenuSubItem key={item.href} className="m-0 p-0">
                  <Link
                    href={finalHref}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate(finalHref);
                    }}
                    className={cn(
                      "w-full px-2 py-1 flex items-center justify-between text-[11px] font-medium transition-colors min-h-[36px] sm:min-h-[28px]",
                      isActive
                        ? "bg-[#6C0000] text-[#ffffff] font-bold border-l-2 border-[#fff400]"
                        : "cell-dark text-[#dfdbc9] hover:bg-[#1f1f1f] hover:text-[#fff400]"
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <MaterialIcon
                        name={item.iconName}
                        size={14}
                        className={isActive ? "text-[#fff400]" : "text-[#888888]"}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="bg-[#ff0000] text-white text-[9px] font-bold px-1 rounded-sm font-['Space_Mono']">
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fff400] shrink-0" />
                    ) : null}
                  </Link>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}

      {user && user.propiedades.length > 0 && (
        <SidebarGroup className="pt-2 px-1">
          <PropertySelector properties={user.propiedades} />
        </SidebarGroup>
      )}
    </div>
  );
}
