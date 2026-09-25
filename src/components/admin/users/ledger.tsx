'use client';

import type { LucideIcon } from "lucide-react";
import { Save } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Formateo de números al estilo "libro mayor" (es-AR). */
const numeroFormatter = new Intl.NumberFormat("es-AR");

export function fmt(n: number): string {
  return numeroFormatter.format(Math.trunc(n));
}

/** Campo numérico monoespaciado y alineado a la derecha (estilo ledger). */
export function NumeroField({
  value,
  onChange,
  step = 1,
  ariaLabel,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <Input
      type="number"
      min={0}
      step={step}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      className={cn(
        "h-9 w-full font-mono text-right tabular-nums bg-[var(--resource-bg)] border-[var(--border-secondary)]",
        "focus-visible:ring-[var(--accent-crimson)]",
        className
      )}
    />
  );
}

/** Card "libro" con cabecera, indicador de pendiente y botón Guardar. */
export function LedgerCard({
  title,
  icon: Icon,
  hint,
  dirty,
  saving,
  onSave,
  children,
}: {
  title: string;
  icon: LucideIcon;
  hint?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--border-primary)] bg-[var(--column-bg)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-divider)] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Icon size={15} className="shrink-0 text-[var(--accent-crimson)]" />
          <h3 className="font-heading text-sm font-bold uppercase tracking-[0.15em] text-[var(--text-primary)]">
            {title}
          </h3>
          {hint ? (
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[var(--text-meta)] sm:inline">
              {hint}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {dirty ? (
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-crimson)]">
              Sin guardar
            </span>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={!dirty || saving}
            onClick={onSave}
            className="h-8 gap-1.5 bg-[var(--accent-crimson)] font-heading font-bold text-black hover:bg-[#ff6a6a]"
          >
            <Save size={14} strokeWidth={2.5} />
            Guardar
          </Button>
        </div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}