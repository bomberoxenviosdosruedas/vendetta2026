'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    Send, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    Crosshair, 
    Copy, 
    Check, 
    MapPin, 
    Users, 
    Building2, 
    Eye, 
    EyeOff, 
    Maximize2, 
    Minimize2,
    ShieldAlert,
    ExternalLink
} from 'lucide-react';
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

// Virtual world dimensions
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

    // Coordinates state
    const [ciudad, setCiudad] = useState<number>(initialCiudad);
    const [barrio, setBarrio] = useState<number>(initialBarrio);
    const [properties, setProperties] = useState<PropertyWithOwner[]>(initialProperties);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Filter state
    const [onlyOccupied, setOnlyOccupied] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Selected lot for modal
    const [selectedEdificio, setSelectedEdificio] = useState<number | null>(null);
    const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

    // Canvas refs and view transformation state
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mapImageRef = useRef<HTMLImageElement | null>(null);

    const [zoom, setZoom] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [hoveredEdificio, setHoveredEdificio] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const lastPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const dragDistanceRef = useRef<number>(0);
    const pinchStartDistRef = useRef<number | null>(null);
    const pinchStartZoomRef = useRef<number>(1);

    const [mapImageLoaded, setMapImageLoaded] = useState<boolean>(false);

    // Preload background map image
    useEffect(() => {
        const img = new window.Image();
        img.src = '/img/map.png';
        img.onload = () => {
            mapImageRef.current = img;
            setMapImageLoaded(true);
        };
        img.onerror = () => {
            mapImageRef.current = null;
        };
    }, []);

    // Quick map lookup for fast rendering
    const propertiesMap = useMemo(() => {
        const map = new Map<number, PropertyWithOwner>();
        properties.forEach(p => {
            map.set(p.edificio, p);
        });
        return map;
    }, [properties]);

    // Check if current user has a property in this barrio
    const myPropertyInBarrio = useMemo(() => {
        return currentUser.propiedades.find(p => p.ciudad === ciudad && p.barrio === barrio);
    }, [currentUser.propiedades, ciudad, barrio]);

    // Selected property details
    const selectedProperty = selectedEdificio ? propertiesMap.get(selectedEdificio) || null : null;
    const isSelectedMine = selectedProperty?.userId === currentUser.id;

    // Center and fit canvas
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

    // Focus on specific building
    const focusOnBuilding = useCallback((edificioNum: number) => {
        if (!containerRef.current || edificioNum < 1 || edificioNum > 255) return;
        const col = (edificioNum - 1) % GRID_COLS;
        const row = Math.floor((edificioNum - 1) / GRID_COLS);
        const cellCenterX = PADDING + col * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2;
        const cellCenterY = PADDING + row * (CELL_HEIGHT + CELL_GAP) + CELL_HEIGHT / 2;

        const targetZoom = 1.6;
        const rect = containerRef.current.getBoundingClientRect();
        const newPan = {
            x: rect.width / 2 - cellCenterX * targetZoom,
            y: rect.height / 2 - cellCenterY * targetZoom,
        };

        setZoom(targetZoom);
        setPan(newPan);
        setSelectedEdificio(edificioNum);
    }, []);

    // ResizeObserver on canvas container
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let debounceTimer: NodeJS.Timeout;
        const observer = new ResizeObserver(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const canvas = canvasRef.current;
                if (!canvas || !container) return;
                const dpr = window.devicePixelRatio || 1;
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                centerView();
            }, 100);
        });

        observer.observe(container);
        return () => {
            observer.disconnect();
            clearTimeout(debounceTimer);
        };
    }, [centerView]);

    // Canvas drawing function
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

        // Apply pan and zoom transform
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);

        // Draw background map or fallback tactical grid
        if (mapImageLoaded && mapImageRef.current) {
            ctx.drawImage(mapImageRef.current, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
            // Tactical dark tint overlay
            ctx.fillStyle = 'rgba(6, 10, 18, 0.72)';
            ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        } else {
            // High-tech radar background
            ctx.fillStyle = '#0a0e17';
            ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

            ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
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
        }

        // Draw tactical border around world area
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(PADDING - 12, PADDING - 12, WORLD_WIDTH - PADDING * 2 + 24, WORLD_HEIGHT - PADDING * 2 + 24);

        // Draw coordinate axis labels (Cols 1..17, Rows 1..15)
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let col = 0; col < GRID_COLS; col++) {
            const cx = PADDING + col * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2;
            ctx.fillText(`C${col + 1}`, cx, PADDING - 22);
            ctx.fillText(`C${col + 1}`, cx, WORLD_HEIGHT - PADDING + 22);
        }

        ctx.textAlign = 'right';
        for (let row = 0; row < GRID_ROWS; row++) {
            const cy = PADDING + row * (CELL_HEIGHT + CELL_GAP) + CELL_HEIGHT / 2;
            ctx.fillText(`F${row + 1}`, PADDING - 20, cy);
            ctx.textAlign = 'left';
            ctx.fillText(`F${row + 1}`, WORLD_WIDTH - PADDING + 20, cy);
            ctx.textAlign = 'right';
        }

        // Draw Buildings
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

            // Filter condition
            if (onlyOccupied && !hasOwner && !isHovered && !isSelected) {
                // Dimmed placeholder for unoccupied lot when filter is on
                ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
                ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
                continue;
            }

            // Box Fill
            if (isMine) {
                ctx.fillStyle = isHovered ? 'rgba(234, 179, 8, 0.45)' : 'rgba(234, 179, 8, 0.25)';
            } else if (hasOwner) {
                ctx.fillStyle = isHovered ? 'rgba(239, 68, 68, 0.45)' : 'rgba(220, 38, 38, 0.25)';
            } else {
                ctx.fillStyle = isHovered ? 'rgba(51, 65, 85, 0.6)' : 'rgba(15, 23, 42, 0.7)';
            }
            ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

            // Box Border
            if (isMine) {
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 2;
            } else if (hasOwner) {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 1.5;
            } else {
                ctx.strokeStyle = isHovered ? 'rgba(148, 163, 184, 0.8)' : 'rgba(51, 65, 85, 0.6)';
                ctx.lineWidth = 1;
            }
            ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

            // Draw Building Number
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (isMine) {
                ctx.font = 'bold 12px monospace';
                ctx.fillStyle = '#fef08a';
                ctx.fillText(`${edificio}`, x + CELL_WIDTH / 2, y + 16);

                ctx.font = 'bold 8px sans-serif';
                ctx.fillStyle = '#fef9c3';
                ctx.fillText('MÍA', x + CELL_WIDTH / 2, y + 36);

                // Small golden crown / indicator star
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(x + CELL_WIDTH / 2, y + 26, 2.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (hasOwner) {
                ctx.font = 'bold 11px monospace';
                ctx.fillStyle = '#fca5a5';
                ctx.fillText(`${edificio}`, x + CELL_WIDTH / 2, y + 15);

                const ownerName = prop.user?.name || 'Ocupado';
                const tag = prop.user?.familyMember?.family.tag;
                ctx.font = '8px sans-serif';
                ctx.fillStyle = '#fecaca';
                const displayText = tag ? `[${tag}]` : (ownerName.length > 5 ? ownerName.slice(0, 5) : ownerName);
                ctx.fillText(displayText, x + CELL_WIDTH / 2, y + 35);
            } else {
                ctx.font = '10px monospace';
                ctx.fillStyle = isHovered ? 'rgba(241, 245, 249, 0.9)' : 'rgba(100, 116, 139, 0.6)';
                ctx.fillText(`${edificio}`, x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2);
            }

            // Selection crosshairs / reticle
            if (isSelected) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                const bracketLen = 8;

                // Top-left bracket
                ctx.beginPath();
                ctx.moveTo(x - 3, y - 3 + bracketLen);
                ctx.lineTo(x - 3, y - 3);
                ctx.lineTo(x - 3 + bracketLen, y - 3);
                ctx.stroke();

                // Top-right bracket
                ctx.beginPath();
                ctx.moveTo(x + CELL_WIDTH + 3 - bracketLen, y - 3);
                ctx.lineTo(x + CELL_WIDTH + 3, y - 3);
                ctx.lineTo(x + CELL_WIDTH + 3, y - 3 + bracketLen);
                ctx.stroke();

                // Bottom-left bracket
                ctx.beginPath();
                ctx.moveTo(x - 3, y + CELL_HEIGHT + 3 - bracketLen);
                ctx.lineTo(x - 3, y + CELL_HEIGHT + 3);
                ctx.lineTo(x - 3 + bracketLen, y + CELL_HEIGHT + 3);
                ctx.stroke();

                // Bottom-right bracket
                ctx.beginPath();
                ctx.moveTo(x + CELL_WIDTH + 3 - bracketLen, y + CELL_HEIGHT + 3);
                ctx.lineTo(x + CELL_WIDTH + 3, y + CELL_HEIGHT + 3);
                ctx.lineTo(x + CELL_WIDTH + 3, y + CELL_HEIGHT + 3 - bracketLen);
                ctx.stroke();
            }
        }

        ctx.restore();
    }, [pan, zoom, propertiesMap, hoveredEdificio, selectedEdificio, onlyOccupied, currentUser.id, mapImageLoaded]);

    // Redraw whenever state changes
    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    // Convert screen coordinates to world coordinates and hit-test building
    const getBuildingAtScreenPos = useCallback((clientX: number, clientY: number): number | null => {
        if (!containerRef.current) return null;
        const rect = containerRef.current.getBoundingClientRect();
        const screenX = clientX - rect.left;
        const screenY = clientY - rect.top;

        const worldX = (screenX - pan.x) / zoom;
        const worldY = (screenY - pan.y) / zoom;

        const gridX = worldX - PADDING;
        const gridY = worldY - PADDING;

        if (gridX < 0 || gridY < 0) return null;

        const col = Math.floor(gridX / (CELL_WIDTH + CELL_GAP));
        const row = Math.floor(gridY / (CELL_HEIGHT + CELL_GAP));

        if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
            const inCellX = gridX % (CELL_WIDTH + CELL_GAP);
            const inCellY = gridY % (CELL_HEIGHT + CELL_GAP);

            if (inCellX <= CELL_WIDTH && inCellY <= CELL_HEIGHT) {
                return row * GRID_COLS + col + 1;
            }
        }

        return null;
    }, [pan, zoom]);

    // Mouse handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        lastPanRef.current = { ...pan };
        dragDistanceRef.current = 0;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            dragDistanceRef.current += Math.hypot(dx, dy);
            setPan({
                x: lastPanRef.current.x + dx,
                y: lastPanRef.current.y + dy,
            });
        } else {
            const bld = getBuildingAtScreenPos(e.clientX, e.clientY);
            setHoveredEdificio(bld);
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        setIsDragging(false);
        // If movement was minimal, consider it a click
        if (dragDistanceRef.current < 6) {
            const bld = getBuildingAtScreenPos(e.clientX, e.clientY);
            if (bld) {
                setSelectedEdificio(bld);
            }
        }
    };

    // Zoom via Wheel
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
        const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.45), 3.5);

        const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
        const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
    };

    // Touch handlers for mobile devices (Pan & Pinch-to-zoom)
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            lastPanRef.current = { ...pan };
            dragDistanceRef.current = 0;
        } else if (e.touches.length === 2) {
            setIsDragging(false);
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            pinchStartDistRef.current = dist;
            pinchStartZoomRef.current = zoom;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - dragStartRef.current.x;
            const dy = e.touches[0].clientY - dragStartRef.current.y;
            dragDistanceRef.current += Math.hypot(dx, dy);
            setPan({
                x: lastPanRef.current.x + dx,
                y: lastPanRef.current.y + dy,
            });
        } else if (e.touches.length === 2 && pinchStartDistRef.current && containerRef.current) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scaleRatio = dist / pinchStartDistRef.current;
            const newZoom = Math.min(Math.max(pinchStartZoomRef.current * scaleRatio, 0.45), 3.5);

            const rect = containerRef.current.getBoundingClientRect();
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

            const newPanX = midX - (midX - pan.x) * (newZoom / zoom);
            const newPanY = midY - (midY - pan.y) * (newZoom / zoom);

            setZoom(newZoom);
            setPan({ x: newPanX, y: newPanY });
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length === 0) {
            setIsDragging(false);
            pinchStartDistRef.current = null;
            if (dragDistanceRef.current < 10 && e.changedTouches.length === 1) {
                const bld = getBuildingAtScreenPos(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                if (bld) {
                    setSelectedEdificio(bld);
                }
            }
        }
    };

    // Zoom Buttons
    const handleZoomIn = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const newZoom = Math.min(zoom * 1.25, 3.5);
        setPan({
            x: midX - (midX - pan.x) * (newZoom / zoom),
            y: midY - (midY - pan.y) * (newZoom / zoom),
        });
        setZoom(newZoom);
    };

    const handleZoomOut = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const newZoom = Math.max(zoom * 0.8, 0.45);
        setPan({
            x: midX - (midX - pan.x) * (newZoom / zoom),
            y: midY - (midY - pan.y) * (newZoom / zoom),
        });
        setZoom(newZoom);
    };

    // Location navigation
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

    // Send Mission
    const handleSendMission = (edificioNum: number) => {
        const params = new URLSearchParams();
        params.set('ciudad', ciudad.toString());
        params.set('barrio', barrio.toString());
        params.set('edificio', edificioNum.toString());
        router.push(`/missions?${params.toString()}`);
    };

    // Copy coordinates
    const handleCopyCoords = (edificioNum: number) => {
        navigator.clipboard.writeText(`${ciudad}:${barrio}:${edificioNum}`);
        setCopiedCoords(true);
        setTimeout(() => setCopiedCoords(false), 2000);
    };

    // Hovered info
    const hoveredProperty = hoveredEdificio ? propertiesMap.get(hoveredEdificio) : null;

    return (
        <Card id="map-view-card" className={`border-border/60 bg-card/70 backdrop-blur-md shadow-xl transition-all ${isFullscreen ? 'fixed inset-2 z-50 overflow-hidden flex flex-col' : ''}`}>
            <div className="p-3 sm:p-4 space-y-3">
                {/* Navigation Bar & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-lg bg-muted/40 border border-border/50">
                    {/* Coordinate Selector */}
                    <div className="flex items-center gap-2">
                        {/* Ciudad */}
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-muted-foreground mr-1">C:</span>
                            <Button
                                id="btn-ciudad-prev"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => navigateLocation(Math.max(1, ciudad - 1), barrio)}
                                disabled={isLoading || ciudad <= 1}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                                id="input-ciudad"
                                type="number"
                                min={1}
                                max={999}
                                value={ciudad}
                                onChange={(e) => setCiudad(parseInt(e.target.value, 10) || 1)}
                                onKeyDown={(e) => e.key === 'Enter' && navigateLocation(ciudad, barrio)}
                                className="w-14 h-7 text-center text-xs font-mono font-bold"
                            />
                            <Button
                                id="btn-ciudad-next"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => navigateLocation(ciudad + 1, barrio)}
                                disabled={isLoading}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {/* Barrio */}
                        <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs font-semibold text-muted-foreground mr-1">B:</span>
                            <Button
                                id="btn-barrio-prev"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => navigateLocation(ciudad, Math.max(1, barrio - 1))}
                                disabled={isLoading || barrio <= 1}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                                id="input-barrio"
                                type="number"
                                min={1}
                                max={999}
                                value={barrio}
                                onChange={(e) => setBarrio(parseInt(e.target.value, 10) || 1)}
                                onKeyDown={(e) => e.key === 'Enter' && navigateLocation(ciudad, barrio)}
                                className="w-14 h-7 text-center text-xs font-mono font-bold"
                            />
                            <Button
                                id="btn-barrio-next"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => navigateLocation(ciudad, barrio + 1)}
                                disabled={isLoading}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <Button
                            id="btn-navigate-submit"
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => navigateLocation(ciudad, barrio)}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Explorar'}
                        </Button>
                    </div>

                    {/* Quick Shortcuts & My Properties Jump */}
                    <div className="flex items-center gap-2">
                        {currentUser.propiedades.length > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground hidden lg:inline">Mis bases:</span>
                                <div className="flex items-center gap-1 overflow-x-auto max-w-[240px]">
                                    {currentUser.propiedades.map((p) => {
                                        const isCurrent = p.ciudad === ciudad && p.barrio === barrio;
                                        return (
                                            <Button
                                                key={p.id}
                                                variant={isCurrent ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => {
                                                    if (!isCurrent) {
                                                        navigateLocation(p.ciudad, p.barrio);
                                                    }
                                                    focusOnBuilding(p.edificio);
                                                }}
                                                className={`h-7 px-2 text-[11px] font-mono whitespace-nowrap ${isCurrent ? 'border border-amber-500/50 text-amber-400' : 'text-muted-foreground'}`}
                                            >
                                                [{p.ciudad}:{p.barrio}:{p.edificio}]
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <Button
                            id="btn-toggle-filter"
                            variant="outline"
                            size="sm"
                            onClick={() => setOnlyOccupied(!onlyOccupied)}
                            className="h-7 text-xs gap-1.5"
                        >
                            {onlyOccupied ? <Eye className="h-3.5 w-3.5 text-amber-400" /> : <EyeOff className="h-3.5 w-3.5" />}
                            <span className="hidden sm:inline">{onlyOccupied ? 'Ocupadas' : 'Todas'}</span>
                        </Button>

                        <Button
                            id="btn-toggle-fullscreen"
                            variant="outline"
                            size="icon"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="h-7 w-7"
                            title={isFullscreen ? "Minimizar" : "Expandir mapa"}
                        >
                            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>

                {/* Tactical Canvas Stage */}
                <div 
                    ref={containerRef}
                    id="tactical-map-viewport"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`relative w-full rounded-lg border border-border/80 bg-slate-950 overflow-hidden select-none cursor-grab active:cursor-grabbing ${
                        isFullscreen ? 'flex-1 min-h-0' : 'aspect-[17/14] min-h-[420px] max-h-[680px]'
                    }`}
                >
                    <canvas
                        ref={canvasRef}
                        id="vendetta-tactical-canvas"
                        className="w-full h-full block"
                    />

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-30">
                            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border shadow-lg">
                                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                                <span className="text-xs font-medium text-foreground">Sincronizando sector radar [{ciudad}:{barrio}]...</span>
                            </div>
                        </div>
                    )}

                    {/* HUD Top Bar */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
                        <Badge variant="outline" className="bg-slate-900/90 backdrop-blur-md border-border text-foreground font-mono text-xs gap-1.5 px-2.5 py-1 shadow-md">
                            <MapPin className="h-3 w-3 text-amber-400" />
                            Ciudad {ciudad} · Barrio {barrio}
                        </Badge>
                        <Badge variant="outline" className="bg-slate-900/90 backdrop-blur-md border-border text-muted-foreground font-mono text-xs px-2 py-1 shadow-md">
                            {properties.length} / 255 solares ocupados
                        </Badge>
                    </div>

                    {/* HUD Hover Inspector Tooltip */}
                    {hoveredEdificio && (
                        <div className="absolute top-3 right-3 z-20 pointer-events-none hidden sm:block">
                            <div className="p-2.5 rounded-lg bg-slate-900/95 backdrop-blur-md border border-border/80 shadow-lg text-xs space-y-1 min-w-[180px]">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono font-bold text-foreground">
                                        [{ciudad}:{barrio}:{hoveredEdificio}]
                                    </span>
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[10px] py-0 px-1.5 ${
                                            hoveredProperty?.userId === currentUser.id 
                                                ? 'text-amber-400 border-amber-500/50 bg-amber-950/40' 
                                                : hoveredProperty 
                                                    ? 'text-red-400 border-red-500/50 bg-red-950/40' 
                                                    : 'text-slate-400 border-slate-700 bg-slate-900'
                                        }`}
                                    >
                                        {hoveredProperty?.userId === currentUser.id ? 'Mi Base' : hoveredProperty ? 'Ocupado' : 'Solar Libre'}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {hoveredProperty?.user?.name || 'Desocupado'}
                                    {hoveredProperty?.user?.familyMember?.family.tag && ` [${hoveredProperty.user.familyMember.family.tag}]`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Floating Zoom & Map Controls Toolbar */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-lg pointer-events-auto">
                        <TooltipProvider delayDuration={0}>
                            {myPropertyInBarrio && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            id="btn-focus-my-property"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40"
                                            onClick={() => focusOnBuilding(myPropertyInBarrio.edificio)}
                                        >
                                            <Crosshair className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">Ubicar mi propiedad (#{myPropertyInBarrio.edificio})</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        id="btn-recenter-view"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => centerView(1)}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">Centrar vista (100%)</p>
                                </TooltipContent>
                            </Tooltip>

                            <div className="h-4 w-px bg-border/80 my-auto" />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        id="btn-zoom-out"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={handleZoomOut}
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">Alejar</p>
                                </TooltipContent>
                            </Tooltip>

                            <span className="text-[11px] font-mono text-muted-foreground px-1 select-none">
                                {Math.round(zoom * 100)}%
                            </span>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        id="btn-zoom-in"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={handleZoomIn}
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">Acercar</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Bottom-left Legend */}
                    <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-border/80 text-[11px] text-muted-foreground shadow-md">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/80 border border-amber-400" />
                            <span>Mi Base</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-sm bg-red-600/80 border border-red-500" />
                            <span>Ocupado / Enemigo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-sm bg-slate-800 border border-slate-700" />
                            <span>Solar Libre</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Inspector Modal */}
            <Dialog open={selectedEdificio !== null} onOpenChange={(open) => !open && setSelectedEdificio(null)}>
                {selectedEdificio && (
                    <DialogContent className="sm:max-w-md border-border bg-card">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                    variant="outline"
                                    className={`text-xs ${
                                        isSelectedMine 
                                            ? 'text-amber-400 border-amber-500/60 bg-amber-950/40' 
                                            : selectedProperty 
                                                ? 'text-red-400 border-red-500/60 bg-red-950/40' 
                                                : 'text-slate-400 border-slate-700 bg-slate-900'
                                    }`}
                                >
                                    {isSelectedMine ? 'Tu Propiedad' : selectedProperty ? 'Propiedad Rival' : 'Solar Desocupado'}
                                </Badge>
                                <span className="font-mono text-xs text-muted-foreground">
                                    Edificio #{selectedEdificio}
                                </span>
                            </div>

                            <DialogTitle className="text-lg font-bold">
                                [{ciudad}:{barrio}:{selectedEdificio}]
                            </DialogTitle>

                            <DialogDescription className="text-xs text-muted-foreground">
                                {selectedProperty ? (
                                    isSelectedMine 
                                        ? `Esta base te pertenece ("${selectedProperty.nombre}").` 
                                        : `Esta propiedad está bajo control de ${selectedProperty.user?.name || 'un rival'}.`
                                ) : (
                                    "Este solar está disponible para ser colonizado mediante una misión de ocupación."
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-md bg-muted/40 border border-border/50">
                                    <span className="text-[10px] text-muted-foreground block">Propietario</span>
                                    <p className="font-semibold text-foreground mt-0.5 truncate">
                                        {selectedProperty?.user?.name || 'Desocupado'}
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-md bg-muted/40 border border-border/50">
                                    <span className="text-[10px] text-muted-foreground block">Familia</span>
                                    <p className="font-semibold text-foreground mt-0.5 truncate">
                                        {selectedProperty?.user?.familyMember ? (
                                            `${selectedProperty.user.familyMember.family.name} [${selectedProperty.user.familyMember.family.tag}]`
                                        ) : (
                                            'Sin familia'
                                        )}
                                    </p>
                                </div>
                            </div>

                            {selectedProperty && (
                                <div className="p-2.5 rounded-md bg-muted/20 border border-border/40 space-y-1">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-muted-foreground">Nombre de Base:</span>
                                        <span className="font-medium text-foreground">{selectedProperty.nombre}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-muted-foreground">Sector:</span>
                                        <span className="font-mono text-foreground">Ciudad {ciudad}, Barrio {barrio}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between items-center pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    id="btn-copy-coords"
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyCoords(selectedEdificio)}
                                    className="h-8 text-xs gap-1.5 flex-1 sm:flex-none"
                                >
                                    {copiedCoords ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                                            ¡Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            Copiar Coords
                                        </>
                                    )}
                                </Button>

                                {selectedProperty?.userId && !isSelectedMine && (
                                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1">
                                        <Link href={`/profile/${selectedProperty.userId}`}>
                                            Ver Perfil
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
                                        Cerrar
                                    </Button>
                                </DialogClose>

                                <Button
                                    id="btn-modal-send-mission"
                                    size="sm"
                                    onClick={() => handleSendMission(selectedEdificio)}
                                    className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    Enviar Misión
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </Card>
    );
}
