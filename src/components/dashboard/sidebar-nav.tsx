
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar"
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
    Trophy 
} from "lucide-react"
import { PropertySelector } from "./property-selector"
import type { UserWithProgress } from "@/lib/data"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarNavProps {
    user: UserWithProgress | null;
}

const mainNav: NavItem[] = [
  { href: "/overview", label: "Visión General", icon: <Home /> },
  { href: "/rooms", label: "Habitaciones", icon: <DoorOpen /> },
  { href: "/recruitment", label: "Reclutamiento", icon: <Users /> },
  { href: "/security", label: "Seguridad", icon: <Shield /> },
  { href: "/training", label: "Entrenamiento", icon: <Target /> },
  { href: "/search", label: "Buscar", icon: <Search /> },
]

const secondaryNav: NavItem[] = [
    { href: "/technologies", label: "Tecnologías", icon: <FlaskConical /> },
    { href: "/family", label: "Familia", icon: <Users2 /> },
    { href: "/resources", label: "Recursos", icon: <Package /> },
    { href: "/map", label: "Mapa", icon: <Map /> },
    { href: "/missions", label: "Misiones", icon: <ClipboardList /> },
    { href: "/simulator", label: "Simulador", icon: <Calculator /> },
    { href: "/farms", label: "Lista de granjas", icon: <List /> },
]

const tertiaryNav: NavItem[] = [
    { href: "/messages", label: "Mensajes", icon: <Mail /> },
    { href: "/statistics", label: "Estadísticas", icon: <BarChart /> },
    { href: "/rankings", label: "Clasificaciones", icon: <Trophy /> },
]

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleClick = () => {
    if (isMobile) {
        setOpenMobile(false)
    }
  }

  const renderNav = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            as={Link}
            href={item.href}
            isActive={pathname === item.href}
            tooltip={item.label}
            onClick={handleClick}
          >
            {item.icon}
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )

  return (
    <>
      <SidebarGroup>
        {renderNav(mainNav)}
      </SidebarGroup>
      
      {user && <PropertySelector properties={user.propiedades} />}

      <SidebarGroup>
        {renderNav(secondaryNav)}
      </SidebarGroup>
      
      <SidebarGroup>
        {renderNav(tertiaryNav)}
      </SidebarGroup>
    </>
  )
}
