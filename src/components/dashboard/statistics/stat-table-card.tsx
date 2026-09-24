'use client';

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
        <div className="v-outer-frame overflow-hidden bg-[#f1ebda]">
            <div className="v-header-c">{title}</div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} className={`crimson-th p-1.5 ${index > 0 ? 'text-right' : 'text-left'}`}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cbc4b0]">
                        {data.map((row, rowIndex) => {
                            const isAlt = rowIndex % 2 === 1;
                            return (
                                <tr key={rowIndex} className={`${isAlt ? 'bg-[#e5dfcb]' : 'bg-[#f1ebda]'}`}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className={`p-2 font-mono ${cellIndex > 0 ? 'text-right font-bold text-[#801e00]' : 'text-left font-bold text-[#221c13]'}`}>
                                            {formatNumber(cell)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
