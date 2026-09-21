
"use client"

import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut, Swords } from "lucide-react"
import type { UserWithProgress } from "@/lib/data"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function DashboardClientLayout({
    user,
    children,
  }: {
    user: UserWithProgress | null;
    children: React.ReactNode
  }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <Link href="/overview" className="flex items-center gap-2 p-2">
            <Swords className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Vendetta</h2>
           </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav user={user} />
        </SidebarContent>
        <Separator />
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl || "https://placehold.co/40x40.png"} alt={user?.name || "Boss"} data-ai-hint="mafia boss" />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'V'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
                <span className="font-semibold">{user?.name || "El Padrino"}</span>
                <span className="text-xs text-muted-foreground">{user?.title || "Jefe"}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                <LogOut />
                <span className="sr-only">Cerrar Sesión</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        {/* Main Header - h-14 matches ResourceBar height */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-3 md:px-6 backdrop-blur-sm">
            {/* Mobile brand + sidebar trigger */}
            <div className="flex items-center gap-2 md:hidden min-w-0">
                <Swords className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold text-lg truncate">Vendetta</span>
            </div>
             <div className="flex-1" />
            <SidebarTrigger className="md:hidden min-h-[44px] min-w-[44px]" />
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
