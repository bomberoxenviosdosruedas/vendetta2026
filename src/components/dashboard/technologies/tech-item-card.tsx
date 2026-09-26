'use client';

import Image from "next/image";
import MaterialIcon from "@/components/ui/material-icon";

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
        <div className="v-outer-frame flex flex-col h-full bg-[#f1ebda] overflow-hidden">
            <div className="v-header-c flex items-center justify-between">
                <span className="font-bold truncate">{name}</span>
            </div>

            <div className="p-2.5 flex-grow flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                    <div className="w-16 h-14 relative rounded border border-[#5a4f3d] bg-[#181410] overflow-hidden shrink-0">
                        <Image
                            src={imageUrl || "https://placehold.co/80x56.png"}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-['Chivo'] font-bold text-[#801e00] text-xs uppercase truncate">
                            {name}
                        </h4>
                        {description && (
                            <p className="text-[11px] text-[#4a4031] line-clamp-2 leading-tight mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="border-t border-[#cbc4b0] pt-2 mt-auto">
                    <div className="text-[11px] font-bold text-[#221c13] flex items-center gap-1.5 mb-1">
                        {hasRequirements ? (
                            <MaterialIcon name="lock" size={14} className="text-[#c00000]" />
                        ) : (
                            <MaterialIcon name="lock_open" size={14} className="text-[#1e6b28]" />
                        )}
                        <span>{hasRequirements ? "Requisitos para desbloquear:" : "Disponible desde inicio"}</span>
                    </div>

                    {hasRequirements && (
                        <ul className="space-y-0.5 text-[11px] text-[#4a4031] list-disc pl-4">
                            {requirements.map(req => (
                                <li key={req.id}>
                                    <span className="font-bold text-[#1e1911]">{req.name}</span>
                                    {req.level && ` (Nivel ${req.level})`}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
