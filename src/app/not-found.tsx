import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-950/60 border border-red-800/80 text-red-500 mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-zinc-100 font-heading">404 - Territorio Desconocido</h1>
      <p className="mt-2 text-sm text-zinc-400 max-w-md">
        Te has adentrado en un callejón sin salida de la ciudad. Este distrito no existe o ha sido arrasado por una familia rival.
      </p>
      <div className="mt-6">
        <Button asChild variant="outline" className="border-red-800/60 hover:bg-red-950/50 text-zinc-100">
          <Link href="/overview">Regresar al Cuartel General</Link>
        </Button>
      </div>
    </div>
  );
}
