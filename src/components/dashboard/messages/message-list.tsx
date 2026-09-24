'use client';

import { FullMessage } from "@/lib/data";
import MaterialIcon from "@/components/ui/material-icon";
import { MessageDetail } from "./message-detail";
import { deleteMessage, markMessageAsRead } from "@/lib/actions/message.actions";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
    messages: FullMessage[];
    selectedMessage: FullMessage | null;
    setSelectedMessage: (message: FullMessage | null) => void;
    categoryName: string;
}

export function MessageList({ messages, selectedMessage, setSelectedMessage, categoryName }: MessageListProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSelectMessage = (message: FullMessage) => {
        setSelectedMessage(message);
        if (!message.isRead) {
            startTransition(async () => {
                await markMessageAsRead(message.id);
            });
        }
    }

    const handleDelete = (messageId: string) => {
        startTransition(async () => {
            const result = await deleteMessage(messageId);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Mensaje eliminado' });
                if (selectedMessage?.id === messageId) {
                    setSelectedMessage(null);
                }
            }
        });
    }

    if (selectedMessage) {
        return <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
    }

    return (
        <div className="v-outer-frame bg-[#f1ebda] flex flex-col h-full">
            <div className="v-header-c">
                Mensajes de {categoryName}
            </div>

            <div className="p-2 flex-grow">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-[#695d48]">
                        <MaterialIcon name="inbox" size={48} />
                        <p className="mt-2 text-xs font-mono font-bold">No hay mensajes en esta carpeta</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-1 pr-2">
                            {messages.map(message => (
                                <div 
                                    key={message.id} 
                                    className={`p-2 border border-[#cbc4b0] flex items-center gap-2 cursor-pointer transition-colors rounded-sm ${
                                        message.isRead ? "bg-[#f1ebda] hover:bg-[#efeadd]" : "bg-[#ffe569]/30 hover:bg-[#ffe569]/50"
                                    }`}
                                    onClick={() => handleSelectMessage(message)}
                                >
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            {!message.isRead && (
                                                <span className="timer-pill px-1.5 py-0.2 text-[9px] text-[#ff3f3f]">NUEVO</span>
                                            )}
                                            <p className="font-bold text-xs text-[#221c13] truncate">{message.subject}</p>
                                        </div>
                                        <p className="text-[11px] text-[#554a37] truncate mt-0.5">
                                            De: <strong className="text-[#801e00]">{message.sender?.name || "Sistema"}</strong>
                                        </p>
                                    </div>

                                    <div className="text-[10px] font-mono text-[#695d48] shrink-0">
                                        {new Date(message.createdAt).toLocaleDateString('es-ES')}
                                    </div>

                                    <button
                                        className="retro-btn-dark p-1 rounded-sm text-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(message.id); }}
                                        disabled={isPending}
                                        title="Eliminar mensaje"
                                    >
                                        <MaterialIcon name="delete" size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}
