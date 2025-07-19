
import { RoomsView } from "@/components/dashboard/rooms-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getSessionUser } from "@/lib/auth"
import { FullConfiguracionHabitacion, getRoomConfigurations } from "@/lib/data"
import { redirect } from "next/navigation"
import { calcularCostosNivel, calcularTiempoConstruccion } from "@/lib/formulas/room-formulas"

function RoomsLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
          </div>
        </div>
        <div className="border rounded-lg p-0">
            <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 flex items-center space-x-4">
                        <Skeleton className="h-16 w-20 rounded-md shimmer" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4 shimmer" />
                            <Skeleton className="h-4 w-1/2 shimmer" />
                        </div>
                        <Skeleton className="h-10 w-24 rounded-md shimmer" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    )
  }

export default async function RoomsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const allRoomConfigs = await getRoomConfigurations();

  if (!user.propiedades || user.propiedades.length === 0) {
    return (
      <div className="main-view">
         <h2 className="text-3xl font-bold tracking-tight">Gestión de Habitaciones</h2>
         <p>No tienes propiedades para gestionar.</p>
      </div>
    )
  }

  // Pre-calculate data for the view component on the server
  const getRoomsDataForProperty = (propertyId: string) => {
      const selectedProperty = user.propiedades.find(p => p.id === propertyId);
      if (!selectedProperty) return [];

      const userRoomsMap = new Map(selectedProperty.habitaciones.map(h => [h.configuracionHabitacionId, h]));
      
      const desiredOrder = [
          'oficina_del_jefe', 'escuela_especializacion', 'armeria', 'almacen_de_municion',
          'cerveceria', 'taberna', 'contrabando', 'almacen_de_armas', 'deposito_de_municion',
          'almacen_de_alcohol', 'caja_fuerte', 'campo_de_entrenamiento', 'seguridad',
          'torreta_de_fuego_automatico', 'minas_ocultas'
      ];
      
      return desiredOrder.map(id => {
          const config = allRoomConfigs.find(c => c.id === id);
          if (!config) return null;

          const userRoom = userRoomsMap.get(id);
          const nivelBase = userRoom ? userRoom.nivel : 0;
          
          const mejorasEnCola = selectedProperty.colaConstruccion.filter(c => c.habitacionId === id).length;
          const nivelProyectado = nivelBase + mejorasEnCola;
          const nivelSiguiente = nivelProyectado + 1;

          const nivelOficinaJefe = userRoomsMap.get('oficina_del_jefe')?.nivel || 1;
          
          const enConstruccion = selectedProperty.colaConstruccion.some(c => c.habitacionId === id);

          const costosSiguienteNivel = calcularCostosNivel(nivelSiguiente, config);
          const tiempoSiguienteNivel = calcularTiempoConstruccion(nivelSiguiente, config, nivelOficinaJefe);
          
          const requirements = config.requirements || [];
          const meetsRequirements = requirements.every(req => (userRoomsMap.get(req.requiredRoomId)?.nivel || 0) >= req.requiredLevel);
          const requirementsText = !meetsRequirements
              ? requirements.map(req => `${allRoomConfigs.find(r=>r.id === req.requiredRoomId)?.nombre || req.requiredRoomId} (Nvl ${req.requiredLevel})`).join(', ')
              : null;

          return {
              ...config,
              nivel: nivelBase,
              nivelProyectado,
              nivelSiguiente,
              costos: costosSiguienteNivel,
              tiempo: tiempoSiguienteNivel,
              enConstruccion,
              meetsRequirements,
              requirementsText,
          };
      }).filter((r): r is NonNullable<typeof r> => r !== null);
  }

  return (
    <div className="main-view">
      <Suspense fallback={<RoomsLoading />}>
          <RoomsView 
            user={user} 
            allRoomConfigs={allRoomConfigs} 
            getRoomsDataForProperty={getRoomsDataForProperty}
          />
      </Suspense>
    </div>
  )
}
