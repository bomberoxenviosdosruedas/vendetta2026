"use client"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Home, DoorOpen, Users, Crosshair, Briefcase, BrainCircuit, Activity } from "lucide-react"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

const mainNav: NavItem[] = [
  { id: "overview", label: "Visión General", icon: <Home /> },
  { id: "rooms", label: "Habitaciones", icon: <DoorOpen /> },
  { id: "recruitment", label: "Reclutamiento", icon: <Users /> },
]

const secondaryNav: NavItem[] = [
    { id: "targets", label: "Objetivos", icon: <Crosshair /> },
    { id: "operations", label: "Operaciones", icon: <Briefcase /> },
    { id: "intel", label: "Inteligencia", icon: <BrainCircuit /> },
    { id: "status", label: "Estado", icon: <Activity /> },
]

interface SidebarNavProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function SidebarNav({ activeView, setActiveView }: SidebarNavProps) {
  const handleNavClick = (view: string) => (e: React.MouseEvent) => {
    setActiveView(view);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                onClick={handleNavClick(item.id)}
                isActive={activeView === item.id}
                tooltip={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Inteligencia</SidebarGroupLabel>
        <SidebarMenu>
          {secondaryNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                onClick={handleNavClick(item.id)}
                isActive={activeView === item.id}
                tooltip={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
