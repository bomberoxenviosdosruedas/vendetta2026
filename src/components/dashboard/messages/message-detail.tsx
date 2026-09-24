'use client';

import { FullMessage } from "@/lib/data";
import MaterialIcon from "@/components/ui/material-icon";

interface MessageDetailProps {
    message: FullMessage;
    onBack: () => void;
}

export function MessageDetail({ message, onBack }: MessageDetailProps) {
    return (
        <div className="v-outer-frame bg-[#f1ebda] flex flex-col h-full">
            <div className="v-header-c flex items-center justify-between">
                <span className="font-bold truncate">{message.subject}</span>
                <button onClick={onBack} className="retro-btn text-xs px-2.5 py-1 font-bold flex items-center gap-1">
                    <MaterialIcon name="arrow_back" size={14} />
                    Volver
                </button>
            </div>

            <div className="p-3 space-y-3">
                <div className="p-2 bg-[#e5dfcb] border border-[#cbc4b0] rounded-sm text-xs font-['JetBrains_Mono'] space-y-0.5">
                    <div><span className="text-[#554a37] font-bold">REMITENTE:</span> <strong className="text-[#801e00]">{message.sender?.name || "Sistema"}</strong></div>
                    <div><span className="text-[#554a37] font-bold">FECHA:</span> <span className="text-[#111]">{new Date(message.createdAt).toLocaleString('es-ES')}</span></div>
                </div>

                <div className="p-3 bg-[#f1ebda] text-xs text-[#221c13] leading-relaxed whitespace-pre-wrap font-['Arimo'] border border-[#cbc4b0] rounded-sm">
                    {message.content}
                </div>
            </div>
        </div>
    );
}
