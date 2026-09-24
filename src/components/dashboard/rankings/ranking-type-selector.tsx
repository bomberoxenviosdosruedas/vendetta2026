'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export function RankingTypeSelector() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '0');

    const handleShow = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        params.set('type', selectedType);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <form onSubmit={handleShow} className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[200px] bg-[#eee8d5] border-[#4a3e29] text-[#111] font-bold text-xs h-9">
                    <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1711] border-[#4a3e2b] text-[#dfdbc9]">
                    <SelectItem value="0">Jugadores</SelectItem>
                    <SelectItem value="1">Familias</SelectItem>
                </SelectContent>
            </Select>
            <button type="submit" className="retro-btn text-xs font-bold px-3 py-1.5 min-h-[44px]">
                MOSTRAR
            </button>
        </form>
    );
}
