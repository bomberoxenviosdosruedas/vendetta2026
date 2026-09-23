
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserSettings } from '@/lib/actions/user.actions';
import type { UserWithProgress } from '@/lib/data';
import { MaterialIcon } from '@/components/ui/material-icon';

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
        <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ajustes de Perfil</h2>
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Tu Perfil</CardTitle>
                        <CardDescription>
                            Personaliza cómo te ven los demás en el mundo de Vendetta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de Jugador</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: 'El Padrino', 'Capo'"
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatarUrl">URL del Avatar</Label>
                            <Input
                                id="avatarUrl"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://..."
                                disabled={isPending}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="btn-crimson" disabled={isPending || !hasChanges}>
                            {isPending && <MaterialIcon name="sync" size={18} className="mr-2 animate-pulse" />}
                            {isPending ? 'GUARDANDO...' : 'Guardar Cambios'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
