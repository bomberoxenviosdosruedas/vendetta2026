import { redirect } from "next/navigation";

export default function GatePage() {
    // Setup de prueba: auto-login fijo como bomberox (middleware en dev)
    redirect('/overview');
}