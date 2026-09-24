'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFamily } from "@/lib/actions/family.actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import MaterialIcon from "@/components/ui/material-icon";
import Link from "next/link";

export function CreateOrJoinFamilyView() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleCreateFamily = async (formData: FormData) => {
        startTransition(async () => {
            const result = await createFamily(formData);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: '¡Éxito!', description: result.success });
            }
        });
    };

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        ÚNETE O FUNDA UNA FAMILIA
                    </span>
                </div>

                <div className="p-3 bg-[#dfdbc9] grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                    <form action={handleCreateFamily} className="v-outer-frame p-3 bg-[#f1ebda] space-y-3">
                        <div className="v-header-c -mx-3 -mt-3 mb-2">Funda tu Propia Familia</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="name" className="text-xs font-bold text-[#221c13]">Nombre de la Familia</Label>
                                <Input id="name" name="name" placeholder="Los Corleone" required disabled={isPending} className="bg-[#eee8d5] border-[#4a3e29] text-[#111]" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tag" className="text-xs font-bold text-[#221c13]">Tag (3-4 letras)</Label>
                                <Input id="tag" name="tag" placeholder="CRL" required minLength={3} maxLength={4} disabled={isPending} className="bg-[#eee8d5] border-[#4a3e29] text-[#111] uppercase" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="description" className="text-xs font-bold text-[#221c13]">Descripción Pública</Label>
                            <Textarea id="description" name="description" placeholder="Una oferta que no podrán rechazar..." disabled={isPending} className="bg-[#eee8d5] border-[#4a3e29] text-[#111]" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="avatarUrl" className="text-xs font-bold text-[#221c13]">URL del Emblema</Label>
                            <Input id="avatarUrl" name="avatarUrl" placeholder="https://..." disabled={isPending} className="bg-[#eee8d5] border-[#4a3e29] text-[#111]" />
                        </div>
                        <button type="submit" className="retro-btn w-full py-2 text-xs font-bold min-h-[44px]" disabled={isPending}>
                            {isPending ? 'PROCESANDO...' : 'FUNDAR FAMILIA'}
                        </button>
                    </form>

                    <div className="v-outer-frame p-6 bg-[#f1ebda] flex flex-col items-center justify-center text-center gap-3 h-full">
                        <MaterialIcon name="groups" size={48} className="text-[#801e00]" />
                        <h3 className="text-sm font-bold font-['Chivo'] uppercase text-[#221c13]">¿Prefieres Unirte a un Clan?</h3>
                        <p className="text-xs text-[#4a4031]">
                            Busca entre las familias existentes, conoce a sus miembros y envía una solicitud para unirte.
                        </p>
                        <Link href="/family/find" className="retro-btn px-4 py-2 text-xs font-bold flex items-center gap-2 min-h-[44px]">
                            <MaterialIcon name="search" size={18} />
                            Buscar Familias Existentes
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
