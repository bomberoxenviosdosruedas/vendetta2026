
'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { loginSuperUser } from "@/lib/actions/super-auth.actions";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function SuperAuthForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await loginSuperUser({username, password});
            if (result?.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error de Acceso',
                    description: result.error,
                });
            }
        });
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                 <Image 
                    src="/logo.jpg"
                    alt="Vendetta Logo"
                    width={200}
                    height={100}
                    className="object-contain mx-auto mb-4"
                />
                <CardTitle>Acceso Protegido</CardTitle>
                <CardDescription>Introduce las credenciales de superusuario.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="username">Superusuario</Label>
                        <Input 
                            id="username" 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isPending}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isPending}
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verificar Acceso
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
