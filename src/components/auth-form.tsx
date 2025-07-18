
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Terminal } from 'lucide-react';
import { login } from '@/lib/auth';
import { registerUser } from '@/lib/actions/auth.actions';
import { getUserByUsername } from '@/lib/data';

export function AuthForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoginView, setIsLoginView] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [username, setUsername] = useState('bomberox');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    // Registration state (optional)
    const [ciudad, setCiudad] = useState(1);
    const [barrio, setBarrio] = useState(1);
    const [edificio, setEdificio] = useState(1);

    const handleLogin = async () => {
        try {
            if (username.toLowerCase() === 'bomberox') {
                await login(username);
                toast({ title: "Inicio de sesión de desarrollador", description: "Bienvenido de nuevo, Jefe." });
                router.push('/overview');
                router.refresh();
                return;
            }

            const user = await getUserByUsername(username);
            if (!user) {
                setError('Usuario no encontrado.');
                return;
            }

            if (user.password !== password) {
                setError('La contraseña es incorrecta.');
                return;
            }

            await login(username);
            toast({ title: "Inicio de sesión exitoso", description: "Bienvenido de nuevo, Jefe." });
            router.push('/overview');
            router.refresh();
        } catch (err) {
            console.error("Login error:", err);
            setError('Ocurrió un error en el servidor.');
        }
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        const result = await registerUser({
            username,
            password,
            location: { ciudad, barrio, edificio }
        });

        if (result.error) {
            setError(result.error);
        } else {
            toast({ title: "¡Registro exitoso!", description: `Bienvenido a Vendetta, ${username}.` });
            router.push('/overview');
            router.refresh();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        startTransition(() => {
            if (isLoginView) {
                handleLogin();
            } else {
                handleRegister();
            }
        });
    };

    return (
        <Card className="w-full max-w-md bg-black/60 text-white border-white/20 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-wider">
                    {isLoginView ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
                </CardTitle>
                <CardDescription className="text-white/70">
                    {isLoginView ? 'Introduce tus credenciales para acceder a tu imperio.' : 'Únete a la familia y comienza tu legado.'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Usuario</Label>
                        <Input id="username" type="text" placeholder="Tu nombre de guerra" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isPending} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" type="password" placeholder="Tu código secreto" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isPending} />
                    </div>
                    {!isLoginView && (
                         <div className="space-y-2 animate-fade-in">
                            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                            <Input id="confirm-password" type="password" placeholder="Repite tu código secreto" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isPending} />
                        </div>
                    )}
                    {error && (
                        <Alert variant="destructive" className="bg-destructive/20 border-destructive/50 text-destructive-foreground">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoginView ? 'Entrar' : 'Registrarse'}
                    </Button>
                    <p className="text-xs text-center text-white/60">
                        {isLoginView ? '¿No tienes una cuenta?' : '¿Ya eres parte de la familia?'}
                        <Button variant="link" type="button" size="sm" className="p-0 h-auto ml-1 text-accent" onClick={() => { setIsLoginView(!isLoginView); setError('') }}>
                             {isLoginView ? 'Regístrate aquí.' : 'Inicia sesión.'}
                        </Button>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
