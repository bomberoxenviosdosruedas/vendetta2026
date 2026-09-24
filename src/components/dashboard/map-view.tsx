'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import MaterialIcon from '@/components/ui/material-icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getPropertiesForMap, PropertyWithOwner } from '@/lib/actions/map.actions';
import type { UserWithProgress } from '@/lib/data';

const GRID_COLS = 17;
const GRID_ROWS = 15;
const TOTAL_BUILDINGS = 255;
const CELL_WIDTH = 52;
const CELL_HEIGHT = 52;
const CELL_GAP = 6;
const PADDING = 44;

const WORLD_WIDTH = GRID_COLS * CELL_WIDTH + (GRID_COLS - 1) * CELL_GAP + PADDING * 2;
const WORLD_HEIGHT = GRID_ROWS * CELL_HEIGHT + (GRID_ROWS - 1) * CELL_GAP + PADDING * 2;

interface MapViewProps {
  initialCiudad: number;
  initialBarrio: number;
  initialProperties: PropertyWithOwner[];
  currentUser: UserWithProgress;
}

export function MapView({ initialCiudad, initialBarrio, initialProperties, currentUser }: MapViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [ciudad, setCiudad] = useState<number>(initialCiudad);
  const [barrio, setBarrio] = useState<number>(initialBarrio);
  const [properties, setProperties] = useState<PropertyWithOwner[]>(initialProperties);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [onlyOccupied, setOnlyOccupied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [selectedEdificio, setSelectedEdificio] = useState<number | null>(null);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredEdificio, setHoveredEdificio] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDistanceRef = useRef<number>(0);

  const propertiesMap = useMemo(() => {
    const map = new Map<number, PropertyWithOwner>();
    properties.forEach(p => {
      map.set(p.edificio, p);
    });
    return map;
  }, [properties]);

  const selectedProperty = selectedEdificio ? propertiesMap.get(selectedEdificio) || null : null;
  const isSelectedMine = selectedProperty?.userId === currentUser.id;

  const centerView = useCallback((targetZoom?: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const effectiveZoom = targetZoom !== undefined ? targetZoom : Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT, 1);
    const newPan = {
      x: (rect.width - WORLD_WIDTH * effectiveZoom) / 2,
      y: (rect.height - WORLD_HEIGHT * effectiveZoom) / 2,
    };
    setZoom(effectiveZoom);
    setPan(newPan);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      centerView();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [centerView]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    for (let x = 0; x < WORLD_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < WORLD_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_WIDTH, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#8e1515';
    ctx.lineWidth = 2;
    ctx.strokeRect(PADDING - 12, PADDING - 12, WORLD_WIDTH - PADDING * 2 + 24, WORLD_HEIGHT - PADDING * 2 + 24);

    for (let edificio = 1; edificio <= TOTAL_BUILDINGS; edificio++) {
      const col = (edificio - 1) % GRID_COLS;
      const row = Math.floor((edificio - 1) / GRID_COLS);
      const x = PADDING + col * (CELL_WIDTH + CELL_GAP);
      const y = PADDING + row * (CELL_HEIGHT + CELL_GAP);

      const prop = propertiesMap.get(edificio);
      const isMine = prop?.userId === currentUser.id;
      const hasOwner = !!prop;
      const isHovered = hoveredEdificio === edificio;
      const isSelected = selectedEdificio === edificio;

      if (onlyOccupied && !hasOwner && !isHovered && !isSelected) {
        ctx.fillStyle = '#111111';
        ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
        continue;
      }

      if (isMine) {
        ctx.fillStyle = '#6C0000';
      } else if (hasOwner) {
        ctx.fillStyle = '#3a0000';
      } else {
        ctx.fillStyle = isHovered ? '#262626' : '#111111';
      }
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      ctx.strokeStyle = isMine ? '#fff400' : hasOwner ? '#ff3f3f' : '#333333';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isMine) {
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fff400';
        ctx.fillText(`${edificio}`, x + CELL_WIDTH / 2, y + 16);
        ctx.font = 'bold 8px "Chivo", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('MÍA', x + CELL_WIDTH / 2, y + 36);
      } else if (hasOwner) {
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffdad4';
        ctx.fillText(`${edificio}`, x + CELL_WIDTH / 2, y + 15);
        const tag = prop.user?.familyMember?.family.tag;
        ctx.font = '8px sans-serif';
        ctx.fillStyle = '#fabd00';
        ctx.fillText(tag ? `[${tag}]` : 'Rival', x + CELL_WIDTH / 2, y + 35);
      } else {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isHovered ? '#fff400' : '#888888';
        ctx.fillText(`${edificio}`, x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2);
      }
    }

    ctx.restore();
  }, [pan, zoom, propertiesMap, hoveredEdificio, selectedEdificio, onlyOccupied, currentUser.id]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const navigateLocation = useCallback(async (newCiudad: number, newBarrio: number) => {
    if (newCiudad < 1 || newBarrio < 1) return;
    setIsLoading(true);
    setCiudad(newCiudad);
    setBarrio(newBarrio);

    const params = new URLSearchParams(searchParams);
    params.set('ciudad', newCiudad.toString());
    params.set('barrio', newBarrio.toString());
    router.push(`${pathname}?${params.toString()}`);

    const result = await getPropertiesForMap(newCiudad, newBarrio);
    if (result.success && result.data) {
      setProperties(result.data);
    }
    setIsLoading(false);
  }, [pathname, router, searchParams]);

  const handleSendMission = (edificioNum: number) => {
    const params = new URLSearchParams();
    params.set('ciudad', ciudad.toString());
    params.set('barrio', barrio.toString());
    params.set('edificio', edificioNum.toString());
    router.push(`/missions?${params.toString()}`);
  };

  const handleCopyCoords = (edificioNum: number) => {
    navigator.clipboard.writeText(`${ciudad}:${barrio}:${edificioNum}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div className="space-y-2 w-full text-[#dfdbc9]">
      <div className="cell-darker p-2 border border-[#333333] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-['JetBrains_Mono'] text-[#888888]">COORDENADAS:</span>
          <Input
            type="number"
            value={ciudad}
            onChange={(e) => setCiudad(parseInt(e.target.value, 10) || 1)}
            className="w-14 h-8 bg-black border-[#333333] text-center font-['JetBrains_Mono'] text-xs font-bold text-[#fff400]"
          />
          <span className="text-xs font-mono">:</span>
          <Input
            type="number"
            value={barrio}
            onChange={(e) => setBarrio(parseInt(e.target.value, 10) || 1)}
            className="w-14 h-8 bg-black border-[#333333] text-center font-['JetBrains_Mono'] text-xs font-bold text-[#fff400]"
          />
          <Button
            onClick={() => navigateLocation(ciudad, barrio)}
            disabled={isLoading}
            className="btn-tactical h-8 px-3 text-xs font-['Chivo'] font-bold min-h-[44px]"
          >
            {isLoading ? "Cargando..." : "Explorar"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setOnlyOccupied(!onlyOccupied)}
            className="btn-tactical h-8 px-2 text-[11px] font-['JetBrains_Mono'] min-h-[44px]"
          >
            {onlyOccupied ? "Ver Libres" : "Solo Ocupadas"}
          </Button>
        </div>
      </div>

      {/* Mobile view (<640px): Grid of solar buttons */}
      <div className="block sm:hidden cell-darker p-2 border border-[#333333]">
        <div className="crimson-th text-white px-2 py-1 text-[10px] font-['Chivo'] font-bold uppercase mb-2">
          SOLARES CERCANOS [{ciudad}:{barrio}:1..255]
        </div>
        <div className="grid grid-cols-5 gap-1.5 max-h-[350px] overflow-y-auto p-1">
          {Array.from({ length: 255 }, (_, i) => i + 1).map((edificioNum) => {
            const prop = propertiesMap.get(edificioNum);
            const isMine = prop?.userId === currentUser.id;
            const hasOwner = !!prop;

            if (onlyOccupied && !hasOwner) return null;

            return (
              <button
                key={edificioNum}
                type="button"
                onClick={() => setSelectedEdificio(edificioNum)}
                className={`h-11 min-h-[44px] min-w-[44px] flex flex-col items-center justify-center border font-['JetBrains_Mono'] text-[11px] ${
                  isMine
                    ? 'bg-[#6C0000] border-[#fff400] text-[#fff400] font-bold'
                    : hasOwner
                    ? 'bg-[#3a0000] border-[#ff3f3f] text-[#ffdad4]'
                    : 'btn-tactical text-[#888888]'
                }`}
              >
                <span>#{edificioNum}</span>
                {isMine && <span className="text-[8px] text-white">MÍA</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop view (≥640px): Radar Canvas */}
      <div className="hidden sm:block cell-darker p-2 border border-[#333333]">
        <div
          ref={containerRef}
          className="relative w-full aspect-[17/14] min-h-[420px] bg-[#0d0d0d] overflow-hidden select-none border border-[#333333]"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>

      {/* Modal Inspector */}
      <Dialog open={selectedEdificio !== null} onOpenChange={(open) => !open && setSelectedEdificio(null)}>
        {selectedEdificio && (
          <DialogContent className="bg-[#0d0d0d] border-[#333333] text-[#dfdbc9] max-w-md">
            <DialogHeader>
              <DialogTitle className="crimson-th text-white p-2 font-['Chivo'] uppercase text-sm">
                SOLAR [{ciudad}:{barrio}:{selectedEdificio}]
              </DialogTitle>
              <DialogDescription className="text-[#a0a0a0] text-xs font-['JetBrains_Mono'] pt-2">
                {selectedProperty ? (
                  isSelectedMine
                    ? `Esta base te pertenece ("${selectedProperty.nombre}").`
                    : `Controlado por ${selectedProperty.user?.name || 'un rival'}.`
                ) : (
                  "Solar desocupado listo para colonizar u ocupar."
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2 py-2 text-xs font-['JetBrains_Mono']">
              <div className="cell-dark p-2 flex justify-between">
                <span className="text-[#888888]">PROPIETARIO:</span>
                <span className="text-white font-bold">{selectedProperty?.user?.name || 'Desocupado'}</span>
              </div>
              <div className="cell-dark p-2 flex justify-between">
                <span className="text-[#888888]">FAMILIA:</span>
                <span className="text-[#fabd00] font-bold">
                  {selectedProperty?.user?.familyMember?.family.tag
                    ? `[${selectedProperty.user.familyMember.family.tag}] ${selectedProperty.user.familyMember.family.name}`
                    : 'Sin Alianza'}
                </span>
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:justify-between items-center pt-2">
              <Button
                type="button"
                onClick={() => handleCopyCoords(selectedEdificio)}
                className="btn-tactical text-xs min-h-[44px]"
              >
                {copiedCoords ? "¡Copiado!" : "Copiar Coords"}
              </Button>
              <Button
                type="button"
                onClick={() => handleSendMission(selectedEdificio)}
                className="btn-crimson text-xs min-h-[44px]"
              >
                Enviar Misión
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
