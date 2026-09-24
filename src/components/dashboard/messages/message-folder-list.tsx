'use client';

import MaterialIcon from "@/components/ui/material-icon";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const folders = [
    { name: "Mensajes Jugadores", category: "JUGADOR", icon: <MaterialIcon name="group" size={16} /> },
    { name: "Informes de Batalla", category: "BATALLA", icon: <MaterialIcon name="shield" size={16} /> },
    { name: "Construcciones y Tropas", category: "CONSTRUCCION", icon: <MaterialIcon name="build" size={16} /> },
    { name: "Sistema", category: "SISTEMA", icon: <MaterialIcon name="settings" size={16} /> },
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
        <div className="v-outer-frame p-2 bg-[#f1ebda] space-y-2">
            <div className="v-header-c -mx-2 -mt-2 mb-2">Carpetas</div>
            <div className="flex flex-col gap-1">
                {folders.map(folder => {
                    const isSelected = selectedCategory === folder.category;
                    return (
                        <button
                            key={folder.category}
                            className={`w-full text-left px-2.5 py-2 text-xs font-bold font-['Chivo'] flex items-center gap-2 rounded-sm transition-colors ${
                                isSelected ? 'bg-[#3a3224] text-[#f7e6c4]' : 'retro-btn text-[#1a160f]'
                            }`}
                            onClick={() => handleClick(folder.category)}
                        >
                            {folder.icon}
                            <span className="truncate">{folder.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
