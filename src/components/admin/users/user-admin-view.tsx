'use client';

import { useCallback, useMemo, useState } from "react";
import { FileText, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getAdminUserState,
  type AdminUserListItem,
  type AdminUserState,
} from "@/lib/actions/admin-user.actions";
import { fmt } from "./ledger";
import { PropertyLedger } from "./property-ledger";
import { TrainingLedger } from "./training-ledger";

export interface LedgerOption {
  id: string;
  nombre: string;
}

interface UserAdminViewProps {
  users: AdminUserListItem[];
  roomOptions: LedgerOption[];
  troopOptions: LedgerOption[];
  trainingOptions: LedgerOption[];
}

export function UserAdminView({
  users: usuariosIniciales,
  roomOptions,
  troopOptions,
  trainingOptions,
}: UserAdminViewProps) {
  const { toast } = useToast();

  const [lista, setLista] = useState<AdminUserListItem[]>(usuariosIniciales);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expediente, setExpediente] = useState<AdminUserState | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const seleccionar = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setCargando(true);
      const resultado = await getAdminUserState(id);
      setCargando(false);
      if (!resultado.success) {
        toast({ variant: 'destructive', title: 'Error', description: resultado.error });
        return;
      }
      setExpediente(resultado.data);
      setPropertyId((prev) =>
        prev && resultado.data.propiedades.some((p) => p.id === prev)
          ? prev
          : (resultado.data.propiedades[0]?.id ?? null)
      );
    },
    [toast]
  );

  const refrescar = useCallback(async () => {
    if (!selectedId) return;
    const resultado = await getAdminUserState(selectedId);
    if (!resultado.success) {
      toast({ variant: 'destructive', title: 'Error', description: resultado.error });
      return;
    }
    setExpediente(resultado.data);
    setPropertyId((prev) =>
      prev && resultado.data.propiedades.some((p) => p.id === prev)
        ? prev
        : (resultado.data.propiedades[0]?.id ?? null)
    );
    setLista((prev) =>
      prev.map((u) =>
        u.id === selectedId
          ? { ...u, puntosTotales: resultado.data.puntuacion?.puntosTotales ?? u.puntosTotales }
          : u
      )
    );
  }, [selectedId, toast]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(
      (u) => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    );
  }, [lista, query]);

  const propiedadActual = expediente?.propiedades.find((p) => p.id === propertyId) ?? null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
      {/* ---------------- FICHAS (búsqueda + listado) ---------------- */}
      <aside className="overflow-hidden rounded-lg border border-[var(--border-primary)] bg-[var(--column-bg)]">
        <header className="flex items-center justify-between border-b border-[var(--border-divider)] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <FileText size={15} className="text-[var(--accent-crimson)]" />
            <h2 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
              Expedientes
            </h2>
          </div>
          <span className="font-mono text-[10px] text-[var(--text-meta)]">{lista.length}</span>
        </header>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--text-meta)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar jugador…"
              aria-label="Buscar jugador"
              className="bg-[var(--resource-bg)] border-[var(--border-secondary)] pl-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[min(62vh,600px)]">
          <div className="space-y-1 px-3 pb-3">
            {filtrados.length === 0 ? (
              <p className="px-2 py-6 text-center font-mono text-xs text-[var(--text-meta)]">
                Sin coincidencias.
              </p>
            ) : (
              filtrados.map((u) => {
                const activo = u.id === selectedId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => seleccionar(u.id)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                      activo
                        ? "border-[var(--border-primary)] border-l-2 border-l-[var(--accent-crimson)] bg-[#161616]"
                        : "border-transparent hover:bg-[#141414]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-sm text-[var(--text-primary)]">
                        {u.username}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-[var(--accent-gold)]">
                        {fmt(u.puntosTotales)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-[var(--text-meta)]">{u.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-[var(--text-meta)]">
                        {u.cantidadPropiedades} PROPS
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* ---------------- EXPEDIENTE ---------------- */}
      <section className="min-w-0 space-y-4">
        {!expediente ? (
          <div className="flex h-[62vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--border-divider)] text-center">
            <Users className="h-10 w-10 text-[var(--text-meta)]" />
            <p className="font-heading text-sm text-[var(--text-muted)]">
              Elegí un expediente del listado para editarlo.
            </p>
            <p className="font-mono text-[11px] text-[var(--text-meta)]">
              recursos · habitaciones · tropas · entrenamientos
            </p>
          </div>
        ) : (
          <>
            <header className="rounded-lg border border-[var(--border-primary)] bg-[var(--column-bg)] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-meta)]">
                Admin · Jugadores
              </p>
              <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                      {expediente.username}
                    </h2>
                    <span className="inline-flex rotate-2 items-center rounded-sm border-2 border-[var(--accent-crimson)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-crimson)]">
                      Nº {expediente.id.slice(-4)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{expediente.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-meta)]">
                    Puntaje total
                  </p>
                  <p className="font-mono text-2xl font-bold text-[var(--accent-gold)]">
                    {fmt(expediente.puntuacion?.puntosTotales ?? 0)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--text-meta)]">
                    HAB {fmt(expediente.puntuacion?.puntosHabitaciones ?? 0)} · TRO{' '}
                    {fmt(expediente.puntuacion?.puntosTropas ?? 0)} · ENT{' '}
                    {fmt(expediente.puntuacion?.puntosEntrenamientos ?? 0)}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-px bg-gradient-to-r from-[var(--accent-crimson)] via-[var(--border-primary)] to-transparent" />
            </header>

            {cargando ? (
              <p className="font-mono text-xs text-[var(--text-meta)] animate-pulse">
                Abriendo expediente…
              </p>
            ) : null}

            {expediente.propiedades.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-divider)] bg-[var(--column-bg)] px-5 py-6">
                <p className="font-heading text-sm text-[var(--text-muted)]">
                  Este jugador no tiene propiedades.
                </p>
                <p className="mt-1 font-mono text-xs text-[var(--text-meta)]">
                  Creá una desde el juego antes de asignarle recursos, habitaciones o tropas.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-meta)]">
                    Propiedad activa · {expediente.propiedades.length}
                  </p>
                  <Select value={propertyId ?? undefined} onValueChange={setPropertyId}>
                    <SelectTrigger
                      aria-label="Seleccionar propiedad"
                      className="w-full bg-[var(--resource-bg)] border-[var(--border-secondary)] font-mono sm:w-80"
                    >
                      <SelectValue placeholder="Elegir propiedad" />
                    </SelectTrigger>
                    <SelectContent>
                      {expediente.propiedades.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="font-mono">
                          {p.nombre} · {p.ciudad}:{p.barrio}:{p.edificio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {propiedadActual ? (
                  <PropertyLedger
                    key={`${selectedId}-${propertyId}`}
                    userId={expediente.id}
                    property={propiedadActual}
                    roomOptions={roomOptions}
                    troopOptions={troopOptions}
                    onSaved={refrescar}
                  />
                ) : null}
              </>
            )}

            <TrainingLedger
              key={`${selectedId}-entrenamientos`}
              userId={expediente.id}
              entrenamientos={expediente.entrenamientos}
              options={trainingOptions}
              onSaved={refrescar}
            />

            <p className="px-1 font-mono text-[10px] uppercase tracking-widest text-[var(--text-meta)]">
              Los cambios se escriben en la base y recalculan la puntuación al guardar.
            </p>
          </>
        )}
      </section>
    </div>
  );
}