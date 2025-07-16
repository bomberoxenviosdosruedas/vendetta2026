
import { RoomsView } from "@/components/dashboard/rooms-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getSessionUser } from "@/lib/auth"
import { getRoomConfigurations } from "@/lib/data"
import { redirect } from "next/navigation"

function RoomsLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <div className="border rounded-lg p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-14 w-20 rounded-md" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-md" />
                 </div>
            ))}
        </div>
      </div>
    )
  }

export default async function RoomsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const allRoomConfigs = await getRoomConfigurations();

  return (
    <div className="flex flex-col space-y-4">
      <Suspense fallback={<RoomsLoading />}>
          <RoomsView user={user} allRoomConfigs={allRoomConfigs} />
      </Suspense>
    </div>
  )
}
