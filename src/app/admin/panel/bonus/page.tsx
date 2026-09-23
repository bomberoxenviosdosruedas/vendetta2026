

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminSession } from "@/lib/auth-admin";
import { getTroopBonusConfig, getTroopConfigurations } from "@/lib/data";
import { redirect } from "next/navigation";
import { BonusConfigMatrix } from "@/components/admin/bonus-config-matrix";
import { TipoTropa } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

function BonusLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    );
}

export default async function BonusConfigPage() {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
        redirect('/admin');
    }

    const allTroops = await getTroopConfigurations();
    const bonusConfig = await getTroopBonusConfig();

    const defenseOrder = ["trabajador_ilegal", "centinela", "policia", "guardaespaldas", "guardia_de_honor"];
    const attackOrder = ["maton", "portero", "acuchillador", "pistolero", "ocupacion", "espia", "porteador", "cia", "fbi", "transportista", "francotirador", "asesino", "ninja", "mercenario"];
    
    const attackTroops = allTroops
        .filter(t => t.tipo === TipoTropa.ATAQUE || t.tipo === 'OCUPAR' || t.tipo === 'ESPIONAJE' || t.tipo === 'TRANSPORTE')
        .sort((a, b) => attackOrder.indexOf(a.id) - attackOrder.indexOf(b.id));

    const defenseTroops = allTroops
        .filter(t => t.tipo === TipoTropa.DEFENSA)
        .sort((a, b) => defenseOrder.indexOf(a.id) - defenseOrder.indexOf(b.id));

    return (
        <div className="space-y-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/panel">
                    <MaterialIcon name="arrow_back" className="mr-2" size={16} />
                    Volver al Panel Principal
                </Link>
            </Button>
            <Suspense fallback={<BonusLoading />}>
                <BonusConfigMatrix 
                    attackTroops={attackTroops}
                    defenseTroops={defenseTroops}
                    initialBonusConfig={bonusConfig}
                />
            </Suspense>
        </div>
    );
}
