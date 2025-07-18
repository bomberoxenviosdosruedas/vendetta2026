
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateOrJoinFamilyView } from "@/components/dashboard/family/create-or-join-family-view";
import { FamilyDashboardView } from "@/components/dashboard/family/family-dashboard-view";
import { getUserFamily } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

function FamilyLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

export default async function FamilyPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    // Check if the user is already in a family
    if (user.familyMember && user.familyMember.familyId) {
         const family = await getUserFamily(user.id);
        if (family) {
             return (
                <Suspense fallback={<FamilyLoading />}>
                    <FamilyDashboardView family={family} currentUser={user} />
                </Suspense>
            );
        }
    }

    // If not in a family, show the create/join view
    return (
        <Suspense fallback={<FamilyLoading />}>
            <CreateOrJoinFamilyView />
        </Suspense>
    )
}
