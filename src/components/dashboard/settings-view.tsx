'use client';

import { useState, useTransition, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserSettings } from '@/lib/actions/user.actions';
import type { UserWithProgress } from '@/lib/data';

interface SettingsViewProps {
    user: UserWithProgress;
}

export function SettingsView({ user }: SettingsViewProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState(user.name);
    const [title, setTitle] = useState(user.title || '');
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const changesMade = name !== user.name || title !== (user.title || '') || avatarUrl !== (user.avatarUrl || '');
        setHasChanges(changesMade);
    }, [name, title, avatarUrl, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await updateUserSettings({
                name,
                title,
                avatarUrl
            });

            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                });
            } else {
                toast({
                    title: '¡Éxito!',
                    description: result.success,
                });
            }
        });
    };

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        CONFIGURACIÓN Y AJUSTES DE PERFIL
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="p-3 bg-[#f1ebda] text-[#221c13] space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="name" className="text-xs font-bold">Nombre de Jugador</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isPending}
                            className="bg-[#eee8d5] border-[#4a3e29] text-[#111] font-bold text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="title" className="text-xs font-bold">Título o Rango</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: 'El Padrino', 'Capo'"
                            disabled={isPending}
                            className="bg-[#eee8d5] border-[#4a3e29] text-[#111] text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="avatarUrl" className="text-xs font-bold">URL de Avatar</Label>
                        <Input
                            id="avatarUrl"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            disabled={isPending}
                            className="bg-[#eee8d5] border-[#4a3e29] text-[#111] text-xs"
                        />
                    </div>

                    <div className="pt-2 border-t border-[#cbc4b0] flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending || !hasChanges}
                            className="retro-btn text-xs font-bold px-4 py-2 min-h-[44px] disabled:opacity-50"
                        >
                            {isPending ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
