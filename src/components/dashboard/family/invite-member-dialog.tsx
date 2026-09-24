'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MaterialIcon from "@/components/ui/material-icon";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { inviteUserToFamily } from "@/lib/actions/family.actions";

interface InviteMemberDialogProps {
    familyId: string;
    allUsers: { id: string; name: string }[];
}

export function InviteMemberDialog({ familyId, allUsers }: InviteMemberDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleInvite = async () => {
        if (!selectedUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes seleccionar a un jugador.' });
            return;
        }

        startTransition(async () => {
            const result = await inviteUserToFamily(selectedUser, familyId);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Invitación enviada correctamente.' });
                setIsOpen(false);
                setSelectedUser(null);
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="retro-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1 min-h-[44px]">
                    <MaterialIcon name="person_add" size={16} />
                    Invitar Miembro
                </button>
            </DialogTrigger>
            <DialogContent className="bg-[#161410] border-2 border-[#5a4b33] text-[#dfdbc9] max-w-md p-0 overflow-hidden">
                <DialogHeader className="crimson-th p-2">
                    <DialogTitle className="text-xs font-['Chivo'] font-bold uppercase tracking-wider text-white">
                        INVITAR A UN JUGADOR
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 bg-[#f1ebda] text-[#221c13] space-y-3">
                    <Label htmlFor="user-select" className="text-xs font-bold">Selecciona Jugador sin Familia</Label>
                    <Select onValueChange={setSelectedUser}>
                        <SelectTrigger id="user-select" className="bg-[#eee8d5] border-[#4a3e29] text-[#111] font-bold text-xs h-9">
                            <SelectValue placeholder="Selecciona un jugador..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1711] border-[#4a3e2b] text-[#dfdbc9]">
                            {allUsers.length > 0 ? (
                                allUsers.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>No hay jugadores disponibles.</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="p-2.5 bg-[#dfdbc9] border-t border-[#cbc4b0] flex justify-end gap-2">
                    <button onClick={() => setIsOpen(false)} className="retro-btn-dark px-3 py-1.5 text-xs font-bold min-h-[44px]">
                        CANCELAR
                    </button>
                    <button onClick={handleInvite} disabled={isPending || !selectedUser} className="retro-btn px-3 py-1.5 text-xs font-bold min-h-[44px] disabled:opacity-50">
                        {isPending ? 'PROCESANDO...' : 'ENVIAR INVITACIÓN'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
