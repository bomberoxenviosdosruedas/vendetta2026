"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  DoorOpen,
  Users,
  Shield,
  Target,
  Search,
  FlaskConical,
  Users2,
  Package,
  Map,
  ClipboardList,
  Calculator,
  List,
  Mail,
  BarChart,
  Trophy,
  Settings,
  ChevronDown,
} from "lucide-react";
import { PropertySelector } from "./property-selector";
import type { UserWithProgress } from "@/lib/data";
import { useProperty } from "@/contexts/property-context";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

interface SidebarNavProps {
  user: UserWithProgress | null;
}

const navSections: NavSection[] = [
  {
    id: "operaciones",
    label: "OPERACIONES",
    icon: <Target className="h-3.5 w-3.5" />,
    items: [
      { href: "/overview", label: "Visión General", icon: <Home /> },
      { href: "/rooms", label: "Habitaciones", icon: <DoorOpen /> },
      { href: "/recruitment", label: "Reclutamiento", icon: <Users /> },
      { href: "/missions", label: "Misiones", icon: <ClipboardList /> },
      { href: "/map", label: "Mapa", icon: <Map /> },
      { href: "/security", label: "Seguridad", icon: <Shield /> },
    ],
  },
  {
    id: "imperio",
    label: "IMPERIO",
    icon: <Package className="h-3.5 w-3.5" />,
    items: [
      { href: "/training", label: "Entrenamiento", icon: <Target /> },
      { href: "/technologies", label: "Tecnologías", icon: <FlaskConical /> },
      { href: "/resources", label: "Recursos", icon: <Package /> },
      { href: "/family", label: "Familia", icon: <Users2 /> },
      { href: "/simulator", label: "Simulador", icon: <Calculator /> },
      { href: "/farms", label: "Lista de granjas", icon: <List /> },
    ],
  },
  {
    id: "social",
    label: "SOCIAL",
    icon: <Users2 className="h-3.5 w-3.5" />,
    items: [
      { href: "/messages", label: "Mensajes", icon: <Mail /> },
      { href: "/rankings", label: "Clasificaciones", icon: <Trophy /> },
      { href: "/statistics", label: "Estadísticas", icon: <BarChart /> },
      { href: "/settings", label: "Ajustes", icon: <Settings /> },
      { href: "/search", label: "Buscar", icon: <Search /> },
    ],
  },
];

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedProperty } = useProperty();
  const { setOpenMobile, isMobile } = useSidebar();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(["operaciones"]);

  const handleNavigate = (href: string) => {
    router.push(href);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
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

  const renderSection = (section: NavSection) => {
    const isExpanded = expandedSections.includes(section.id);
    const hasActiveItem = section.items.some(item => pathname.startsWith(item.href));

    return (
      <SidebarGroup key={section.id} className="w-full">
        {/* Section header with chevron */}
        <button
          type="button"
          onClick={() => toggleSection(section.id)}
          className={cn(
            "w-full flex items-center justify-between gap-2 px-2 py-2",
            "text-[10px] font-mono font-semibold tracking-wider uppercase",
            "text-muted-foreground hover:text-foreground transition-colors",
            "rounded-md hover:bg-sidebar-accent"
          )}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground/60">{section.icon}</span>
            {section.label}
            {hasActiveItem && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono bg-primary/20 text-primary rounded">
                ACTIVO
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground/60 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        {/* Collapsible menu items */}
        <SidebarMenuSub className={cn("overflow-hidden transition-all duration-200", isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
          <SidebarMenu>
            {section.items.map((item) => {
              const finalHref = buildHref(item);
              const isActive = pathname.startsWith(item.href);

              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive}
                    tooltip={isMobile ? undefined : item.label}
                    onClick={() => handleNavigate(finalHref)}
                    size="default"
                    className="w-full flex items-center gap-2 px-4"
                  >
                    <Link href={finalHref} className="w-full flex items-center gap-2">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenu>
        </SidebarMenuSub>
      </SidebarGroup>
    );
  };

  return (
    <>
      {navSections.map(renderSection)}

      {user && user.propiedades.length > 0 && (
        <SidebarGroup className="pt-2">
          <PropertySelector properties={user.propiedades} />
        </SidebarGroup>
      )}
    </>
  );
}