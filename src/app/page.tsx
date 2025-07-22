
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
    const user = await getSessionUser();

    if(user) {
        redirect('/overview');
    } else {
        redirect('/login');
    }
}
