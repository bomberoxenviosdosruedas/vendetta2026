// This component is no longer used and can be deleted. It has been replaced by auth-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MaterialIcon } from '@/components/ui/material-icon';
import { registerUser } from '@/lib/actions/auth.actions';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);

    // Step 1 state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 2 state
    const [ciudad, setCiudad] = useState(1);
    const [barrio, setBarrio] = useState(1);
    const [edificio, setEdificio] = useState(1);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setStep(2);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await registerUser({
            username,
            password,
            location: { ciudad, barrio, edificio }
        });

        if (result.error) {
            setError(result.error);
            setStep(1); // Go back to credentials step if username is taken
        } else {
            toast({
                title: "¡Registro exitoso!",
                description: `Bienvenido a Vendetta, ${username}.`,
            });
            router.push('/overview');
            router.refresh();
        }

        setIsLoading(false);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                <CardDescription>
                    {step === 1 ? 'Elige tu nombre de usuario y contraseña.' : 'Elige la ubicación de tu primera propiedad.'}
                </CardDescription>
            </CardHeader>

            {step === 1 && (
                <form onSubmit={handleNextStep}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuario</Label>
                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <MaterialIcon name="terminal" size={18} className="mr-2 inline-block" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full">Siguiente</Button>
                        <p className="text-xs text-center text-muted-foreground">
                            ¿Ya tienes una cuenta?{' '}
                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={onSwitchToLogin}>
                                Inicia sesión.
                            </Button>
                        </p>
                    </CardFooter>
                </form>
            )}

            {step === 2 && (
                 <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Puedes elegir las coordenadas o dejar que el sistema te asigne una aleatoriamente si la que eliges está ocupada.</p>
                        <div className="grid grid-cols-3 gap-2">
                             <div className="space-y-2">
                                <Label htmlFor="ciudad">Ciudad</Label>
                                <Input id="ciudad" type="number" min="1" value={ciudad} onChange={(e) => setCiudad(Number(e.target.value))} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="barrio">Barrio</Label>
                                <Input id="barrio" type="number" min="1" value={barrio} onChange={(e) => setBarrio(Number(e.target.value))} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="edificio">Edificio</Label>
                                <Input id="edificio" type="number" min="1" value={edificio} onChange={(e) => setEdificio(Number(e.target.value))} required />
                            </div>
                        </div>
                         {error && (
                            <Alert variant="destructive">
                                <MaterialIcon name="terminal" size={18} className="mr-2 inline-block" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full btn-crimson" disabled={isLoading}>
                            {isLoading ? <MaterialIcon name="sync" size={18} className="animate-pulse mr-2" /> : null}
                            {isLoading ? 'PROCESANDO...' : 'Confirmar y Entrar al Juego'}
                        </Button>
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setStep(1)} disabled={isLoading}>
                            Volver
                        </Button>
                    </CardFooter>
                </form>
            )}
        </Card>
    );
}
