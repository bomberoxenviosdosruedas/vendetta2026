import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/material-icon';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#080808] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center bg-[#2a0d0d] border border-[#a02020] text-red-500 mb-4">
        <MaterialIcon name="warning" size={32} />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-zinc-100 font-heading">404 - Territorio Desconocido</h1>
      <p className="mt-2 text-sm text-zinc-400 max-w-md">
        Te has adentrado en un callejÃ³n sin salida de la ciudad. Este distrito no existe o ha sido arrasado por una familia rival.
      </p>
      <div className="mt-6">
        <Button asChild variant="outline" className="border-red-800/60 hover:bg-red-950/50 text-zinc-100">
          <Link href="/overview">Regresar al Cuartel General</Link>
        </Button>
      </div>
    </div>
  );
}
