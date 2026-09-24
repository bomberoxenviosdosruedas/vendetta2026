'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MaterialIcon from "@/components/ui/material-icon";
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
                <button className="retro-btn px-3 py-1 text-xs font-bold flex items-center gap-1 min-h-[44px]">
                    <MaterialIcon name="add" size={16} />
                    Nuevo Mensaje
                </button>
            </DialogTrigger>
            <DialogContent className="bg-[#161410] border-2 border-[#5a4b33] text-[#dfdbc9] max-w-lg p-0 overflow-hidden">
                <DialogHeader className="crimson-th p-2">
                    <DialogTitle className="text-xs font-['Chivo'] font-bold uppercase tracking-wider text-white">
                        ENVIAR NUEVO MENSAJE
                    </DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="p-3 bg-[#f1ebda] text-[#221c13] space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="recipientId" className="text-xs font-bold">Destinatario</Label>
                        <Select name="recipientId" required>
                            <SelectTrigger className="bg-[#eee8d5] border-[#4a3e29] text-[#111] font-bold text-xs h-9">
                                <SelectValue placeholder="Selecciona un jugador..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1711] border-[#4a3e2b] text-[#dfdbc9]">
                                {otherUsers.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="subject" className="text-xs font-bold">Asunto</Label>
                        <Input id="subject" name="subject" placeholder="Asunto del mensaje" required className="bg-[#eee8d5] border-[#4a3e29] text-[#111] text-xs font-bold" />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="content" className="text-xs font-bold">Mensaje</Label>
                        <Textarea id="content" name="content" placeholder="Escribe tu mensaje aquí..." required className="bg-[#eee8d5] border-[#4a3e29] text-[#111] text-xs" />
                    </div>

                    <DialogFooter className="pt-2 flex justify-end gap-2">
                        <button type="submit" className="retro-btn px-3 py-1.5 text-xs font-bold min-h-[44px]" disabled={isPending}>
                            {isPending ? 'PROCESANDO...' : 'ENVIAR MENSAJE'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
