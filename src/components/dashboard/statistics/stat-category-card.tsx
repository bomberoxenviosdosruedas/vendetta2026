
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <div className="space-y-6 pr-4">
                        {items.map(item => {
                            const progressPercentage = item.maxValue > 0 ? (item.userValue / item.maxValue) * 100 : 0;
                            return (
                                <div key={item.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline text-sm">
                                        <span className="font-medium truncate pr-2">{item.name}</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-primary">{formatNumber(item.userValue)}</span>
                                            <span className="text-xs text-muted-foreground">/ {formatNumber(item.maxValue)}</span>
                                        </div>
                                    </div>
                                    <Progress value={progressPercentage} className="h-2" />
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
