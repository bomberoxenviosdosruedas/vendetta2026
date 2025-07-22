

import { SuperAuthForm } from "@/components/super-auth-form";
import { getSuperUserSession } from "@/lib/auth-super";
import { redirect } from "next/navigation";

export default async function GatePage() {
    const isSuperUser = await getSuperUserSession();

    if (isSuperUser) {
        redirect('/login');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <SuperAuthForm />
        </div>
    );
}

    