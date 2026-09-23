
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useTransition, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessage } from "@/lib/actions/message.actions";
import { UserWithProgress } from "@/lib/data";

interface ComposeMessageProps {
    allUsers: { id: string; name: string }[];
    currentUser: UserWithProgress;
}

export function ComposeMessage({ allUsers, currentUser }: ComposeMessageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await sendMessage(formData);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Mensaje enviado correctamente.' });
                setIsOpen(false);
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="btn-crimson">
                    <MaterialIcon name="add" size={18} className="mr-2" />
                    Nuevo Mensaje
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Enviar Nuevo Mensaje</DialogTitle>
                    <DialogDescription>
                        Contacta con otros jugadores de Vendetta.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="recipientId">Destinatario</Label>
                        <Select name="recipientId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un jugador..." />
                            </SelectTrigger>
                            <SelectContent>
                                {otherUsers.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="subject">Asunto</Label>
                        <Input id="subject" name="subject" placeholder="Asunto del mensaje" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="content">Mensaje</Label>
                        <Textarea id="content" name="content" placeholder="Escribe tu mensaje aquí..." required />
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="btn-crimson" disabled={isPending}>
                             {isPending && <MaterialIcon name="sync" size={18} className="mr-2 animate-pulse" />}
                             {isPending ? 'PROCESANDO...' : 'Enviar Mensaje'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
