'use client';

import { useState, useEffect } from 'react';
import type { UserWithProgress } from '@/lib/data';
import { useProperty } from '@/contexts/property-context';
import { calculateStorageCapacity, calcularProduccionTotalPorSegundo } from "@/lib/formulas/room-formulas";
import { cn } from "@/lib/utils";

const resourceIcons: { [key: string]: string } = {
  armas: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANPdzyWkcOPgw2W7DDsCCp2wikwr4klPOBHkerPVldcV2OrXMt0llkrLJEMxVVZRx5ys1QzYkMjz4Jwt9uCvL-l8sXiPCjFxqkZZ3FGzJ-5vpV5ypNp0mkPJVV-1AfCR6U9YqgHH2rODhUg0E3_WbEKZiWbaea42FP38igW1FlA5Y1Yyr16kmGm9UbeyrmPxYv0xoIuDst64Va7Rw2K4M2NqDJTdwPNh2jmO77qWEmexIWJR7dEg86GAj3eF1lbp8N_E8',
  municion: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVJNmkmmBHVzIkQK36ILBHq0GvGpMDLKBBHd1IM7LChA_Bc4RU8RXEYW59ZAvSpHb03vbhKPmGYw9ZWYUtiO0Mw2u4jHjD-mlUHxs14bW_RlrwdMd-S7ucyv7a1LXvZDNarQ90k2XJeW1FyEMhyGZwI7yEI7NkP5LOwSeudAG2V3AfSCkae5R7I3QGgeBj6RO2HwjVnrOvj2cyeFIDsU7KXxfYrEi9Wqz_OLZJqjuVLpffiWkqevbAlyINhbY9xf7fBYg',
  alcohol: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJfigJPQaHbVVQYIiwcVN7I4DXGtfspIdl1lSSOfRdBSvouYPF2ZolCsuP_0pgsbb6GAi2Qs3WnILsKpcc47C5VfUeWOW0RYnW7QLpj6ozCTuOgrmchUpr5mbkbQKdHnA_AtlI6R3JyAz6-us1e5Kc1IgMh9S_RU_8Vl53Aaw2tJekanexrBmqgLu6U2SQwh8qx-dVPH87A3OS-S3pS49BNlN8xhLHV9PyHyLl1J0m5kfe6Ao0WjgnMAEV4TeDpTFi7a0',
  dolares: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLcVJkpTBnikmMwaRBzEtjZeLwS1R5l8J789APZCdI8TrZpvRrvR7ojCsCL8pKUzcqDdxLYRzgGJ59NzvlIk4AZ27AUXJ0VMskWsNU319V-auvexYGmFKgPRkwWRZusQ1FrM3wd17vRukqWyHRra-n3-399Zw0WSRJNQ68AsV76LhPb68y19mxCR8ShGB-yHwnhp0nc4A_pA3WlelHdMWeKCmexn423xSL8JQQvRPuTs0iXYMlBjLhr9v2sBIWVzTcTdU',
};

function formatNumber(num: number | undefined) {
  if (typeof num !== 'number') return '0';
  return Math.floor(num).toLocaleString('de-DE');
}

interface ResourceBarProps {
  user: UserWithProgress | null;
}

export function ResourceBar({ user }: ResourceBarProps) {
  const { selectedProperty } = useProperty();

  if (!user || !selectedProperty) {
    return (
      <section className="w-full bg-[#0a0a0a] border-b border-[#333333] p-1.5">
        <p className="text-[#a0a0a0] text-xs text-center font-mono">Selecciona una propiedad para ver tus recursos.</p>
      </section>
    );
  }

  const capacity = calculateStorageCapacity(selectedProperty);
  const production = calcularProduccionTotalPorSegundo(selectedProperty);
  const prodPerHour = {
    armas: Math.floor(production.armas * 3600),
    municion: Math.floor(production.municion * 3600),
    alcohol: Math.floor(production.alcohol * 3600),
    dolares: Math.floor(production.dolares * 3600),
  };

  const resources = [
    {
      key: 'armas',
      name: 'ARMAS',
      value: selectedProperty.armas,
      icon: resourceIcons.armas,
      capacity: capacity.armas,
      color: 'text-[#ee7000]',
      fillColor: 'bg-[#ee7000]',
      prod: `+${formatNumber(prodPerHour.armas)}/h`,
    },
    {
      key: 'municion',
      name: 'MUNICIÓN',
      value: selectedProperty.municion,
      icon: resourceIcons.municion,
      capacity: capacity.municion,
      color: 'text-[#ee7000]',
      fillColor: 'bg-[#ee7000]',
      prod: `+${formatNumber(prodPerHour.municion)}/h`,
    },
    {
      key: 'alcohol',
      name: 'ALCOHOL',
      value: selectedProperty.alcohol,
      icon: resourceIcons.alcohol,
      capacity: capacity.alcohol,
      color: 'text-[#ff3f3f]',
      fillColor: 'bg-[#ff0000]',
      prod: `+${formatNumber(prodPerHour.alcohol)}/h`,
    },
    {
      key: 'dolares',
      name: 'DÓLARES',
      value: selectedProperty.dolares,
      icon: resourceIcons.dolares,
      capacity: capacity.dolares,
      color: 'text-[#00ff00]',
      fillColor: 'bg-[#00c000]',
      prod: `+${formatNumber(prodPerHour.dolares)}/h`,
    },
  ];

  return (
    <section className="w-full bg-[#0a0a0a] border-b border-[#333333] p-1.5 shrink-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 w-full">
        {resources.map((res) => {
          const percentage = res.capacity > 0 ? Math.min(100, (res.value / res.capacity) * 100) : 0;
          const isFull = percentage >= 100;

          return (
            <div
              key={res.key}
              className={cn(
                "cell-dark p-1.5 flex flex-col justify-between transition-colors",
                isFull
                  ? "border-[#93000a] bg-[#1a0808] hover:border-[#ff3f3f]"
                  : "hover:border-[#6C0000]"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <img
                    src={res.icon}
                    alt={res.name}
                    className="w-[18px] h-[16px] object-contain shrink-0"
                  />
                  <span
                    className={cn(
                      "font-bold text-[11px] uppercase tracking-wider font-['Space_Grotesk']",
                      isFull ? "text-[#ff3f3f]" : "text-[#dfdbc9]"
                    )}
                  >
                    {res.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-['Space_Mono'] font-bold tabular-nums",
                    isFull ? "text-[#ff3f3f] animate-pulse" : res.color
                  )}
                >
                  {isFull ? "[LLENO] 100%" : `${percentage.toFixed(1)}%`}
                </span>
              </div>

              <div className="mt-1 flex items-baseline justify-between font-['Space_Mono']">
                <span
                  className={cn(
                    "text-[13px] font-bold tracking-tight tabular-nums",
                    res.key === 'dolares' ? "text-[#fff400]" : isFull ? "text-[#ffdad4]" : "text-white"
                  )}
                >
                  {res.key === 'dolares' ? `$${formatNumber(res.value)}` : formatNumber(res.value)}
                </span>
                <span className={cn("text-[10px] tabular-nums", isFull ? "text-[#ff3f3f]" : "text-[#00ff00]")}>
                  {res.prod}
                </span>
              </div>

              <div
                className={cn(
                  "w-full bg-[#000000] h-1.5 mt-1 border overflow-hidden",
                  isFull ? "border-[#93000a]" : "border-[#333333]"
                )}
              >
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    res.fillColor,
                    isFull && "animate-pulse"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
