"use client"

import { useState } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Overview } from "@/components/dashboard/overview"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("overview")

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <Overview />
      default:
        return (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                    {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h3>
                <p className="text-sm text-muted-foreground">
                    Contenido para esta sección aún no implementado.
                </p>
              </div>
            </div>
        );
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <h2 className="p-2 text-lg font-semibold tracking-tight text-primary">Vendetta</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav activeView={activeView} setActiveView={setActiveView} />
        </SidebarContent>
        <Separator />
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt="@boss" data-ai-hint="mafia boss" />
              <AvatarFallback>BO</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
                <span className="font-semibold">El Padrino</span>
                <span className="text-xs text-muted-foreground">Jefe</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
                <LogOut />
                <span className="sr-only">Cerrar Sesión</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <div className="flex items-center justify-between border-b p-2 md:p-1 md:pl-3">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <DashboardHeader />
          <main className="p-4 md:p-6">
            {renderContent()}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
