
'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { FullPropiedad } from '@/lib/data';

interface PropertyContextType {
  properties: FullPropiedad[];
  selectedProperty: FullPropiedad | null;
  setSelectedPropertyById: (id: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children, initialProperties }: { children: ReactNode, initialProperties: FullPropiedad[] }) {
  const searchParams = useSearchParams();
  const [properties] = useState<FullPropiedad[]>(initialProperties);
  const [selectedProperty, setSelectedProperty] = useState<FullPropiedad | null>(() => {
    const propertyId = searchParams.get('propertyId');
    return properties.find(p => p.id === propertyId) || (properties.length > 0 ? properties[0] : null);
  });

  useEffect(() => {
    const propertyId = searchParams.get('propertyId');
    const propertyToSelect = 
      properties.find(p => p.id === propertyId) || 
      (properties.length > 0 ? properties[0] : null);

    if (propertyToSelect?.id !== selectedProperty?.id) {
        setSelectedProperty(propertyToSelect);
    }
  }, [searchParams, properties, selectedProperty]);

  const setSelectedPropertyById = (id: string) => {
    const property = properties.find(p => p.id === id);
    if (property) {
      setSelectedProperty(property);
    }
  };

  const value = useMemo(() => ({
    properties,
    selectedProperty,
    setSelectedPropertyById
  }), [properties, selectedProperty]);

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}
