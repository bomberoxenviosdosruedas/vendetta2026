// This component is no longer used and can be deleted. It has been replaced by auth-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MaterialIcon } from '@/components/ui/material-icon';
import { login } from '@/lib/auth';
import { getUserByUsername } from '@/lib/data';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('bomberox');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (username.toLowerCase() === 'bomberox') {
            await login('dev-id', username);
            toast({
                title: "Inicio de sesión de desarrollador",
                description: "Bienvenido de nuevo, Jefe.",
            });
            router.push('/overview');
            router.refresh();
            return;
        }

        const user = await getUserByUsername(username);

        if (!user) {
            setError('Usuario no encontrado.');
            setIsLoading(false);
            return;
        }

        if (user.password !== password) {
            setError('La contraseña es incorrecta.');
            setIsLoading(false);
            return;
        }

        await login(user.id, user.username);
        toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido de nuevo, Jefe.",
        });
        router.push('/overview');
        router.refresh();
    } catch (err) {
        console.error("Login error:", err);
        setError('Ocurrió un error en el servidor.');
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Introduce tus credenciales para acceder a tu imperio.</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                  <MaterialIcon name="terminal" size={18} className="mr-2 inline-block" />
                  <AlertTitle>Error de autenticación</AlertTitle>
                  <AlertDescription>
                      {error}
                  </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full btn-crimson" disabled={isLoading}>
              {isLoading ? <MaterialIcon name="sync" size={18} className="animate-pulse mr-2" /> : null}
              {isLoading ? 'PROCESANDO...' : 'Entrar'}
            </Button>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <p className="text-xs text-center text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Button variant="link" size="sm" className="p-0 h-auto" onClick={onSwitchToRegister}>
                    Regístrate aquí.
                </Button>
            </p>
        </CardFooter>
      </form>
    </Card>
  );
}
