
'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const folders = [
    { name: "Mensajes Jugadores", category: "JUGADOR", icon: <MaterialIcon name="group" size={20} /> },
    { name: "Informes de Batalla", category: "BATALLA", icon: <MaterialIcon name="shield" size={20} /> },
    { name: "Construcciones y Tropas", category: "CONSTRUCCION", icon: <MaterialIcon name="build" size={20} /> },
    { name: "Sistema", category: "SISTEMA", icon: <MaterialIcon name="settings" size={20} /> },
];

interface MessageFolderListProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
}

export function MessageFolderList({ selectedCategory, setSelectedCategory }: MessageFolderListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleClick = (category: string) => {
        setSelectedCategory(category);
        const params = new URLSearchParams(searchParams);
        params.set('categoria', category);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold px-2">Carpetas</h3>
            <div className="flex flex-col gap-1">
                {folders.map(folder => (
                    <Button
                        key={folder.category}
                        variant={selectedCategory === folder.category ? "default" : "ghost"}
                        className="w-full justify-start gap-3 px-4 py-6 text-base"
                        onClick={() => handleClick(folder.category)}
                    >
                        {folder.icon}
                        <span>{folder.name}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
