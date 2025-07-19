
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Lock, Unlock } from "lucide-react";

interface Requirement {
    id: string;
    name: string;
    level?: number;
}

interface TechItemCardProps {
    name: string;
    description: string | null;
    imageUrl: string | null;
    requirements: Requirement[];
}

export function TechItemCard({ name, description, imageUrl, requirements }: TechItemCardProps) {
    const hasRequirements = requirements.length > 0;

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-start gap-4">
                <div className="w-20 h-16 relative rounded-md overflow-hidden border flex-shrink-0">
                    <Image
                        src={imageUrl || "https://placehold.co/80x56.png"}
                        alt={name}
                        fill
                        className="object-contain"
                        data-ai-hint="game item icon"
                    />
                </div>
                <div>
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col pt-0">
                <Separator />
                <div className="pt-4 flex-grow">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        {hasRequirements ? <Lock className="h-4 w-4 text-destructive" /> : <Unlock className="h-4 w-4 text-green-500" />}
                        {hasRequirements ? "Requisitos para Desbloquear" : "Disponible desde el Inicio"}
                    </h4>
                    {hasRequirements && (
                        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
                            {requirements.map(req => (
                                <li key={req.id}>
                                    <span className="font-semibold text-foreground">{req.name}</span>
                                    {req.level && ` (Nivel ${req.level})`}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
