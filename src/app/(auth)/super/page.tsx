
import { SuperAuthForm } from "@/components/super-auth-form";
import { getSuperUserSession } from "@/lib/auth-super";
import { redirect } from "next/navigation";

export default async function SuperAuthPage() {
    const isSuperUser = await getSuperUserSession();

    if (isSuperUser) {
        redirect('/');
    }

    return <SuperAuthForm />;
}
