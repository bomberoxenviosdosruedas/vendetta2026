'use client'

import Image from "next/image"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, PlusCircle, Ban, Info } from "lucide-react"
import { iniciarReclutamiento } from "@/lib/actions/troop.actions"
import { useEffect, useState } from "react"
import type { ConfiguracionTropa } from "@prisma/client"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Terminal } from "lucide-react"
import { Input } from "../ui/input"
import type { UserWithProgress } from "@/lib/data"
import { useProperty } from "@/contexts/property-context"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { TroopDetailsModal } from "./troop-details-modal"

function formatNumber(num: number): string {
    return num.toLocaleString('de-DE');
}

function formatDuration(seconds: number): string {
    if (seconds <= 0) return "0s";

    const units: {name: string, seconds: number}[] = [
        { name: 'año', seconds: 31536000 },
        { name: 'sem', seconds: 604800 },
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

type TroopWithStats = ConfiguracionTropa & {
    ataqueActual: number;
    defensaActual: number;
}

type RecruitmentViewProps = {
    troopConfigsWithStats: TroopWithStats[];
    user: UserWithProgress;
}

function RecruitmentQueueAlert() {
    const { selectedProperty } = useProperty();
    const [tiempoRestante, setTiempoRestante] = useState("");
    const colaReclutamiento = selectedProperty?.colaReclutamiento;

    useEffect(() => {
        if (!colaReclutamiento) return;

        const interval = setInterval(() => {
            const ahora = new Date().getTime();
            const fin = new Date(colaReclutamiento.fechaFinalizacion).getTime();
            const diferencia = Math.max(0, fin - ahora);
            setTiempoRestante(formatDuration(Math.floor(diferencia / 1000)));
        }, 1000);

        return () => clearInterval(interval);
    }, [colaReclutamiento]);

    if (!selectedProperty || !colaReclutamiento) return null;

    return (
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Reclutamiento en curso en {selectedProperty?.nombre}</AlertTitle>
            <AlertDescription>
                Reclutando {colaReclutamiento.cantidad} x {colaReclutamiento.tropaConfig.nombre}. Tiempo restante: {tiempoRestante}
            </AlertDescription>
        </Alert>
    )
}

function TroopForm({ troopId }: { troopId: string }) {
    const { selectedProperty } = useProperty();
    const [cantidad, setCantidad] = useState(1);
    const [error, setError] = useState('');
    const [isPending, setIsPending] = useState(false);
    
    const colaReclutamientoActiva = !!selectedProperty?.colaReclutamiento;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty) return;

        setError('');
        setIsPending(true);

        const result = await iniciarReclutamiento(selectedProperty.id, troopId, cantidad);
        
        if (result?.error) {
            setError(result.error);
        }

        setIsPending(false);
    }
    
    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input 
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))