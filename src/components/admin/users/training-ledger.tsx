'use client';

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  saveAdminTrainings,
  type AdminEntrenamientoRow,
} from "@/lib/actions/admin-user.actions";
import { LedgerCard, NumeroField } from "./ledger";
import type { LedgerOption } from "./user-admin-view";

interface TrainingLedgerProps {
  userId: string;
  entrenamientos: AdminEntrenamientoRow[];
  options: LedgerOption[];
  /** Se ejecuta tras un guardado exitoso (el padre refresca el expediente). */
  onSaved: () => Promise<void>;
}

function nivelesIniciales(
  options: LedgerOption[],
  entrenamientos: AdminEntrenamientoRow[]
): Record<string, number> {
  const mapa: Record<string, number> = {};
  for (const o of options) {
    mapa[o.id] = entrenamientos.find((e) => e.configuracionEntrenamientoId === o.id)?.nivel ?? 0;
  }
  return mapa;
}

export function TrainingLedger({ userId, entrenamientos, options, onSaved }: TrainingLedgerProps) {
  const { toast } = useToast();

  const [niveles, setNiveles] = useState<Record<string, number>>(() =>
    nivelesIniciales(options, entrenamientos)
  );
  const [guardando, setGuardando] = useState(false);

  const dirty = options.some(
    (o) => (niveles[o.id] ?? 0) !== (entrenamientos.find((e) => e.configuracionEntrenamientoId === o.id)?.nivel ?? 0)
  );

  const guardar = async () => {
    setGuardando(true);
    const resultado = await saveAdminTrainings(userId, niveles);
    setGuardando(false);
    if (!resultado.success) {
      toast({ variant: 'destructive', title: 'Error', description: resultado.error });
      return;
    }
    toast({ title: 'Entrenamientos', description: resultado.message ?? 'Guardados.' });
    await onSaved();
  };

  return (
    <LedgerCard
      title="Entrenamientos"
      icon={GraduationCap}
      hint="nivel por investigación"
      dirty={dirty}
      saving={guardando}
      onSave={guardar}
    >
      <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {options.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3">
            <span className="truncate text-sm text-[var(--text-muted)]">{o.nombre}</span>
            <NumeroField
              ariaLabel={`Nivel de ${o.nombre}`}
              value={niveles[o.id] ?? 0}
              onChange={(v) => setNiveles((p) => ({ ...p, [o.id]: v }))}
              className="w-24 shrink-0"
            />
          </div>
        ))}
      </div>
    </LedgerCard>
  );
}