import { NextRequest, NextResponse } from "next/server";
import { procesarTickMasivo } from "@/lib/actions/user.actions";

export const dynamic = 'force-dynamic';

/**
 * Ruta de cron para actualizar automáticamente puntuación, tropas, colas y
 * recursos de TODOS los usuarios sin que necesiten iniciar sesión.
 *
 * - En Vercel se invoca según `vercel.json` → `crons` (cada minuto).
 * - Autorización: la cabecera `x-vercel-cron: 1` (la envía el scheduler de Vercel)
 *   o `Authorization: Bearer <CRON_SECRET>` para triggers manuales/local.
 */
export async function GET(request: NextRequest) {
    const esCronVercel = request.headers.get('x-vercel-cron') === '1';
    const secret = process.env.CRON_SECRET;
    const authorization = request.headers.get('authorization');

    const autorizado = esCronVercel || (secret ? authorization === `Bearer ${secret}` : false);

    if (!autorizado) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const resultado = await procesarTickMasivo({ marcarVisto: false });
        return NextResponse.json({ ok: true, ...resultado });
    } catch (error) {
        console.error('[Cron-Tick] Error ejecutando el tick automático:', error);
        return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
    }
}