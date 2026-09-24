'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MaterialIcon from '@/components/ui/material-icon';
import { getPropertyOwner, UserWithProgress } from '@/lib/data';
import { debounce } from 'lodash';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { enviarMision } from '@/lib/actions/mission.actions';
import { useToast } from '@/hooks/use-toast';
import { useProperty } from '@/contexts/property-context';
import type { ConfiguracionTropa } from '@prisma/client';
import { calcularDistancia, calcularDuracionViaje, calcularVelocidadFlota } from '@/lib/formulas/mission-formulas';
import { useSearchParams } from 'next/navigation';

type TroopInput = {
  id: string;
  cantidad: number;
};

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s";
  const units: { name: string, seconds: number }[] = [
    { name: 'd', seconds: 86400 },
    { name: 'h', seconds: 3600 },
    { name: 'm', seconds: 60 },
    { name: 's', seconds: 1 }
  ];
  let remainingSeconds = seconds;
  let result = '';
  let parts = 0;

  for (const unit of units) {
    if (remainingSeconds >= unit.seconds && parts < 3) {
      const amount = Math.floor(remainingSeconds / unit.seconds);
      if (amount > 0) {
        result += `${amount}${unit.name} `;
        remainingSeconds %= unit.seconds;
        parts++;
      }
    }
  }
  return result.trim() || '0s';
}

export function MissionsView({ user, troopConfigs }: { user: UserWithProgress, troopConfigs: ConfiguracionTropa[] }) {
  const { selectedProperty } = useProperty();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [coordinates, setCoordinates] = useState({
    ciudad: searchParams.get('ciudad') || selectedProperty?.ciudad.toString() || '',
    barrio: searchParams.get('barrio') || selectedProperty?.barrio.toString() || '',
    edificio: searchParams.get('edificio') || ''
  });

  const [targetOwner, setTargetOwner] = useState<{ id: string, name: string } | null | undefined>(undefined);
  const [isLoadingTarget, setIsLoadingTarget] = useState(false);
  const [missionType, setMissionType] = useState('ATAQUE');
  const [tropas, setTropas] = useState<TroopInput[]>([]);
  const [travelTime, setTravelTime] = useState<number>(0);

  const troopConfigsMap = new Map(troopConfigs.map(t => [t.id, t]));

  useEffect(() => {
    const ciudad = searchParams.get('ciudad');
    const barrio = searchParams.get('barrio');
    const edificio = searchParams.get('edificio');

    const newCoords = {
      ciudad: ciudad || selectedProperty?.ciudad.toString() || '',
      barrio: barrio || selectedProperty?.barrio.toString() || '',
      edificio: edificio || ''
    };
    setCoordinates(newCoords);

    if (newCoords.ciudad && newCoords.barrio && newCoords.edificio) {
      setIsLoadingTarget(true);
      debouncedFetchOwner(parseInt(newCoords.ciudad), parseInt(newCoords.barrio), parseInt(newCoords.edificio));
    }
  }, [searchParams, selectedProperty]);

  const calculateTravelTime = useCallback(async () => {
    if (!selectedProperty || tropas.length === 0 || !coordinates.ciudad || !coordinates.barrio || !coordinates.edificio) {
      setTravelTime(0);
      return;
    }

    const activeTroops = tropas.filter(t => t.cantidad > 0);
    if (activeTroops.length === 0) {
      setTravelTime(0);
      return;
    }

    const velocidad = await calcularVelocidadFlota(activeTroops, troopConfigsMap);
    const distancia = calcularDistancia(selectedProperty, {
      ciudad: parseInt(coordinates.ciudad, 10),
      barrio: parseInt(coordinates.barrio, 10),
      edificio: parseInt(coordinates.edificio, 10),
    });
    const duracion = calcularDuracionViaje(distancia, velocidad);
    setTravelTime(duracion);
  }, [tropas, coordinates, selectedProperty, troopConfigsMap]);

  useEffect(() => {
    calculateTravelTime();
  }, [calculateTravelTime]);

  const debouncedFetchOwner = useCallback(
    debounce(async (ciudad: number, barrio: number, edificio: number) => {
      if (!ciudad || !barrio || !edificio) {
        setTargetOwner(undefined);
        setIsLoadingTarget(false);
        return;
      }
      const owner = await getPropertyOwner({ ciudad, barrio, edificio });
      setTargetOwner(owner);
      setIsLoadingTarget(false);
    }, 500),
    []
  );

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newCoords = { ...coordinates, [name]: value };
    setCoordinates(newCoords);

    const { ciudad, barrio, edificio } = newCoords;
    if (ciudad && barrio && edificio) {
      setIsLoadingTarget(true);
      debouncedFetchOwner(parseInt(ciudad), parseInt(barrio), parseInt(edificio));
    } else {
      setTargetOwner(undefined);
    }
  };

  const handleTroopChange = (troopId: string, cantidad: number) => {
    setTropas(prev => {
      const existing = prev.find(t => t.id === troopId);
      if (existing) {
        if (cantidad > 0) {
          return prev.map(t => t.id === troopId ? { ...t, cantidad } : t);
        } else {
          return prev.filter(t => t.id !== troopId);
        }
      } else if (cantidad > 0) {
        return [...prev, { id: troopId, cantidad }];
      }
      return prev;
    });
  };

  const setMaxTroops = (troopId: string) => {
    const available = selectedProperty?.TropaUsuario.find(t => t.configuracionTropaId === troopId)?.cantidad || 0;
    handleTroopChange(troopId, available);
  };

  const setAllMaxTroops = () => {
    const newTroopInputs = selectedProperty?.TropaUsuario
      .filter(tropa => tropa.configuracion.tipo !== 'DEFENSA')
      .map(tropa => ({
        id: tropa.configuracionTropaId,
        cantidad: tropa.cantidad,
      })) || [];
    setTropas(newTroopInputs);
  };

  const handleSubmit = async () => {
    if (!selectedProperty) {
      toast({ variant: 'destructive', title: 'Error', description: 'No hay una propiedad de origen seleccionada.' });
      return;
    }

    startTransition(async () => {
      const result = await enviarMision({
        origenPropiedadId: selectedProperty.id,
        coordinates: {
          ciudad: parseInt(coordinates.ciudad),
          barrio: parseInt(coordinates.barrio),
          edificio: parseInt(coordinates.edificio)
        },
        tropas: tropas.filter(t => t.cantidad > 0),
        tipo: missionType
      });

      if (result.error) {
        toast({ variant: 'destructive', title: 'Error en la misión', description: result.error });
      } else {
        toast({ title: '¡Misión enviada!', description: result.success });
        setTropas([]);
      }
    });
  };

  if (!selectedProperty) {
    return (
      <div className="cell-darker p-4 border border-[#333333] text-center font-mono text-[#a0a0a0]">
        Selecciona una propiedad para enviar misiones.
      </div>
    );
  }

  const availableTroops = selectedProperty.TropaUsuario.filter(t => t.cantidad > 0 && t.configuracion.tipo !== 'DEFENSA');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full text-[#dfdbc9]">
      <div className="cell-darker p-2 border border-[#333333] space-y-2">
        <div className="crimson-th p-2 text-white font-['Chivo'] font-bold text-xs uppercase">
          CONFIGURACIÓN DE LA MISIÓN
        </div>

        <div className="grid grid-cols-3 gap-1.5 font-['JetBrains_Mono'] text-xs">
          <div>
            <label className="text-[10px] text-[#888888] uppercase block">CIUDAD</label>
            <Input name="ciudad" value={coordinates.ciudad} onChange={handleCoordinateChange} className="bg-black border-[#333333] text-white font-bold" />
          </div>
          <div>
            <label className="text-[10px] text-[#888888] uppercase block">BARRIO</label>
            <Input name="barrio" value={coordinates.barrio} onChange={handleCoordinateChange} className="bg-black border-[#333333] text-white font-bold" />
          </div>
          <div>
            <label className="text-[10px] text-[#888888] uppercase block">EDIFICIO</label>
            <Input name="edificio" value={coordinates.edificio} onChange={handleCoordinateChange} className="bg-black border-[#333333] text-white font-bold" />
          </div>
        </div>

        <div className="cell-dark p-2 flex items-center justify-between text-xs font-['JetBrains_Mono']">
          <span className="text-[#888888]">OBJETIVO:</span>
          <span className="text-[#fff400] font-bold">
            {isLoadingTarget ? 'Buscando...' : targetOwner?.name || 'Nadie / Desocupado'}
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-['JetBrains_Mono'] text-[#888888] uppercase block">TIPO DE MISIÓN</label>
          <Select onValueChange={setMissionType} defaultValue={missionType}>
            <SelectTrigger className="bg-black border-[#333333] text-[#dfdbc9] font-['Chivo'] text-xs">
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d0d0d] border-[#333333] text-[#dfdbc9]">
              <SelectItem value="ATAQUE">Ataque</SelectItem>
              <SelectItem value="OCUPAR">Ocupar</SelectItem>
              <SelectItem value="DEFENDER">Defender</SelectItem>
              <SelectItem value="TRANSPORTE">Transporte</SelectItem>
              <SelectItem value="ESPIONAJE">Espionaje</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="cell-darker p-2 border border-[#333333] space-y-2">
        <div className="crimson-th p-2 text-white font-['Chivo'] font-bold text-xs uppercase flex items-center justify-between">
          <span>TROPAS // {selectedProperty.nombre}</span>
          <Button onClick={setAllMaxTroops} className="btn-tactical text-[10px] sm:text-xs h-auto min-h-[44px] px-2 py-1">SELECCIONAR TODAS</Button>
        </div>

        <div className="divide-y divide-[#222222] cell-dark border border-[#333333] max-h-[300px] overflow-y-auto">
          {availableTroops.length > 0 ? availableTroops.map(tropa => (
            <div key={tropa.configuracionTropaId} className="p-1.5 flex items-center justify-between text-xs font-['JetBrains_Mono'] gap-2">
              <div className="flex items-center gap-2 truncate">
                <Image src={tropa.configuracion.urlImagen} alt={tropa.configuracion.nombre} width={24} height={20} className="object-contain shrink-0" />
                <span className="truncate text-white font-bold">{tropa.configuracion.nombre}</span>
                <span className="text-[#888888] text-[10px]">({tropa.cantidad})</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Input
                  type="number"
                  min="0"
                  max={tropa.cantidad}
                  value={tropas.find(t => t.id === tropa.configuracionTropaId)?.cantidad || 0}
                  onChange={(e) => handleTroopChange(tropa.configuracionTropaId, parseInt(e.target.value) || 0)}
                  className="w-16 h-8 bg-black border-[#333333] text-center font-bold text-[#fff400]"
                />
                <Button onClick={() => setMaxTroops(tropa.configuracionTropaId)} className="btn-tactical h-8 px-2 text-[10px] min-h-[44px]">MÁX</Button>
              </div>
            </div>
          )) : (
            <p className="p-3 text-center text-[#888888] text-xs font-mono">Sin tropas disponibles en esta propiedad.</p>
          )}
        </div>

        <div className="cell-dark p-2 flex items-center justify-between text-xs font-['JetBrains_Mono']">
          <span className="text-[#888888]">TIEMPO ESTIMADO DE VIAJE:</span>
          <span className="text-[#00ff00] font-bold tabular-nums">{formatDuration(travelTime)}</span>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending || tropas.length === 0}
          className="btn-crimson w-full text-xs font-['Chivo'] font-bold h-11 min-h-[44px]"
        >
          {isPending ? 'DESPLEGANDO FLOTA...' : 'DESPLEGAR MISIÓN TÁCTICA'}
        </Button>
      </div>
    </div>
  );
}
