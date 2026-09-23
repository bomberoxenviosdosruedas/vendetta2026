
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FullMessage } from "@/lib/data";
import { MaterialIcon } from "@/components/ui/material-icon";

interface MessageDetailProps {
    message: FullMessage;
    onBack: () => void;
}

export function MessageDetail({ message, onBack }: MessageDetailProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                     <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] flex-shrink-0" onClick={onBack}>
                        <MaterialIcon name="arrow_back" size={20} />
                    </Button>
                    <div className="flex-grow">
                        <CardTitle>{message.subject}</CardTitle>
                        <CardDescription>
                            De: {message.sender?.name || "Sistema"} | Recibido: {new Date(message.createdAt).toLocaleString('es-ES')}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
                <p className="whitespace-pre-wrap">{message.content}</p>
            </CardContent>
        </Card>
    );
}
