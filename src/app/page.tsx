import { redirect } from "next/navigation";

export default function GatePage() {
    // Setup de prueba: auto-login fijo como bomberox (proxy.ts en cualquier entorno)
    redirect('/overview');
}