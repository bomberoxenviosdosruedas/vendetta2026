'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FullPropiedad } from '@/lib/data';

interface PropertyContextType {
  properties: FullPropiedad[];
  selectedProperty: FullPropiedad | null;
  setSelectedPropertyById: (id: string) => void;
  setSelectedProperty: React.Dispatch<React.SetStateAction<FullPropiedad | null>>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Internal component that handles URL sync - only renders after hydration
function PropertyUrlSync() {
    const { properties, selectedProperty, setSelectedProperty } = useProperty();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // This runs only on client after hydration
        const propertyId = searchParams.get('propertyId');
        if (propertyId && propertyId !== selectedProperty?.id) {
            const propertyToSelect = properties.find(p => p.id === propertyId) || null;
            setSelectedProperty(propertyToSelect);
        } else if (!propertyId && properties.length > 0 && selectedProperty?.id !== properties[0].id) {
            // Default to first property if no ID in URL
            setSelectedProperty(properties[0]);
        }
    }, [searchParams, properties, selectedProperty?.id, setSelectedProperty]);

    return null;
}

function PropertyProviderClient({ children, initialProperties }: { children: ReactNode, initialProperties: FullPropiedad[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    
    // Initialize properties from props (server-provided)
    const [properties] = useState<FullPropiedad[]>(initialProperties);
    
    // Initialize selected property from URL or fallback to first
    const [selectedProperty, setSelectedProperty] = useState<FullPropiedad | null>(() => {
        // During SSR/hydration, searchParams might not be ready
        // We'll sync properly in the useEffect below
        if (searchParams) {
            const propertyId = searchParams.get('propertyId');
            return properties.find(p => p.id === propertyId) || (properties.length > 0 ? properties[0] : null);
        }
        return properties.length > 0 ? properties[0] : null;
    });

    // Sync with URL on mount and when searchParams change
    useEffect(() => {
        if (!searchParams) return; // Wait for hydration
        
        const propertyId = searchParams.get('propertyId');
        if (propertyId && propertyId !== selectedProperty?.id) {
            const propertyToSelect = properties.find(p => p.id === propertyId) || null;
            setSelectedProperty(propertyToSelect);
        } else if (!propertyId && properties.length > 0 && selectedProperty?.id !== properties[0].id) {
            setSelectedProperty(properties[0]);
        }
    }, [searchParams, properties, selectedProperty?.id]);

    const setSelectedPropertyById = (id: string) => {
        const property = properties.find(p => p.id === id);
        if (property) {
            setSelectedProperty(property);
            const params = new URLSearchParams(searchParams?.toString() || '');
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
            {/* URL sync component - runs after hydration */}
            <PropertyUrlSync />
            {children}
        </PropertyContext.Provider>
    );
}

export function PropertyProvider({ children, initialProperties }: { children: ReactNode, initialProperties: FullPropiedad[] }) {
    return (
        <PropertyProviderClient initialProperties={initialProperties}>
            {children}
        </PropertyProviderClient>
    )
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}