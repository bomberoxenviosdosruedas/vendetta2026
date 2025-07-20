
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullMessage } from "@/lib/data";
import { Inbox, Trash2 } from "lucide-react";
import { MessageDetail } from "./message-detail";
import { cn } from "@/lib/utils";
import { deleteMessage, markMessageAsRead } from "@/lib/actions/message.actions";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Mensajes de {categoryName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Inbox className="h-16 w-16" />
                        <p className="mt-4 text-lg">No hay mensajes en esta carpeta</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[500px]">
                        <div className="space-y-2 pr-4">
                            {messages.map(message => (
                                <div 
                                    key={message.id} 
                                    className={cn(
                                        "p-3 rounded-lg border flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors",
                                        message.isRead ? "bg-card" : "bg-primary/10"
                                    )}
                                    onClick={() => handleSelectMessage(message)}
                                >
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            {!message.isRead && <Badge className="bg-primary h-5">Nuevo</Badge>}
                                            <p className="font-semibold truncate">{message.subject}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            De: {message.sender?.name || "Sistema"}
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex-shrink-0">
                                        {new Date(message.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => {e.stopPropagation(); handleDelete(message.id)}} disabled={isPending}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
