
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MaterialIcon } from '@/components/ui/material-icon'
import type { FullPropiedad } from '@/lib/data'
import { useProperty } from '@/contexts/property-context'

interface PropertySelectorProps {
  properties: FullPropiedad[]
}

export function PropertySelector({ properties }: PropertySelectorProps) {
  const { selectedProperty, setSelectedPropertyById } = useProperty();

  if (!properties || properties.length <= 1) {
    return null
  }

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-10 min-h-[44px] text-sm sm:text-base"
          >
            <div className="flex items-center gap-2 truncate">
              <MaterialIcon name="domain" size={20} />
              <span className="truncate">{selectedProperty?.nombre || 'Seleccionar...'}</span>
            </div>
            <MaterialIcon name="unfold_more" size={18} className="ml-2 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full max-w-[320px] -translate-x-2">
          <DropdownMenuLabel className="text-sm sm:text-base">Tus Propiedades</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {properties.map((property) => (
            <DropdownMenuItem
              key={property.id}
              onSelect={() => setSelectedPropertyById(property.id)}
              className="min-h-[44px] flex items-center gap-2 px-2 py-2 text-sm sm:text-base"
            >
              <MaterialIcon
                name="check"
                size={18}
                className={`mr-2 shrink-0 ${
                  selectedProperty?.id === property.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span className="truncate">{property.nombre} [{property.ciudad}:{property.barrio}:{property.edificio}]</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
