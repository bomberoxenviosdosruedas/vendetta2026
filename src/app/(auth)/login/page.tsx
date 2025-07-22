
'use client'

import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

function AuthLoading() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}


export default function LoginPage() {

  return (
    <Suspense fallback={<AuthLoading />}>
        <AuthForm />
    </Suspense>
  );
}
