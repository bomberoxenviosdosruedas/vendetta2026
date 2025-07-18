
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/dashboard/settings-view";

function SettingsLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        </div>
    )
}


export default async function SettingsPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    return (
        <div className="main-view">
            <Suspense fallback={<SettingsLoading />}>
                <SettingsView user={user} />
            </Suspense>
        </div>
    );
}

// Added Card components to skeleton for more accurate loading representation
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
