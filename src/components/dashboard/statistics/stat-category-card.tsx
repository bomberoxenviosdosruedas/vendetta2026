'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import MaterialIcon from "@/components/ui/material-icon";

export interface StatItem {
    id: string;
    name: string;
    userValue: number;
    maxValue: number;
}

interface StatCategoryCardProps {
    title: string;
    items: StatItem[];
}

function formatNumber(num: number): string {
    return num.toLocaleString('de-DE');
}

export function StatCategoryCard({ title, items }: StatCategoryCardProps) {
    return (
        <div className="v-outer-frame bg-[#f1ebda]">
            <div className="v-header-c">{title}</div>
            <div className="p-3">
                <ScrollArea className="h-80">
                    <div className="space-y-3 pr-2">
                        {items.map(item => {
                            const isServerRecord = item.userValue > 0 && item.userValue === item.maxValue;
                            return (
                                <div key={item.id} className="p-2 bg-[#e5dfcb] border border-[#cbc4b0] rounded-sm text-xs font-['JetBrains_Mono']">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1">
                                            {isServerRecord && (
                                                <MaterialIcon name="emoji_events" size={16} className="text-[#ffe569]" />
                                            )}
                                            <span className="font-bold text-[#221c13]">{item.name}</span>
                                        </div>
                                        <div>
                                            <strong className="text-[#801e00]">{formatNumber(item.userValue)}</strong>
                                            <span className="text-[#695d48] text-[10px]"> / {formatNumber(item.maxValue)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
