"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Home, DoorOpen, Users, Crosshair, Briefcase, BrainCircuit, Activity } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const mainNav: NavItem[] = [
  { href: "/overview", label: "Visión General", icon: <Home /> },
  { href: "/rooms", label: "Habitaciones", icon: <DoorOpen /> },
  { href: "/recruitment", label: "Reclutamiento", icon: <Users /> },
]

const secondaryNav: NavItem[] = [
    { href: "/targets", label: "Objetivos", icon: <Crosshair /> },
    { href: "/operations", label: "Operaciones", icon: <Briefcase /> },
    { href: "/intel", label: "Inteligencia", icon: <BrainCircuit /> },
    { href: "/status", label: "Estado", icon: <Activity /> },
]

export function SidebarNav() {
  const pathname = usePathname()

  const renderNav = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            as={Link}
            href={item.href}
            isActive={pathname.startsWith(item.href)}
            tooltip={item.label}
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

      <SidebarGroup>
        <SidebarGroupLabel>Inteligencia</SidebarGroupLabel>
        {renderNav(secondaryNav)}
      </SidebarGroup>
    </>
  )
}
