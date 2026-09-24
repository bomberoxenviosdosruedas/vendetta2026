'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MaterialIcon from '@/components/ui/material-icon';
import type { FullPropiedad } from '@/lib/data';
import { useProperty } from '@/contexts/property-context';

interface PropertySelectorProps {
  properties: FullPropiedad[];
}

export function PropertySelector({ properties }: PropertySelectorProps) {
  const { selectedProperty, setSelectedPropertyById } = useProperty();

  if (!properties || properties.length <= 1) {
    return null;
  }

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            role="combobox"
            className="retro-btn w-full justify-between h-9 min-h-[44px] text-xs font-bold"
          >
            <div className="flex items-center gap-2 truncate">
              <MaterialIcon name="domain" size={18} />
              <span className="truncate">{selectedProperty?.nombre || 'Seleccionar...'}</span>
            </div>
            <MaterialIcon name="unfold_more" size={16} className="ml-1 shrink-0 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full max-w-[280px] bg-[#1a1711] border-[#4a3e2b] text-[#dfdbc9]">
          <DropdownMenuLabel className="text-xs font-['Chivo'] text-[#ffe569] uppercase font-bold">
            Tus Propiedades
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#4a3e2b]" />
          {properties.map((property) => (
            <DropdownMenuItem
              key={property.id}
              onSelect={() => setSelectedPropertyById(property.id)}
              className="min-h-[44px] flex items-center gap-2 px-2 py-2 text-xs font-['JetBrains_Mono'] hover:bg-[#252017] cursor-pointer"
            >
              <MaterialIcon
                name="check"
                size={16}
                className={`mr-1 shrink-0 text-[#ffe569] ${
                  selectedProperty?.id === property.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span className="truncate">{property.nombre} [{property.ciudad}:{property.barrio}:{property.edificio}]</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
