'use client';

import { useState } from "react";
import { Building2, Coins, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  saveAdminResources,
  saveAdminRooms,
  saveAdminTroops,
  type AdminPropiedadState,
} from "@/lib/actions/admin-user.actions";
import { LedgerCard, NumeroField } from "./ledger";
import type { LedgerOption } from "./user-admin-view";

interface PropertyLedgerProps {
  userId: string;
  property: AdminPropiedadState;
  roomOptions: LedgerOption[];
  troopOptions: LedgerOption[];
  /** Se ejecuta tras un guardado exitoso (el padre refresca el expediente). */
  onSaved: () => Promise<void>;
}

function nivelesIniciales(
  options: LedgerOption[],
  actual: (id: string) => number
): Record<string, number> {
  const mapa: Record<string, number> = {};
  for (const o of options) mapa[o.id] = actual(o.id);
  return mapa;
}

export function PropertyLedger({
  userId,
  property,
  roomOptions,
  troopOptions,
  onSaved,
}: PropertyLedgerProps) {
  const { toast } = useToast();

  // ---------------- RECURSOS ----------------
  const [recursos, setRecursos] = useState({
    armas: property.armas,
    municion: property.municion,
    alcohol: property.alcohol,
    dolares: property.dolares,
  });
  const [guardandoRecursos, setGuardandoRecursos] = useState(false);
  const recursosDirty =
    recursos.armas !== property.armas ||
    recursos.municion !== property.municion ||
    recursos.alcohol !== property.alcohol ||
    recursos.dolares !== property.dolares;

  const guardarRecursos = async () => {
    setGuardandoRecursos(true);
    const resultado = await saveAdminResources(userId, property.id, recursos);
    setGuardandoRecursos(false);
    if (!resultado.success) {
      toast({ variant: 'destructive', title: 'Error', description: resultado.error });
      return;
    }
    toast({ title: 'Recursos', description: resultado.message ?? 'Guardados.' });
    await onSaved();
  };

  // ---------------- HABITACIONES ----------------
  const [niveles, setNiveles] = useState<Record<string, number>>(() =>
    nivelesIniciales(roomOptions, (id) =>
      property.habitaciones.find((h) => h.configuracionHabitacionId === id)?.nivel ?? 0
    )
  );
  const [guardandoNiveles, setGuardandoNiveles] = useState(false);
  const nivelesDirty =
    JSON.stringify(niveles) !==
    JSON.stringify(
      nivelesIniciales(roomOptions, (id) =>
        property.habitaciones.find((h) => h.configuracionHabitacionId === id)?.nivel ?? 0
      )
    );

  const guardarNiveles = async () => {
    setGuardandoNiveles(true);
    const resultado = await saveAdminRooms(userId, property.id, niveles);
    setGuardandoNiveles(false);
    if (!resultado.success) {
      toast({ variant: 'destructive', title: 'Error', description: resultado.error });
      return;
    }
    toast({ title: 'Habitaciones', description: resultado.message ?? 'Guardados.' });
    await onSaved();
  };

  // ---------------- TROPAS ----------------
  const [cantidades, setCantidades] = useState<Record<string, number>>(() =>
    nivelesIniciales(troopOptions, (id) =>
      property.tropas.find((t) => t.configuracionTropaId === id)?.cantidad ?? 0
    )
  );
  const [guardandoCantidades, setGuardandoCantidades] = useState(false);
  const cantidadesDirty =
    JSON.stringify(cantidades) !==
    JSON.stringify(
      nivelesIniciales(troopOptions, (id) =>
        property.tropas.find((t) => t.configuracionTropaId === id)?.cantidad ?? 0
      )
    );

  const guardarCantidades = async () => {
    setGuardandoCantidades(true);
    const resultado = await saveAdminTroops(userId, property.id, cantidades);
    setGuardandoCantidades(false);
    if (!resultado.success) {
      toast({ variant: 'destructive', title: 'Error', description: resultado.error });
      return;
    }
    toast({ title: 'Tropas', description: resultado.message ?? 'Guardadas.' });
    await onSaved();
  };

  return (
    <div className="space-y-4">
      <LedgerCard
        title="Recursos"
        icon={Coins}
        hint="armas · munición · alcohol · dólares"
        dirty={recursosDirty}
        saving={guardandoRecursos}
        onSave={guardarRecursos}
      >
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <CampoRecurso
            label="Armas"
            ariaLabel="Armas"
            valor={recursos.armas}
            onChange={(v) => setRecursos((p) => ({ ...p, armas: v }))}
          />
          <CampoRecurso
            label="Munición"
            ariaLabel="Munición"
            valor={recursos.municion}
            onChange={(v) => setRecursos((p) => ({ ...p, municion: v }))}
          />
          <CampoRecurso
            label="Alcohol"
            ariaLabel="Alcohol"
            valor={recursos.alcohol}
            onChange={(v) => setRecursos((p) => ({ ...p, alcohol: v }))}
          />
          <CampoRecurso
            label="Dólares"
            ariaLabel="Dólares"
            valor={recursos.dolares}
            onChange={(v) => setRecursos((p) => ({ ...p, dolares: v }))}
          />
        </div>
      </LedgerCard>

      <LedgerCard
        title="Habitaciones"
        icon={Building2}
        hint="nivel por edificio"
        dirty={nivelesDirty}
        saving={guardandoNiveles}
        onSave={guardarNiveles}
      >
        <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {roomOptions.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-[var(--text-muted)]">{r.nombre}</span>
              <NumeroField
                ariaLabel={`Nivel de ${r.nombre}`}
                value={niveles[r.id] ?? 0}
                onChange={(v) => setNiveles((p) => ({ ...p, [r.id]: v }))}
                className="w-24 shrink-0"
              />
            </div>
          ))}
        </div>
      </LedgerCard>

      <LedgerCard
        title="Tropas"
        icon={Shield}
        hint="cantidad por tipo"
        dirty={cantidadesDirty}
        saving={guardandoCantidades}
        onSave={guardarCantidades}
      >
        <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {troopOptions.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-[var(--text-muted)]">{t.nombre}</span>
              <NumeroField
                ariaLabel={`Cantidad de ${t.nombre}`}
                value={cantidades[t.id] ?? 0}
                onChange={(v) => setCantidades((p) => ({ ...p, [t.id]: v }))}
                className="w-24 shrink-0"
              />
            </div>
          ))}
        </div>
      </LedgerCard>
    </div>
  );
}

function CampoRecurso({
  label,
  ariaLabel,
  valor,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  valor: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <NumeroField ariaLabel={ariaLabel} value={valor} onChange={onChange} step={0.01} className="w-28 shrink-0" />
    </div>
  );
}