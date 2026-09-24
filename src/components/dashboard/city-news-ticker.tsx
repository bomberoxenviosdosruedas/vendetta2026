'use client';

import React, { useState } from 'react';
import MaterialIcon from '@/components/ui/material-icon';
import { useProperty } from '@/contexts/property-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export type NewsCategory = 'TODAS' | 'BAJO_MUNDO' | 'POLICIAL' | 'MERCADO_NEGRO' | 'RUMORES';

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  fullReport: string;
  category: NewsCategory;
  source: string;
  district: string;
  coordinates?: string;
  minutesAgo: number;
}

const INITIAL_NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-1',
    headline: 'Tiroteo en los muelles de Little Italy sacude la madrugada',
    summary: 'Un intercambio de disparos con armas automáticas en el almacén 14 deja dos camiones blindados calcinados.',
    fullReport: 'Cerca de las 03:30 AM, vecinos del sector portuario reportaron ráfagas de subfusil Thompson procedentes de las inmediaciones del muelle 4. Según fuentes no oficiales, una disputa por un cargamento de munición pesada entre cuadrillas locales culminó con la intervención de coches blindados sin matrícula.',
    category: 'BAJO_MUNDO',
    source: 'La Gazzetta di Vendetta',
    district: 'Distrito Portuario',
    coordinates: '40:23:220',
    minutesAgo: 4,
  },
  {
    id: 'news-2',
    headline: 'Redada sorpresa de la Policía Metropolitana en casinos clandestinos',
    summary: 'El comisario Moretti ordena clausurar tres salones de juego no autorizados en el corazón financiero.',
    fullReport: 'En un operativo simultáneo ejecutado por más de 40 agentes con apoyo de la brigada de asalto, se intervinieron tres locales que operaban bajo la fachada de clubes de billar.',
    category: 'POLICIAL',
    source: 'Radio Policía 104.2 FM',
    district: 'Centro Financiero',
    coordinates: '40:22:169',
    minutesAgo: 18,
  },
];

export function CityNewsCard() {
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<NewsItem | null>(null);
  const { selectedProperty } = useProperty();

  const activeCoords = selectedProperty
    ? `${selectedProperty.ciudad}:${selectedProperty.barrio}:${selectedProperty.edificio}`
    : '40:23:220';

  const newsItems = INITIAL_NEWS_ITEMS.map((item, idx) => ({
    ...item,
    coordinates: idx === 0 ? activeCoords : item.coordinates,
  }));

  return (
    <section className="cell-darker p-2 border border-[#333333] space-y-2 text-[#dfdbc9]">
      <div className="crimson-th px-2 py-1 flex items-center justify-between font-['Chivo'] font-bold text-[11px] uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <MaterialIcon name="newspaper" size={15} className="text-[#fff400]" />
          <span>TELETIPO DE LA CIUDAD // GAZZETTA DI VENDETTA</span>
        </div>
        <span className="text-[#00ff00] font-['JetBrains_Mono'] font-normal">EN VIVO</span>
      </div>

      <div className="divide-y divide-[#222222] cell-dark border border-[#333333]">
        {newsItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedNewsDetail(item)}
            className="p-2.5 flex items-center justify-between gap-2 hover:bg-[#1a1a1a] cursor-pointer transition-colors text-xs font-['JetBrains_Mono'] min-h-[44px]"
          >
            <div className="flex items-center gap-2 truncate">
              <MaterialIcon name="campaign" size={15} className="text-[#ff3f3f] shrink-0" />
              <span className="font-bold text-white truncate">{item.headline}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[#fabd00] text-[10px]">[{item.coordinates}]</span>
              <span className="text-[#888888] text-[10px]">{item.minutesAgo}m</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedNewsDetail} onOpenChange={(open) => !open && setSelectedNewsDetail(null)}>
        {selectedNewsDetail && (
          <DialogContent className="bg-[#0d0d0d] border-[#333333] text-[#dfdbc9] max-w-md">
            <DialogHeader>
              <DialogTitle className="crimson-th text-white p-2 font-['Chivo'] uppercase text-sm">
                {selectedNewsDetail.headline}
              </DialogTitle>
              <DialogDescription className="text-[#a0a0a0] text-xs font-['JetBrains_Mono'] pt-2">
                {selectedNewsDetail.source} • {selectedNewsDetail.district}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2 text-xs font-['JetBrains_Mono']">
              <div className="cell-dark p-2 text-white">
                {selectedNewsDetail.summary}
              </div>
              <div className="cell-dark p-2 text-[#a0a0a0]">
                {selectedNewsDetail.fullReport}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNewsDetail(null)}
                className="btn-tactical px-3 py-1 text-xs font-bold min-h-[44px]"
              >
                CERRAR NOTICIA
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
