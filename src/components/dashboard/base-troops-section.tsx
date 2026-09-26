'use client';

import Link from "next/link";
import MaterialIcon from "@/components/ui/material-icon";
import { useProperty } from "@/contexts/property-context";
import { resolveConfigImageUrl } from "@/lib/config-images";

const troopIconByType: { [key: string]: string } = {
  ATAQUE: 'swords',
  DEFENSA: 'shield',
  ESPIONAJE: 'visibility',
  TRANSPORTE: 'local_shipping',
  OCUPAR: 'flag',
};

function formatNumber(num: number): string {
  return Math.floor(num).toLocaleString('de-DE');
}

export function BaseTroopsSection() {
  const { selectedProperty } = useProperty();
  const troops = selectedProperty?.TropaUsuario.filter(t => t.cantidad > 0) ?? [];
  const loadCapacity = troops.reduce(
    (sum, t) => sum + (t.configuracion?.capacidad ?? 0) * t.cantidad,
    0
  );

  return (
    <section className="v-outer-frame">
      <div className="v-header-c flex items-center justify-between px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <MaterialIcon name="shield" size={13} className="text-[#e2ca92]" />
          <span className="font-bold text-[11px] tracking-wide">TROPAS DISPONIBLES EN LA BASE</span>
        </div>
        <Link href="/recruitment" className="text-[#ffe569] text-[10px] underline hover:text-white">
          Cuartel
        </Link>
      </div>

      {troops.length === 0 ? (
        <p className="p-3 text-center text-[11px] text-[#4a4031] font-mono bg-[#f1ebda] border-t border-[#a89e87]">
          Sin tropas estacionadas en esta base
        </p>
      ) : (
        <div className="p-2 bg-[#f1ebda] border-t border-[#a89e87]">
          {/* Desktop: badge-units full bleed */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2">
            {troops.map(t => (
              <div key={t.id} className="badge-unit">
                {t.configuracion.urlImagen ? (
                  <>
                    <img
                      src={resolveConfigImageUrl(t.configuracion.urlImagen)}
                      alt={t.configuracion.nombre}
                      className="badge-unit__image"
                    />
                    <div className="badge-unit__overlay">
                      <span className="badge-unit__name truncate">{t.configuracion.nombre}</span>
                      <span className="badge-unit__quantity">{formatNumber(t.cantidad)}</span>
                    </div>
                  </>
                ) : (
                  <div className="badge-unit badge-unit--fallback">
                    <MaterialIcon
                      name={troopIconByType[t.configuracion.tipo] || 'military_tech'}
                      size={28}
                      className="badge-unit__icon text-[#e2cca2] mb-1"
                    />
                    <b className="text-xs text-[#ece6d5]">{t.configuracion.nombre}</b>
                    <span className="footna text-amber-300 font-['JetBrains_Mono']">( {formatNumber(t.cantidad)} )</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: cuadrícula táctil 2x2 full bleed */}
          <div className="md:hidden grid grid-cols-2 gap-2">
            {troops.map(t => (
              <div key={t.id} className="badge-unit h-24 max-w-full">
                {t.configuracion.urlImagen ? (
                  <>
                    <img
                      src={resolveConfigImageUrl(t.configuracion.urlImagen)}
                      alt={t.configuracion.nombre}
                      className="badge-unit__image"
                    />
                    <div className="badge-unit__overlay">
                      <span className="badge-unit__name truncate">{t.configuracion.nombre}</span>
                      <span className="badge-unit__quantity">{formatNumber(t.cantidad)} disp.</span>
                    </div>
                  </>
                ) : (
                  <div className="badge-unit badge-unit--fallback h-full">
                    <MaterialIcon
                      name={troopIconByType[t.configuracion.tipo] || 'military_tech'}
                      size={24}
                      className="badge-unit__icon text-[#e2cca2] mb-1"
                    />
                    <b className="text-xs text-[#ece6d5] truncate">{t.configuracion.nombre}</b>
                    <span className="footna text-amber-300 font-['JetBrains_Mono']">{formatNumber(t.cantidad)} disp.</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pie: capacidad de carga + desplegar */}
          <div className="mt-2 pt-1.5 border-t border-[#c5bca5] flex justify-between items-center text-[10px]">
            <span className="text-[#594d39]">
              Capacidad de Carga Base: <b className="font-['JetBrains_Mono']">{formatNumber(loadCapacity)}</b>
            </span>
            <Link
              href="/missions"
              className="retro-btn px-2 py-1 text-[9px] rounded font-bold inline-flex items-center gap-1"
            >
              <MaterialIcon name="send" size={11} />
              Desplegar Tropas
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}