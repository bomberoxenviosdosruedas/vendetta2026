
import { ResourcesView } from "@/components/dashboard/resources-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

function ResourcesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <div className="flex flex-col space-y-4">
      <Suspense fallback={<ResourcesLoading />}>
        <ResourcesView />
      </Suspense>
    </div>
  )
}
