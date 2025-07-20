
'use client';

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StatTableCardProps {
    title: string;
    headers: string[];
    data: (string | number)[][];
}

function formatNumber(value: string | number) {
    if (typeof value === 'number') {
        return value.toLocaleString('de-DE');
    }
    return value;
}

export function StatTableCard({ title, headers, data }: StatTableCardProps) {
    return (
        <Card className="overflow-hidden">
            <div className="bg-primary text-primary-foreground p-4">
                <h3 className="font-heading text-xl tracking-wider">{title}</h3>
            </div>
            <div className="bg-card">
                 <Table>
                    <TableHeader>
                        <TableRow className="border-b-white/10 hover:bg-white/5">
                            {headers.map((header, index) => (
                                <TableHead key={index} className={`font-bold text-white/90 ${index > 0 ? 'text-right' : ''}`}>
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                             <TableRow key={rowIndex} className="border-b-white/10 hover:bg-white/5">
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex} className={`${cellIndex > 0 ? 'text-right' : 'font-medium'}`}>
                                        {formatNumber(cell)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
