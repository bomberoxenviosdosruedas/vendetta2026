
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapView } from "@/components/dashboard/map-view";
import { getPropertiesByLocation } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

function MapLoading() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="w-full aspect-square rounded-lg" />
        </div>
    )
}

export default async function MapPage({
    searchParams
}: {
    searchParams?: {
        ciudad?: string;
        barrio?: string;
    };
}) {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }
    
    // Si no hay params, usamos la ubicación de la primera propiedad del usuario
    const initialCiudad = searchParams?.ciudad ? parseInt(searchParams.ciudad, 10) : user.propiedades?.[0]?.ciudad || 1;
    const initialBarrio = searchParams?.barrio ? parseInt(searchParams.barrio, 10) : user.propiedades?.[0]?.barrio || 1;

    const properties = await getPropertiesByLocation(initialCiudad, initialBarrio);

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Mapa de la Ciudad</h2>
            <Suspense fallback={<MapLoading />}>
                <MapView 
                    initialCiudad={initialCiudad} 
                    initialBarrio={initialBarrio} 
                    initialProperties={properties} 
                    currentUser={user}
                />
            </Suspense>
        </div>
    );
}
