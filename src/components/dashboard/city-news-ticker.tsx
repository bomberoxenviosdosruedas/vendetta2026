'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Newspaper, 
    Radio, 
    Flame, 
    ShieldAlert, 
    TrendingUp, 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Pause, 
    Play, 
    RefreshCw, 
    AlertTriangle, 
    Building2, 
    Crosshair, 
    Zap, 
    Eye,
    Maximize2,
    SlidersHorizontal,
    Volume2,
    ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem 
} from '@/components/ui/dropdown-menu';

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
    impactLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'INFORMATIVO';
    gameWorldImpact: string;
    minutesAgo: number;
    isBreaking?: boolean;
}

const INITIAL_NEWS_ITEMS: NewsItem[] = [
    {
        id: 'news-1',
        headline: 'Tiroteo en los muelles de Little Italy sacude la madrugada',
        summary: 'Un intercambio de disparos con armas automáticas en el almacén 14 deja dos camiones blindados calcinados y la policía desconcertada.',
        fullReport: 'Cerca de las 03:30 AM, vecinos del sector portuario reportaron ráfagas de subfusil Thompson procedentes de las inmediaciones del muelle 4. Según fuentes no oficiales, una disputa por un cargamento de munición pesada entre cuadrillas locales culminó con la intervención de coches blindados sin matrícula. La policía acordonó el área encontrando casquillos de grueso calibre y rastros de cargamentos transportados apresuradamente en lanchas rápidas hacia aguas abiertas.',
        category: 'BAJO_MUNDO',
        source: 'La Gazzetta di Vendetta',
        district: 'Distrito Portuario',
        coordinates: '1:4:12',
        impactLevel: 'CRITICO',
        gameWorldImpact: 'Tensión armada en aumento en muelles (+10% alerta)',
        minutesAgo: 4,
        isBreaking: true,
    },
    {
        id: 'news-2',
        headline: 'Redada sorpresa de la Policía Metropolitana en casinos clandestinos',
        summary: 'El comisario Moretti ordena clausurar tres salones de juego no autorizados en el corazón financiero. No hubo detenidos de alto rango.',
        fullReport: 'En un operativo simultáneo ejecutado por más de 40 agentes con apoyo de la brigada de asalto, se intervinieron tres locales que operaban bajo la fachada de clubes de billar y sastrerías de lujo. A pesar del despliegue, la caja fuerte principal fue vaciada minutos antes de la llegada policial, lo que refuerza las sospechas de soplos internos en el departamento de justicia.',
        category: 'POLICIAL',
        source: 'Radio Policía 104.2 FM',
        district: 'Centro Financiero',
        coordinates: '1:1:5',
        impactLevel: 'ALTO',
        gameWorldImpact: 'Vigilancia bancaria incrementada (+15% patrullaje)',
        minutesAgo: 18,
        isBreaking: true,
    },
    {
        id: 'news-3',
        headline: 'Escasez de armamento de precisión dispara los precios en el mercado negro',
        summary: 'Los intermediarios clandestinos informan de interrupciones en los convoyes transfronterizos, encareciendo los rifles y subfusiles.',
        fullReport: 'El cierre temporal de las rutas ferroviarias del este debido a inspecciones extraordinarias ha colapsado el flujo habitual de cajones de armamento. Proveedores de los callejones advierten que el coste por kilo de pólvora y piezas mecanizadas podría mantenerse elevado durante las próximas semanas hasta que se habiliten pasos alternativos.',
        category: 'MERCADO_NEGRO',
        source: 'El Heraldo Clandestino',
        district: 'Zona Industrial Este',
        coordinates: '2:3:8',
        impactLevel: 'MEDIO',
        gameWorldImpact: 'Precios de armas en mercado negro volátiles',
        minutesAgo: 32,
    },
    {
        id: 'news-4',
        headline: 'Cónclave secreto de caporegimes en una hacienda a las afueras',
        summary: 'Testigos observaron caravanas de limusinas negras convergiendo en las colinas. Rumores de un nuevo pacto de no agresión territorial.',
        fullReport: 'Diversos patriarcas de las familias más influyentes habrían mantenido una reunión a puerta cerrada durante más de cuatro horas. Aunque los detalles del cónclave permanecen bajo estricto voto de silencio, informantes afirman que se discutió la repartición de los contratos portuarios y la neutralidad de los barrios residenciales.',
        category: 'RUMORES',
        source: 'El Correo de la Sombra',
        district: 'Colinas del Norte',
        coordinates: '3:2:1',
        impactLevel: 'ALTO',
        gameWorldImpact: 'Pactos entre familias en estado de negociación',
        minutesAgo: 45,
    },
    {
        id: 'news-5',
        headline: 'Fuga masiva frustrada en la prisión de máxima seguridad de Sing-Rock',
        summary: 'La detonación de un explosivo plástico en el muro oeste desata la alarma general. Varios líderes de bandas intentaban coordinar la evasión.',
        fullReport: 'A medianoche, un artefacto de baja potencia detonó contra la pared exterior del pabellón B. Los guardias de las torres repelieron de inmediato a los cómplices que esperaban en furgones blindados. Las autoridades han decretado confinamiento absoluto de todos los reclusos hasta nuevo aviso.',
        category: 'POLICIAL',
        source: 'Crónica Judicial Urbana',
        district: 'Isla de la Penitenciaría',
        coordinates: '1:9:9',
        impactLevel: 'MEDIO',
        gameWorldImpact: 'Refuerzos en prisiones y traslados de custodias',
        minutesAgo: 62,
    },
    {
        id: 'news-6',
        headline: 'Huelga del sindicato de estibadores paraliza la carga de mercancías',
        summary: 'Los obreros del puerto bloquean las grúas exigiendo primas de riesgo tras los continuos asaltos nocturnos a los depósitos aduaneros.',
        fullReport: 'Más de quinientos trabajadores han secundado el paro laboral en las terminales marítimas. Los representantes sindicales reclaman mayor seguridad privada y garantías salariales. Mientras tanto, decenas de buques de carga aguardan fondeados en la bahía a la espera de poder atracar.',
        category: 'MERCADO_NEGRO',
        source: 'Boletín Obrero & Portuario',
        district: 'Muelles del Sur',
        coordinates: '1:5:2',
        impactLevel: 'MEDIO',
        gameWorldImpact: 'Retrasos en suministros marítimos (-5% velocidad)',
        minutesAgo: 85,
    },
    {
        id: 'news-7',
        headline: 'Apertura clandestina del cabaret "El Faraón": Oro y ruleta tras bambalinas',
        summary: 'El club nocturno de moda atrae a magnates y gánsteres por igual, sirviendo champán francés y partidas de póker con apuestas millonarias.',
        fullReport: 'Bajo el manto de un club de jazz exclusivo con orquesta en vivo, "El Faraón" esconde en sus sótanos una de las mesas de ruleta más suntuosas de la ciudad. Agentes de incógnito admiten la dificultad de intervenir el recinto dada la concurrencia de senadores y altos funcionarios entre sus clientes habituales.',
        category: 'BAJO_MUNDO',
        source: 'La Noche y el Neón',
        district: 'Distrito de Entretenimiento',
        coordinates: '2:1:14',
        impactLevel: 'INFORMATIVO',
        gameWorldImpact: 'Flujo de dinero circulante en locales nocturnos',
        minutesAgo: 110,
    },
    {
        id: 'news-8',
        headline: 'Falsificadores introducen billetes de alta denominación en la zona comercial',
        summary: 'Comerciantes del centro alertan sobre papel moneda falsificado con sellos bancarios casi idénticos a los oficiales.',
        fullReport: 'Los peritos de la reserva monetaria han emitido una circular advirtiendo a las entidades de crédito sobre la circulación de series apócrifas de cien dólares. Se sospecha de una imprenta industrial oculta en algún sótano de los suburbios industriales.',
        category: 'MERCADO_NEGRO',
        source: 'El Heraldo Financiero',
        district: 'Bulevar Central',
        coordinates: '1:2:7',
        impactLevel: 'ALTO',
        gameWorldImpact: 'Inspecciones estrictas en transacciones de dinero',
        minutesAgo: 135,
    },
];

const CATEGORY_LABELS: Record<NewsCategory, { label: string; color: string; icon: React.ReactNode }> = {
    TODAS: { label: 'Todas las Noticias', color: 'bg-zinc-800 text-zinc-200 border-zinc-700', icon: <Newspaper className="h-3.5 w-3.5" /> },
    BAJO_MUNDO: { label: 'Bajo Mundo', color: 'bg-amber-950/60 text-amber-300 border-amber-800/60', icon: <Flame className="h-3.5 w-3.5" /> },
    POLICIAL: { label: 'Ley y Orden', color: 'bg-blue-950/60 text-blue-300 border-blue-800/60', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
    MERCADO_NEGRO: { label: 'Mercado Negro', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    RUMORES: { label: 'Rumores & Inteligencia', color: 'bg-purple-950/60 text-purple-300 border-purple-800/60', icon: <Radio className="h-3.5 w-3.5" /> },
};

const CATEGORIES: NewsCategory[] = ['TODAS', 'BAJO_MUNDO', 'POLICIAL', 'MERCADO_NEGRO', 'RUMORES'];

export function CityNewsCard() {
    const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS_ITEMS);
    const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('TODAS');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [selectedNewsDetail, setSelectedNewsDetail] = useState<NewsItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter items according to selected category
    const filteredNews = useMemo(() => {
        if (selectedCategory === 'TODAS') return news;
        return news.filter(item => item.category === selectedCategory);
    }, [news, selectedCategory]);

    // Ensure valid index when category changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [selectedCategory]);

    const activeItem = filteredNews[currentIndex] || filteredNews[0] || news[0];

    const handleNext = useCallback(() => {
        if (filteredNews.length === 0) return;
        setCurrentIndex(prev => (prev + 1) % filteredNews.length);
    }, [filteredNews.length]);

    const handlePrev = useCallback(() => {
        if (filteredNews.length === 0) return;
        setCurrentIndex(prev => (prev - 1 + filteredNews.length) % filteredNews.length);
    }, [filteredNews.length]);

    // Auto-advance ticker timer (every 7 seconds)
    useEffect(() => {
        if (!isAutoPlay || filteredNews.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 7000);

        return () => clearInterval(interval);
    }, [isAutoPlay, filteredNews.length, handleNext]);

    // Handle wire refresh / new dispatch
    const handleRefreshWire = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setNews(prev => {
                const updated = [...prev];
                const first = updated.shift();
                if (first) updated.push(first);
                return updated;
            });
            setIsRefreshing(false);
            setCurrentIndex(0);
        }, 600);
    };

    const getImpactBadge = (level: NewsItem['impactLevel']) => {
        switch (level) {
            case 'CRITICO':
                return <Badge variant="destructive" className="bg-red-900/90 text-red-200 border-red-700/80 animate-pulse">CRÍTICO</Badge>;
            case 'ALTO':
                return <Badge className="bg-amber-900/90 text-amber-200 border-amber-700/80">ALTA RELEVANCIA</Badge>;
            case 'MEDIO':
                return <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">MODERADO</Badge>;
            default:
                return <Badge variant="outline" className="text-zinc-400 border-zinc-700">INFORMATIVO</Badge>;
        }
    };

    return (
        <Card className="border-border/60 bg-gradient-to-b from-card to-card/70 shadow-lg relative overflow-hidden" id="city-news-card">
            {/* Top decorative subtle wire indicator line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-red-600/40 via-amber-500/40 to-transparent" />

            {/* Header */}
            <CardHeader className="p-4 pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-md bg-red-950/70 border border-red-800/60 flex items-center justify-center text-red-400 shadow-inner">
                            <Newspaper className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-bold font-heading tracking-wide uppercase text-zinc-100 flex items-center gap-2">
                                    La Gazzetta di Vendetta
                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-normal tracking-normal text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                                        TELETIPO EN VIVO
                                    </span>
                                </CardTitle>
                            </div>
                            <CardDescription className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                                <span>Crónica urbana, movimientos policiales y rumores del bajo mundo</span>
                            </CardDescription>
                        </div>
                    </div>

                    {/* Quick ticker controls - simplified on mobile */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {/* Category filter - dropdown on mobile, tabs on desktop */}
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                {CATEGORIES.map(cat => {
                                    const isSelected = selectedCategory === cat;
                                    const config = CATEGORY_LABELS[cat];
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all whitespace-nowrap ${
                                                isSelected 
                                                    ? `${config.color} ring-1 ring-white/20 shadow-sm` 
                                                    : 'bg-background/40 text-zinc-400 border-white/5 hover:bg-white/5 hover:text-zinc-200'
                                            }`}
                                        >
                                            {config.icon}
                                            {config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Mobile category dropdown */}
                        <div className="sm:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="h-8 px-3 text-xs font-medium bg-background/40 border-white/5 hover:bg-white/5"
                                    >
                                        <Newspaper className="h-3.5 w-3.5 mr-1" />
                                        {CATEGORY_LABELS[selectedCategory].label}
                                        <ChevronDown className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    {CATEGORIES.map(cat => {
                                        const isSelected = selectedCategory === cat;
                                        const config = CATEGORY_LABELS[cat];
                                        return (
                                            <DropdownMenuItem
                                                key={cat}
                                                onSelect={() => setSelectedCategory(cat)}
                                                className={`flex items-center gap-2 px-2 py-1.5 text-sm ${
                                                    isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-sidebar-accent'
                                                }`}
                                            >
                                                {config.icon}
                                                <span>{config.label}</span>
                                                {isSelected && <span className="ml-auto text-primary">✓</span>}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Play/Pause & Navigation - only on desktop */}
                        <div className="hidden sm:flex items-center gap-1.5 ml-2">
                            <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-7 w-7 text-zinc-400 hover:text-white border-white/10 hover:bg-white/5"
                                            onClick={handleRefreshWire}
                                            disabled={isRefreshing}
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">Sintonizar nueva frecuencia de teletipo</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-7 w-7 text-zinc-400 hover:text-white border-white/10 hover:bg-white/5"
                                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                                        >
                                            {isAutoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">{isAutoPlay ? 'Pausar avance automático' : 'Reanudar avance automático'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="flex items-center rounded-md border border-white/10 bg-background/50 p-0.5">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/10"
                                    onClick={handlePrev}
                                    disabled={filteredNews.length <= 1}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <span className="text-[11px] font-mono px-1.5 text-zinc-400">
                                    {filteredNews.length > 0 ? `${currentIndex + 1}/${filteredNews.length}` : '0/0'}
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/10"
                                    onClick={handleNext}
                                    disabled={filteredNews.length <= 1}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Active Ticker Story Body */}
            <CardContent className="p-4 space-y-3">
                {activeItem ? (
                    <div 
                        className="group relative rounded-lg border border-border/40 bg-zinc-950/60 p-3.5 hover:border-border/80 transition-all cursor-pointer"
                        onClick={() => setSelectedNewsDetail(activeItem)}
                    >
                        {/* Status bar top row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {activeItem.isBreaking && (
                                    <span className="inline-flex items-center gap-1 font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-red-600 text-white shadow-sm animate-pulse">
                                        <Zap className="h-3 w-3 fill-current" />
                                        Última Hora
                                    </span>
                                )}
                                <span className={`text-[11px] px-2 py-0.5 rounded border ${CATEGORY_LABELS[activeItem.category].color}`}>
                                    {CATEGORY_LABELS[activeItem.category].label}
                                </span>
                                {getImpactBadge(activeItem.impactLevel)}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                                <span className="flex items-center gap-1 font-mono">
                                    <Clock className="h-3 w-3 text-zinc-500" />
                                    Hace {activeItem.minutesAgo} min
                                </span>
                                {activeItem.coordinates && (
                                    <span className="flex items-center gap-1 font-mono bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300">
                                        <Crosshair className="h-3 w-3 text-amber-500/80" />
                                        [{activeItem.coordinates}]
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Main headline */}
                        <h4 className="text-base font-bold text-zinc-100 group-hover:text-primary transition-colors leading-snug">
                            {activeItem.headline}
                        </h4>

                        {/* Summary description */}
                        <p className="text-xs text-zinc-300/90 leading-relaxed mt-1.5">
                            {activeItem.summary}
                        </p>

                        {/* Footer info: Source & World Impact */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-white/5 text-[11px]">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <span className="font-semibold text-zinc-300">{activeItem.source}</span>
                                <span>•</span>
                                <span className="text-zinc-400">{activeItem.district}</span>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2">
                                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-amber-300/90 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40">
                                    <TrendingUp className="h-3 w-3 text-amber-400" />
                                    {activeItem.gameWorldImpact}
                                </span>
                                <span className="text-primary text-[11px] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                    Leer informe
                                    <ChevronRight className="h-3 w-3" />
                                </span>
                            </div>
                        </div>

                        {/* Auto-play progress bar indicator */}
                        {isAutoPlay && filteredNews.length > 1 && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800 rounded-b-lg overflow-hidden">
                                <div 
                                    key={`${activeItem.id}-${currentIndex}`}
                                    className="h-full bg-red-600/70 animate-[progress_7s_linear_infinite]"
                                    style={{
                                        animationDuration: '7s',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6 text-sm text-zinc-400">
                        No hay noticias en esta sección en este momento.
                    </div>
                )}

                {/* Secondary Wire Headlines Carousel / Quick Feed */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {filteredNews
                        .filter(item => item.id !== activeItem?.id)
                        .slice(0, 3)
                        .map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedNewsDetail(item)}
                                className="p-2.5 rounded border border-border/30 bg-background/40 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                                        <span className="font-semibold text-zinc-300 truncate max-w-[120px]">{item.source}</span>
                                        <span className="font-mono">hace {item.minutesAgo}m</span>
                                    </div>
                                    <p className="text-xs font-medium text-zinc-200 line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.headline}
                                    </p>
                                </div>
                                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                                    <span className="truncate max-w-[130px]">{item.district}</span>
                                    <span className="text-primary font-medium flex items-center">
                                        Detalles
                                        <ChevronRight className="h-2.5 w-2.5" />
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </CardContent>

            {/* Modal Dialog for Full Investigative Report */}
            <Dialog open={!!selectedNewsDetail} onOpenChange={open => !open && setSelectedNewsDetail(null)}>
                <DialogContent className="max-w-md md:max-w-lg border-border/80 bg-card text-card-foreground">
                    {selectedNewsDetail && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${CATEGORY_LABELS[selectedNewsDetail.category].color}`}>
                                        {CATEGORY_LABELS[selectedNewsDetail.category].label}
                                    </span>
                                    {getImpactBadge(selectedNewsDetail.impactLevel)}
                                </div>
                                <DialogTitle className="text-lg font-bold font-heading text-zinc-100 leading-snug">
                                    {selectedNewsDetail.headline}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-zinc-400 flex items-center gap-2 pt-1">
                                    <span>{selectedNewsDetail.source}</span>
                                    <span>•</span>
                                    <span>{selectedNewsDetail.district}</span>
                                    {selectedNewsDetail.coordinates && (
                                        <>
                                            <span>•</span>
                                            <span className="font-mono text-zinc-300">[{selectedNewsDetail.coordinates}]</span>
                                        </>
                                    )}
                                    <span>•</span>
                                    <span className="font-mono">Publicado hace {selectedNewsDetail.minutesAgo} min</span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 py-2 text-sm text-zinc-200">
                                <div className="p-3 rounded-md bg-zinc-950/70 border border-border/50 text-xs italic text-zinc-300 leading-relaxed">
                                    &ldquo;{selectedNewsDetail.summary}&rdquo;
                                </div>

                                <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
                                    <p className="font-semibold text-zinc-100 uppercase tracking-wider text-[11px]">
                                        Informe Completo del Teletipo:
                                    </p>
                                    <p className="text-justify leading-relaxed">
                                        {selectedNewsDetail.fullReport}
                                    </p>
                                </div>

                                <div className="p-2.5 rounded border border-amber-900/40 bg-amber-950/20 text-xs flex items-start gap-2.5">
                                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-amber-200">Efecto en el Mundo de Juego:</p>
                                        <p className="text-amber-300/90 text-[11px] mt-0.5">{selectedNewsDetail.gameWorldImpact}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2 border-t border-border/40">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSelectedNewsDetail(null)}
                                    className="border-white/10 hover:bg-white/5 text-xs"
                                >
                                    Cerrar Despacho
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}