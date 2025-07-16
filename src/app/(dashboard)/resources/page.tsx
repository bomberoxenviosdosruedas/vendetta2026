
import { ResourcesView } from "@/components/dashboard/resources-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

function ResourcesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2 shimmer" />
          <Skeleton className="h-4 w-80 shimmer" />
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <div className="space-y-4">
            <Skeleton className="h-10 w-full shimmer" />
            <Skeleton className="h-10 w-full shimmer" />
            <Skeleton className="h-10 w-full shimmer" />
            <Skeleton className="h-10 w-full shimmer" />
        </div>
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <div className="main-view">
      <Suspense fallback={<ResourcesLoading />}>
        <ResourcesView />
      </Suspense>
    </div>
  )
}
