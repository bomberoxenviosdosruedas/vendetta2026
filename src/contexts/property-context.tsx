
'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FullPropiedad } from '@/lib/data';

interface PropertyContextType {
  properties: FullPropiedad[];
  selectedProperty: FullPropiedad | null;
  setSelectedPropertyById: (id: string) => void;
  setSelectedProperty: React.Dispatch<React.SetStateAction<FullPropiedad | null>>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);


// This new component contains the logic that uses the navigation hooks.
function PropertyEffects() {
    const { properties, selectedProperty, setSelectedProperty } = useProperty();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const propertyId = searchParams.get('propertyId');
        if (propertyId && propertyId !== selectedProperty?.id) {
            const propertyToSelect = properties.find(p => p.id === propertyId) || null;
            setSelectedProperty(propertyToSelect);
        } else if (!propertyId && properties.length > 0 && selectedProperty?.id !== properties[0].id) {
            // Default to first property if no ID in URL
            setSelectedProperty(properties[0]);
        }
    }, [searchParams, properties, selectedProperty?.id, setSelectedProperty]);

    return null; // This component doesn't render anything
}


function PropertyProviderClient({ children, initialProperties }: { children: ReactNode, initialProperties: FullPropiedad[] }) {
  const searchParams = useSearchParams();
  const [properties] = useState<FullPropiedad[]>(initialProperties);
  
  const [selectedProperty, setSelectedProperty] = useState<FullPropiedad | null>(() => {
    const propertyId = searchParams.get('propertyId');
    return properties.find(p => p.id === propertyId) || (properties.length > 0 ? properties[0] : null);
  });
  
  const router = useRouter();
  const pathname = usePathname();

  const setSelectedPropertyById = (id: string) => {
    const property = properties.find(p => p.id === id);
    if (property) {
        setSelectedProperty(property);
        const params = new URLSearchParams(searchParams);
        params.set('propertyId', id);
        router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const value = useMemo(() => ({
    properties,
    selectedProperty,
    setSelectedPropertyById,
    setSelectedProperty,
  }), [properties, selectedProperty]);

  return (
    <PropertyContext.Provider value={value}>
      {children}
      {/* PropertyEffects is now a child of the provider, ensuring context is available */}
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
