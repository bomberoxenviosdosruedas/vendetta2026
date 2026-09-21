"use client";

import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut, Swords, Building2, ChevronDown } from "lucide-react";
import type { UserWithProgress, FullPropiedad } from "@/lib/data";
import { logout } from "@/lib/auth";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useProperty } from "@/contexts/property-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PropertySelectorHeaderProps {
  properties: FullPropiedad[];
  selectedProperty: FullPropiedad | null;
  onSelectProperty: (id: string) => void;
}

function PropertySelectorHeader({ properties, selectedProperty, onSelectProperty }: PropertySelectorHeaderProps) {
  if (properties.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 h-10 px-3 min-h-[44px] min-w-[44px]",
            "bg-background/80 backdrop-blur-sm border-border/40",
            "hover:bg-white/5 text-sm font-medium"
          )}
        >
          <Building2 className="h-4 w-4 text-primary" />
          <span className="truncate max-w-[160px] hidden sm:inline">{selectedProperty?.nombre || "Seleccionar propiedad"}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 min-w-[280px] -translate-x-2" align="end">
        <div className="px-2 py-1 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Tus Propiedades
        </div>
        {properties.map((property) => (
          <DropdownMenuItem
            key={property.id}
            onSelect={() => onSelectProperty(property.id)}
            className={cn(
              "flex items-center gap-2 px-2 py-2 text-sm",
              "min-h-[44px] hover:bg-sidebar-accent",
              selectedProperty?.id === property.id && "bg-primary/10 text-primary"
            )}
          >
            <Building2 className={cn("h-4 w-4 flex-shrink-0", selectedProperty?.id === property.id && "text-primary")} />
            <span className="truncate flex-1">{property.nombre}</span>
            <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
              [{property.ciudad}:{property.barrio}:{property.edificio}]
            </span>
            {selectedProperty?.id === property.id && (
              <span className="text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardClientLayout({
  user,
  children,
}: {
  user: UserWithProgress | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedProperty, setSelectedPropertyById } = useProperty();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

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
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "V"}</AvatarFallback>
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
        {/* Main Header - matches ResourceBar height */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-3 md:px-6 backdrop-blur-sm">
          {/* Mobile brand + sidebar trigger */}
          <div className="flex items-center gap-2 md:hidden min-w-0">
            <Swords className="h-6 w-6 text-primary flex-shrink-0" />
            <span className="font-semibold text-lg truncate">Vendetta</span>
          </div>

          {/* Desktop property selector */}
          <div className="hidden md:flex items-center gap-3 flex-1">
            <PropertySelectorHeader
              properties={user?.propiedades || []}
              selectedProperty={selectedProperty}
              onSelectProperty={setSelectedPropertyById}
            />
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
  );
}