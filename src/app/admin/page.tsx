

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const isAdmin = await getAdminSession();

    if (isAdmin) {
        redirect('/admin/panel');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <AdminLoginForm />
        </div>
    );
}
