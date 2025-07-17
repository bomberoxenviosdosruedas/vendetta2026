'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FullPropiedad } from '@/lib/data';

interface PropertyContextType {
  properties: FullPropiedad[];
  selectedProperty: FullPropiedad | null;
  setSelectedPropertyById: (id: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

function PropertyProviderClient({ children, initialProperties }: { children: ReactNode, initialProperties: FullPropiedad[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [properties] = useState<FullPropiedad[]>(initialProperties);
  
  const [selectedProperty, setSelectedProperty] = useState<FullPropiedad | null>(() => {
    const propertyId = searchParams.get('propertyId');
    return properties.find(p => p.id === propertyId) || (properties.length > 0 ? properties[0] : null);
  });
  
  const setSelectedPropertyById = (id: string) => {
    const property = properties.find(p => p.id === id);
    if (property) {
        setSelectedProperty(property);
        const params = new URLSearchParams(searchParams);
        params.set('propertyId', id);
        router.replace(`${pathname}?${params.toString()}`);
    }
  };

  useEffect(() => {
    const propertyId = searchParams.get('propertyId');
    const propertyToSelect = 
      properties.find(p => p.id === propertyId) || 
      (properties.length > 0 ? properties[0] : null);

    if (propertyToSelect?.id !== selectedProperty?.id) {
        setSelectedProperty(propertyToSelect);
    }
  }, [searchParams, properties, selectedProperty?.id]);


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

export function PropertyProvider({ children, initialProperties }: { children: ReactNode, initialProperties: FullPropiedad[] }) {
    return (
        <Suspense fallback={<div>Loading properties...</div>}>
            <PropertyProviderClient initialProperties={initialProperties}>
                {children}
            </PropertyProviderClient>
        </Suspense>
    )
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}