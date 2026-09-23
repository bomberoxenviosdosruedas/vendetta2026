
'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { loginAdmin } from "@/lib/auth-admin";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useToast } from "@/hooks/use-toast";

export function AdminLoginForm() {
    const [password, setPassword] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await loginAdmin(password);
            if (!result.success) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                });
            }
        });
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Acceso de Administrador</CardTitle>
                <CardDescription>Introduce la contraseña para acceder al panel.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full btn-crimson" disabled={isPending}>
                        {isPending && <MaterialIcon name="sync" size={18} className="mr-2 animate-pulse" />}
                        {isPending ? 'VERIFICANDO...' : 'Entrar'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
