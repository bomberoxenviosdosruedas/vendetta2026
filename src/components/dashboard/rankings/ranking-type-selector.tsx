
'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export function RankingTypeSelector() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '0');

    const handleShow = () => {
        const params = new URLSearchParams(searchParams);
        params.set('type', selectedType);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <form action={handleShow} className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Seleccionar tipo de ranking..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Jugadores</SelectItem>
                    <SelectItem value="1">Familias</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit">Mostrar</Button>
        </form>
    );
}

