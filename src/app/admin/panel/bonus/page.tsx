
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminSession } from "@/lib/auth-admin";
import { getTroopBonusConfig, getTroopConfigurations } from "@/lib/data";
import { redirect } from "next/navigation";
import { BonusConfigMatrix } from "@/components/admin/bonus-config-matrix";

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

    const troops = await getTroopConfigurations();
    const bonusConfig = await getTroopBonusConfig();

    return (
        <Suspense fallback={<BonusLoading />}>
            <BonusConfigMatrix 
                troops={troops} 
                initialBonusConfig={bonusConfig}
            />
        </Suspense>
    );
}
